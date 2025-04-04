import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { books, users } from "@/db/schema";
import { desc, eq, asc, like, sql } from "drizzle-orm";
import { auth } from "@/auth";

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

    // Parse query params
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get("search") || "";
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const genre = url.searchParams.get("genre") || "";

    // Base query
    let query = db.select().from(books);

    // Apply search filter if provided
    if (searchTerm) {
      query = query.where(
        sql`${books.title} ILIKE ${`%${searchTerm}%`} OR ${books.author} ILIKE ${`%${searchTerm}%`}`
      );
    }

    // Apply genre filter if provided
    if (genre) {
      query = query.where(eq(books.genre, genre));
    }

    // Apply sorting
    if (sortOrder === "asc") {
      query = query.orderBy(asc(books[sortBy as keyof typeof books]));
    } else {
      query = query.orderBy(desc(books[sortBy as keyof typeof books]));
    }

    // Execute query
    const allBooks = await query;

    // Get unique genres for filter options
    const genres = await db
      .select({ genre: books.genre })
      .from(books)
      .groupBy(books.genre);

    return NextResponse.json({
      success: true,
      books: allBooks,
      genres: genres.map((g) => g.genre),
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
