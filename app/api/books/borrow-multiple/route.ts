import { auth } from "@/auth";
import { db } from "@/db/db";
import { books, borrowRecords, users } from "@/db/schema";
import ratelimit from "@/lib/ratelimit";
import { eq, and, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Define types for borrowed books
type BorrowedBook = {
  id: string;
  title: string;
  recordId: string | null;
};

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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

    // Get the user data
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userData[0];

    // Check if user is allowed to borrow
    if (user.status !== "APPROVED" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Your account is not approved for borrowing books" },
        { status: 403 }
      );
    }

    // Parse request body
    let bookIds: string[];
    try {
      const body = await req.json();
      bookIds = body.bookIds;

      if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
        return NextResponse.json(
          { error: "No books selected for borrowing" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    try {
      // Get all the books
      const booksData = await db
        .select()
        .from(books)
        .where(inArray(books.id, bookIds));

      if (booksData.length !== bookIds.length) {
        return NextResponse.json(
          { error: "One or more books not found" },
          { status: 404 }
        );
      }

      // Check if all books are available
      const unavailableBooks = booksData.filter(
        (book) => book.availableCopies <= 0
      );
      if (unavailableBooks.length > 0) {
        return NextResponse.json(
          {
            error: "Some books are not available for borrowing",
            unavailableBooks: unavailableBooks.map((book) => book.title),
          },
          { status: 400 }
        );
      }

      // Calculate due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const dueDateString = dueDate.toISOString().split("T")[0];

      // Since transactions aren't supported, we'll do sequential operations
      const borrowedBooks: BorrowedBook[] = [];

      // For each book, create a borrow record and update available copies
      for (const book of booksData) {
        try {
          // Create borrow record using raw SQL
          const result = await db.execute(
            sql`INSERT INTO borrow_records 
                (user_id, book_id, due_date, status) 
                VALUES 
                (${userId}, ${book.id}, ${dueDateString}, 'BORROWED')
                RETURNING id`
          );

          // Extract the record ID with proper type checking
          let recordId: string | null = null;
          if (result.rows && result.rows.length > 0 && result.rows[0].id) {
            recordId = String(result.rows[0].id);
          }

          // Update available copies
          await db
            .update(books)
            .set({ availableCopies: book.availableCopies - 1 })
            .where(eq(books.id, book.id));

          borrowedBooks.push({
            id: book.id,
            title: book.title,
            recordId,
          });
        } catch (err) {
          console.error(`Error processing book ${book.id}:`, err);
          // Continue with other books even if one fails
        }
      }

      // If no books were borrowed successfully, return an error
      if (borrowedBooks.length === 0) {
        return NextResponse.json(
          { error: "Failed to borrow any books" },
          { status: 500 }
        );
      }

      // If some books were borrowed but not all, include a partial success message
      const allSuccess = borrowedBooks.length === bookIds.length;

      return NextResponse.json({
        success: true,
        partial: !allSuccess,
        message: allSuccess
          ? `Successfully borrowed ${borrowedBooks.length} books`
          : `Successfully borrowed ${borrowedBooks.length} out of ${bookIds.length} books`,
        dueDate: dueDate.toISOString(),
        borrowedBooks,
      });
    } catch (error) {
      console.error("Database operation error:", error);
      return NextResponse.json(
        {
          error: `Database error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error borrowing books:", error);
    return NextResponse.json(
      {
        error: `Failed to borrow books: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
