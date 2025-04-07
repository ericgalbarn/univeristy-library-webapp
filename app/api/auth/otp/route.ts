import { NextResponse } from "next/server";
import { db } from "@/db";
import { otpTable, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    console.log("OTP endpoint called");

    // Check database connection
    try {
      await db.query.users.findFirst();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { success: false, error: "Database connection error" },
        { status: 500 }
      );
    }

    const { email } = await req.json();
    console.log("Received request with email:", email);

    // Validate email
    if (!email || !isValidEmail(email)) {
      console.log("Invalid email format:", email);
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Find user
    console.log("Attempting to find user with email:", email);
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User found, generating OTP");
    // Generate OTP (6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    console.log("Storing OTP in database...");
    try {
      // First, delete any existing OTP for this user and type
      await db
        .delete(otpTable)
        .where(
          and(eq(otpTable.userId, user.id), eq(otpTable.type, "password_reset"))
        );

      // Then insert the new OTP
      const hashedOTP = await bcrypt.hash(otp, 10);
      console.log("Generated OTP:", otp);
      console.log("Hashed OTP:", hashedOTP);

      await db.insert(otpTable).values({
        userId: user.id,
        otp: hashedOTP,
        type: "password_reset",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });

      console.log("OTP stored successfully");
    } catch (dbError) {
      console.error("Database error while storing OTP:", dbError);
      if (dbError instanceof Error) {
        console.error("Database error details:", {
          message: dbError.message,
          stack: dbError.stack,
          name: dbError.name,
        });
      }
      return NextResponse.json(
        { success: false, error: "Failed to store OTP" },
        { status: 500 }
      );
    }

    // Send email with OTP
    console.log("Attempting to send OTP email...");
    const emailResult = await sendOTPEmail(email, otp);
    console.log("Email sending result:", JSON.stringify(emailResult, null, 2));

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    console.log("OTP email sent successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in OTP endpoint:", error);
    // Log the full error object
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
