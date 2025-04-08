import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { books } from "@/db/schema";
import { desc, eq, asc, and, gte, lte, like, or, sql } from "drizzle-orm";
import { auth } from "@/auth";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date | null;
  videoUrl: string;
  summary: string;
};

// Define valid sort fields and orders
const validSortFields = [
  "title",
  "author",
  "rating",
  "createdAt",
  "availableCopies",
];
const validSortOrders = ["asc", "desc"];

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

    // Parse query parameters
    const url = new URL(req.url);
    const selectedGenre = url.searchParams.get("genre");
    const genresOnly = url.searchParams.get("genresOnly") === "true";
    const showAllBooks = url.searchParams.get("showAll") === "true";

    // Filter parameters
    const searchQuery = url.searchParams.get("search") || "";
    const sortByParam = url.searchParams.get("sortBy") || "createdAt";
    const sortOrderParam = url.searchParams.get("sortOrder") || "desc";
    const minRating = url.searchParams.get("minRating")
      ? parseInt(url.searchParams.get("minRating")!)
      : null;
    const maxRating = url.searchParams.get("maxRating")
      ? parseInt(url.searchParams.get("maxRating")!)
      : null;
    const availability = url.searchParams.get("availability"); // "all", "available", "unavailable"
    const firstLetter = url.searchParams.get("firstLetter"); // New parameter for A-Z filtering

    // Validate sort parameters
    const sortBy = validSortFields.includes(sortByParam)
      ? sortByParam
      : "createdAt";
    const sortOrder = validSortOrders.includes(sortOrderParam)
      ? sortOrderParam
      : "desc";

    // Get unique genres (we always need this)
    const genresResult = await db
      .select({ genre: books.genre })
      .from(books)
      .groupBy(books.genre)
      .orderBy(books.genre);

    // Extract unique genres
    const genres = genresResult.map((g) => g.genre);

    // If only genres are requested, return early
    if (genresOnly) {
      return NextResponse.json({
        success: true,
        genres,
      });
    }

    // Build the query with filters
    const conditions = [];

    // Genre filter (primary filter) - skip this if showAllBooks is true
    if (selectedGenre && !showAllBooks) {
      conditions.push(eq(books.genre, selectedGenre));
    }

    // Search filter (title or author) - use sql template for case-insensitive search
    if (searchQuery) {
      conditions.push(
        or(
          sql`LOWER(${books.title}) LIKE LOWER(${`%${searchQuery}%`})`,
          sql`LOWER(${books.author}) LIKE LOWER(${`%${searchQuery}%`})`
        )
      );
    }

    // First letter filter
    if (firstLetter) {
      conditions.push(
        sql`LOWER(${books.title}) LIKE LOWER(${`${firstLetter}%`})`
      );
    }

    // Rating filter - both min and max must be present for exact match
    if (minRating !== null && maxRating !== null && minRating === maxRating) {
      // For exact rating matching (e.g., exactly 4 stars)
      conditions.push(eq(books.rating, minRating));
    } else {
      // For range-based filtering
      if (minRating !== null) {
        conditions.push(gte(books.rating, minRating));
      }
      if (maxRating !== null) {
        conditions.push(lte(books.rating, maxRating));
      }
    }

    // Availability filter
    if (availability === "available") {
      conditions.push(gte(books.availableCopies, 1));
    } else if (availability === "unavailable") {
      conditions.push(eq(books.availableCopies, 0));
    }

    // Execute the query with all constraints
    let filteredBooks;

    // Apply filter conditions if any exist
    const baseQuery =
      conditions.length > 0
        ? db
            .select()
            .from(books)
            .where(and(...conditions))
        : db.select().from(books);

    // Apply sorting based on the validated parameters
    if (sortBy === "title") {
      filteredBooks = await (sortOrder === "asc"
        ? baseQuery.orderBy(asc(books.title))
        : baseQuery.orderBy(desc(books.title)));
    } else if (sortBy === "author") {
      filteredBooks = await (sortOrder === "asc"
        ? baseQuery.orderBy(asc(books.author))
        : baseQuery.orderBy(desc(books.author)));
    } else if (sortBy === "rating") {
      filteredBooks = await (sortOrder === "asc"
        ? baseQuery.orderBy(asc(books.rating))
        : baseQuery.orderBy(desc(books.rating)));
    } else if (sortBy === "availableCopies") {
      filteredBooks = await (sortOrder === "asc"
        ? baseQuery.orderBy(asc(books.availableCopies))
        : baseQuery.orderBy(desc(books.availableCopies)));
    } else {
      // default to createdAt
      filteredBooks = await (sortOrder === "asc"
        ? baseQuery.orderBy(asc(books.createdAt))
        : baseQuery.orderBy(desc(books.createdAt)));
    }

    // If this is the initial view (showAllBooks) or a specific genre, return books directly
    if (showAllBooks || selectedGenre) {
      return NextResponse.json({
        success: true,
        genres,
        books: filteredBooks,
        selectedGenre,
        showAllBooks,
        filters: {
          search: searchQuery,
          sortBy,
          sortOrder,
          minRating,
          maxRating,
          availability,
        },
        totalCount: filteredBooks.length,
      });
    } else {
      // Otherwise, organize by genre
      const booksByGenre = genres.map((genre) => {
        const genreBooks = filteredBooks.filter(
          (book: Book) => book.genre === genre
        );
        return {
          genre,
          books: genreBooks,
          count: genreBooks.length,
        };
      });

      // Filter out empty genres
      const nonEmptyGenres = booksByGenre.filter((g) => g.books.length > 0);

      return NextResponse.json({
        success: true,
        genres,
        booksByGenre: nonEmptyGenres,
        filters: {
          search: searchQuery,
          sortBy,
          sortOrder,
          minRating,
          maxRating,
          availability,
        },
        totalCount: filteredBooks.length,
      });
    }
  } catch (error) {
    console.error("Error fetching books by genre:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch books by genre" },
      { status: 500 }
    );
  }
}
