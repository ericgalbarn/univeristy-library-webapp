import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { borrowRecords, users, books } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";

// PUT handler to mark a book as returned
export async function PUT(
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

    const id = params.id;

    // Check if the borrow record exists
    const borrowRecord = await db
      .select({
        id: borrowRecords.id,
        bookId: borrowRecords.bookId,
        status: borrowRecords.status,
      })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, id))
      .limit(1);

    if (!borrowRecord.length) {
      return NextResponse.json(
        { success: false, error: "Borrow record not found" },
        { status: 404 }
      );
    }

    if (borrowRecord[0].status === "RETURNED") {
      return NextResponse.json(
        { success: false, error: "Book already returned" },
        { status: 400 }
      );
    }

    // Use raw SQL for the update to handle the date
    const result = await db.execute(
      sql`UPDATE borrow_records 
          SET status = 'RETURNED', return_date = NOW() 
          WHERE id = ${id} 
          RETURNING *`
    );

    if (!result.rows || !result.rows.length) {
      throw new Error("Failed to update borrow record");
    }

    // Get book ID from the borrow record
    const bookId = borrowRecord[0].bookId;

    // Get current available copies
    const bookRecord = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookRecord.length) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    // Increment available copies
    await db
      .update(books)
      .set({
        availableCopies: bookRecord[0].availableCopies + 1,
      })
      .where(eq(books.id, bookId));

    return NextResponse.json({
      success: true,
      borrowRecord: result.rows[0],
    });
  } catch (error) {
    console.error("Error returning book:", error);
    return NextResponse.json(
      { success: false, error: "Failed to return book" },
      { status: 500 }
    );
  }
}
