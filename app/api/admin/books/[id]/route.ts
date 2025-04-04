import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { books, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin status
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRecord = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userRecord.length || userRecord[0].role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const bookId = params.id;

    // Fetch the book details
    const bookDetails = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookDetails.length) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      book: bookDetails[0],
    });
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch book details" },
      { status: 500 }
    );
  }
}
