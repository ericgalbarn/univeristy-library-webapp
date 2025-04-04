"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "../workflow";
import config from "../config";

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
