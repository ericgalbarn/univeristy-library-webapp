import { db } from "@/db/db";
import { qrLoginSessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";

// Schema for validation
const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if the user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check user status
    if (
      existingUser[0].status !== "APPROVED" &&
      existingUser[0].role !== "ADMIN"
    ) {
      let errorMessage = "Account access denied. Please contact support.";

      if (existingUser[0].status === "PENDING") {
        errorMessage =
          "Your account is pending approval. Please wait for admin verification.";
      } else if (existingUser[0].status === "REJECTED") {
        errorMessage =
          "Your account registration has been rejected. Please contact support.";
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 403 }
      );
    }

    // Generate a unique token for the QR code
    const token = uuidv4();

    // Delete any existing QR sessions for this email
    await db.delete(qrLoginSessions).where(eq(qrLoginSessions.email, email));

    // Set expiration time (10 minutes from now)
    const expiresAt = add(new Date(), { minutes: 10 });

    // Create a new QR login session
    await db.insert(qrLoginSessions).values({
      email,
      token,
      verified: false,
      expiresAt,
    });

    // Return the token to be encoded in QR code
    return NextResponse.json({
      success: true,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
