import { db } from "@/db/db";
import { qrLoginSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!token) {
      return NextResponse.redirect(
        new URL("/error?message=Invalid QR code", baseUrl)
      );
    }

    // Get the current session
    const session = await auth();

    // Check if user is logged in and has email
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL(
          "/error?message=You must be logged in to verify QR code",
          baseUrl
        )
      );
    }

    // Find the session
    const [sessionRecord] = await db
      .select()
      .from(qrLoginSessions)
      .where(eq(qrLoginSessions.token, token));

    if (!sessionRecord) {
      return NextResponse.redirect(
        new URL("/error?message=Invalid QR code", baseUrl)
      );
    }

    // Check if the logged-in user's email matches the QR code email
    if (sessionRecord.email !== session.user.email) {
      return NextResponse.redirect(
        new URL(
          "/error?message=You must be logged in with the same email used to generate the QR code",
          baseUrl
        )
      );
    }

    // Check if session is expired
    if (sessionRecord.expiresAt < new Date()) {
      await db.delete(qrLoginSessions).where(eq(qrLoginSessions.token, token));
      return NextResponse.redirect(
        new URL("/error?message=QR code has expired", baseUrl)
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

    // Display success page
    return NextResponse.redirect(new URL("/qr-success", baseUrl));
  } catch (error) {
    console.error("Error processing QR code login:", error);
    return NextResponse.redirect(
      new URL("/error?message=Error processing QR code", baseUrl)
    );
  }
}
