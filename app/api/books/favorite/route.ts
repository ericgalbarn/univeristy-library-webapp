import { db } from "@/db/db";
import { favoriteBooks } from "@/db/schema";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Schema for validation
const requestSchema = z.object({
  bookId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    // Check if user is logged in
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "You must be logged in" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { bookId } = result.data;
    const userId = session.user.id as string;

    // Check if the book is already favorited
    const existingFavorite = await db
      .select()
      .from(favoriteBooks)
      .where(
        and(eq(favoriteBooks.userId, userId), eq(favoriteBooks.bookId, bookId))
      )
      .limit(1);

    // If already favorited, remove it (toggle off)
    if (existingFavorite.length > 0) {
      await db
        .delete(favoriteBooks)
        .where(
          and(
            eq(favoriteBooks.userId, userId as string),
            eq(favoriteBooks.bookId, bookId)
          )
        );

      return NextResponse.json({
        success: true,
        favorited: false,
        message: "Book removed from favorites",
      });
    }

    // Otherwise, add it to favorites (toggle on)
    await db.insert(favoriteBooks).values({
      userId: userId as string,
      bookId,
    });

    return NextResponse.json({
      success: true,
      favorited: true,
      message: "Book added to favorites",
    });
  } catch (error) {
    console.error("Error toggling book favorite status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update favorites" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a book is favorited
export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    // Check if user is logged in
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const url = new URL(req.url);
    const bookId = url.searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { success: false, error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Check if the book is favorited
    const existingFavorite = await db
      .select()
      .from(favoriteBooks)
      .where(
        and(
          eq(favoriteBooks.userId, userId as string),
          eq(favoriteBooks.bookId, bookId as string)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      favorited: existingFavorite.length > 0,
    });
  } catch (error) {
    console.error("Error checking book favorite status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check favorite status" },
      { status: 500 }
    );
  }
}
