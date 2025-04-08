import { db } from "@/db/db";
import { qrLoginSessions } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  console.log("QR login POST request received");

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { email } = body;

    if (!email) {
      console.log("No email provided");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a unique token
    const token = uuidv4();
    console.log("Generated token:", token);

    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    console.log("Expiration time:", expiresAt);

    // Create a new QR login session
    const [session] = await db
      .insert(qrLoginSessions)
      .values({
        email,
        token,
        expiresAt,
        verified: false,
      })
      .returning();

    if (!session) {
      console.error("Failed to create session in database");
      return NextResponse.json(
        { error: "Failed to create QR session" },
        { status: 500 }
      );
    }

    console.log("Session created successfully:", session);

    return NextResponse.json({
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Error in QR login POST:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
