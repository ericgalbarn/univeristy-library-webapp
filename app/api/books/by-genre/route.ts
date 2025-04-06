import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { books } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    // Authentication - ensure user is logged in
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all books ordered by recently added
    const allBooks = await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt));

    // Get unique genres
    const genresResult = await db
      .select({ genre: books.genre })
      .from(books)
      .groupBy(books.genre)
      .orderBy(books.genre);

    // Extract unique genres
    const genres = genresResult.map((g) => g.genre);

    // Organize books by genre
    const booksByGenre = genres.map((genre) => {
      const genreBooks = allBooks.filter((book) => book.genre === genre);
      return {
        genre,
        books: genreBooks,
      };
    });

    return NextResponse.json({
      success: true,
      genres,
      booksByGenre,
    });
  } catch (error) {
    console.error("Error fetching books by genre:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch books by genre" },
      { status: 500 }
    );
  }
}
