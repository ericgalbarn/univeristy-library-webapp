import { NextResponse } from "next/server";
import { db } from "@/db";
import { otpTable, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    // Validation
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Find and validate OTP
    const storedOTP = await db.query.otpTable.findFirst({
      where: and(
        eq(otpTable.userId, user.id),
        eq(otpTable.type, "password_reset")
      ),
    });

    console.log("Stored OTP record:", storedOTP);
    console.log("Received OTP:", otp);

    if (!storedOTP) {
      console.log("No OTP found for user");
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > storedOTP.expiresAt) {
      console.log("OTP expired at:", storedOTP.expiresAt);
      return NextResponse.json(
        { success: false, error: "OTP has expired" },
        { status: 400 }
      );
    }

    // Verify OTP
    console.log("Comparing OTPs...");
    console.log("Stored hashed OTP:", storedOTP.otp);
    const isValidOTP = await bcrypt.compare(otp, storedOTP.otp);
    console.log("OTP comparison result:", isValidOTP);

    if (!isValidOTP) {
      console.log("OTP verification failed");
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, user.id));

    // Remove used OTP
    await db
      .delete(otpTable)
      .where(
        and(eq(otpTable.userId, user.id), eq(otpTable.type, "password_reset"))
      );

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
