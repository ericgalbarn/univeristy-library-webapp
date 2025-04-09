import { auth } from "@/auth";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 400 }
      );
    }

    // Get user data
    const userData = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        universityId: users.universityId,
        status: users.status,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userData[0],
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
