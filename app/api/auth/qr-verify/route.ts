import { db } from "@/db/db";
import { qrLoginSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is logged in and has email
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in with an email to verify QR code",
        },
        { status: 401 }
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Find the session
    const [sessionRecord] = await db
      .select()
      .from(qrLoginSessions)
      .where(eq(qrLoginSessions.token, token));

    if (!sessionRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid QR code" },
        { status: 400 }
      );
    }

    // Check if session is expired
    if (sessionRecord.expiresAt < new Date()) {
      await db.delete(qrLoginSessions).where(eq(qrLoginSessions.token, token));
      return NextResponse.json(
        { success: false, error: "QR code has expired" },
        { status: 400 }
      );
    }

    // Update the session with user info
    await db
      .update(qrLoginSessions)
      .set({
        email: session.user.email,
        verified: true,
      })
      .where(eq(qrLoginSessions.token, token));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying QR code:", error);
    return NextResponse.json(
      { success: false, error: "Error verifying QR code" },
      { status: 500 }
    );
  }
}
