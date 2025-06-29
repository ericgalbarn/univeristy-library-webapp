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

  console.log("🔍 SignUp called with params:", {
    fullName,
    email,
    universityId,
    universityCardLength: universityCard?.length || 0,
    hasUniversityCard: !!universityCard,
  });

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  // Check for existing user
  console.log("🔍 Checking for existing user with email:", email);
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("❌ User already exists:", email);
    return { success: false, error: "User already exists" };
  }

  console.log("✅ No existing user found, proceeding with signup");

  // Validate required fields
  if (!fullName || !email || !password) {
    console.log("❌ Missing required fields:", {
      fullName: !!fullName,
      email: !!email,
      password: !!password,
    });
    return { success: false, error: "Missing required fields" };
  }

  // Handle universityCard - provide fallback for testing
  const finalUniversityCard =
    universityCard || `placeholder-card-${Date.now()}`;
  console.log("🔍 Using universityCard:", finalUniversityCard);

  const hashedPassword = await hash(password, 10);
  console.log("✅ Password hashed successfully");

  try {
    console.log("🔍 Attempting database insert...");
    const insertResult = await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard: finalUniversityCard,
    });

    console.log("✅ Database insert successful:", insertResult);

    // Try to trigger workflow, but don't fail signup if it fails
    try {
      console.log("🔍 Attempting to trigger onboarding workflow...");
      await workflowClient.trigger({
        url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
        body: {
          email,
          fullName,
          universityId,
        },
      });
      console.log("✅ Onboarding workflow triggered successfully");
    } catch (workflowError) {
      console.error(
        "⚠️ Workflow trigger failed (non-blocking):",
        workflowError
      );
      // Don't fail the signup if workflow fails
    }

    // Try to send development email, but don't fail signup if it fails
    if (process.env.NODE_ENV === "development") {
      try {
        console.log("🔍 Attempting to send development email...");
        const { generateWelcomeEmail } = await import("@/lib/emailTemplates");
        const { sendEmail } = await import("@/lib/workflow");

        const welcomeEmail = await generateWelcomeEmail({
          fullName,
          universityId: universityId?.toString(),
        });
        await sendEmail({
          email,
          subject: "Welcome to the University Library (DEV)",
          message: welcomeEmail,
        });
        console.log("✅ Development welcome email sent successfully");
      } catch (emailError) {
        console.error(
          "⚠️ Failed to send development email (non-blocking):",
          emailError
        );
        // Don't fail the signup if email fails
      }
    }

    console.log("✅ Signup completed successfully for:", email);
    return {
      success: true,
      message:
        "Your account has been created and is pending approval. You'll be notified once approved.",
    };
  } catch (error) {
    console.error("❌ Database insert failed:", error);

    // Provide more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Check for specific database errors
      if (error.message.includes("duplicate key")) {
        return {
          success: false,
          error: "An account with this email or university ID already exists",
        };
      } else if (error.message.includes("violates not-null constraint")) {
        return { success: false, error: "Missing required information" };
      } else if (error.message.includes("invalid input syntax")) {
        return { success: false, error: "Invalid data format provided" };
      }

      return { success: false, error: `Signup failed: ${error.message}` };
    }

    return {
      success: false,
      error: "An unexpected error occurred during signup",
    };
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
