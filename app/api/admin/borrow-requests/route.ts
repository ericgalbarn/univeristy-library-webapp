import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { borrowRecords, users, books } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";

// GET handler to fetch all borrow records
export async function GET(req: NextRequest) {
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

    // Fetch borrow records with related data using SQL joins
    const borrowRequests = await db
      .select({
        // Borrow record fields
        id: borrowRecords.id,
        userId: borrowRecords.userId,
        bookId: borrowRecords.bookId,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        returnDate: borrowRecords.returnDate,
        status: borrowRecords.status,
        createdAt: borrowRecords.createdAt,
        // User fields
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          universityId: users.universityId,
        },
        // Book fields
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          genre: books.genre,
          coverUrl: books.coverUrl,
          coverColor: books.coverColor,
        },
      })
      .from(borrowRecords)
      .leftJoin(users, eq(borrowRecords.userId, users.id))
      .leftJoin(books, eq(borrowRecords.bookId, books.id))
      .orderBy(desc(borrowRecords.createdAt));

    return NextResponse.json({ success: true, requests: borrowRequests });
  } catch (error) {
    console.error("Error fetching borrow requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch borrow requests" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new borrow record (not used in admin panel directly)
export async function POST(req: NextRequest) {
  try {
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

    // Parse request body
    const body = await req.json();
    const { userId, bookId, dueDate } = body;

    if (!userId || !bookId || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists.length) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if book exists and has available copies
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

    if (bookRecord[0].availableCopies < 1) {
      return NextResponse.json(
        { success: false, error: "No available copies" },
        { status: 400 }
      );
    }

    // Insert the new borrow record - using execute for more direct control
    const result = await db.execute(
      sql`INSERT INTO borrow_records 
          (user_id, book_id, borrow_date, due_date, status) 
          VALUES 
          (${userId}, ${bookId}, NOW(), ${dueDate}, 'BORROWED')
          RETURNING *`
    );

    if (!result.rows || !result.rows.length) {
      throw new Error("Failed to create borrow record");
    }

    // Update available copies
    await db
      .update(books)
      .set({
        availableCopies: bookRecord[0].availableCopies - 1,
      })
      .where(eq(books.id, bookId));

    return NextResponse.json({
      success: true,
      borrowRecord: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating borrow record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create borrow record" },
      { status: 500 }
    );
  }
}
