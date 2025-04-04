import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { borrowRecords, users, books } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
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

    // Check if book exists
    const bookExists = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookExists.length) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    // Fetch borrowers with detailed information
    const borrowers = await db
      .select({
        id: borrowRecords.id,
        userId: borrowRecords.userId,
        bookId: borrowRecords.bookId,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        returnDate: borrowRecords.returnDate,
        status: borrowRecords.status,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
      })
      .from(borrowRecords)
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(eq(borrowRecords.bookId, bookId))
      .orderBy(desc(borrowRecords.borrowDate));

    return NextResponse.json({
      success: true,
      borrowers,
    });
  } catch (error) {
    console.error("Error fetching book borrowers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch book borrowers" },
      { status: 500 }
    );
  }
}
