"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { qrLoginSessions, users } from "@/db/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "../workflow";
import config from "../config";
import { z } from "zod";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("pending approval")) {
        return {
          success: false,
          error:
            "Your account is pending approval. Please wait for admin verification.",
        };
      } else if (result.error.includes("rejected")) {
        return {
          success: false,
          error:
            "Your account registration has been rejected. Please contact support.",
        };
      } else if (result.error.includes("access denied")) {
        return {
          success: false,
          error: "Account access denied. Please contact support.",
        };
      }

      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityId, password, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
      body: {
        email,
        fullName,
        universityId,
      },
    });

    // For local development, also send a direct email using our new templates
    // Remove this in production
    if (process.env.NODE_ENV === "development") {
      const { generateWelcomeEmail } = await import("@/lib/emailTemplates");
      const { sendEmail } = await import("@/lib/workflow");

      try {
        const welcomeEmail = await generateWelcomeEmail({
          fullName,
          universityId: universityId?.toString(),
        });
        await sendEmail({
          email,
          subject: "Welcome to the University Library (DEV)",
          message: welcomeEmail,
        });
        console.log("Development welcome email sent directly");
      } catch (error) {
        console.error("Failed to send development email:", error);
      }
    }

    return {
      success: true,
      message:
        "Your account has been created and is pending approval. You'll be notified once approved.",
    };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};

export const generateQRCode = async (email: string) => {
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success: rateSuccess } = await ratelimit.limit(ip);

  if (!rateSuccess) return redirect("/too-fast");

  try {
    // Validate the email
    const result = z.string().email().safeParse(email);
    if (!result.success) {
      return { success: false, error: "Invalid email format" };
    }

    // Make API call to generate QR code
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/qr-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to generate QR code",
      };
    }

    return {
      success: true,
      token: data.token,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error("QR code generation error:", error);
    return { success: false, error: "Failed to generate QR code" };
  }
};

export const checkQRVerificationStatus = async (token: string) => {
  try {
    const session = await db
      .select()
      .from(qrLoginSessions)
      .where(eq(qrLoginSessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return { success: false, error: "QR code not found" };
    }

    // Check if the session is expired
    if (new Date() > new Date(session[0].expiresAt)) {
      // Delete the expired session
      await db
        .delete(qrLoginSessions)
        .where(eq(qrLoginSessions.id, session[0].id));

      return { success: false, error: "QR code has expired" };
    }

    // If verified, perform login
    if (session[0].verified) {
      // Delete the session after successful verification
      await db
        .delete(qrLoginSessions)
        .where(eq(qrLoginSessions.id, session[0].id));

      // Login the user
      await signIn("credentials", {
        email: session[0].email,
        qrLogin: true, // Special flag for QR login
        redirect: false,
      });

      return { success: true };
    }

    // Not verified yet
    return { success: false, verified: false };
  } catch (error) {
    console.error("QR verification check error:", error);
    return { success: false, error: "Failed to check QR verification status" };
  }
};
