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
    if (!session?.user?.id) {
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

    // If already favorited, return success but no change (idempotent)
    if (existingFavorite.length > 0) {
      return NextResponse.json({
        success: true,
        favorited: true,
        message: "Book is already in favorites",
      });
    }

    // Add it to favorites
    await db.insert(favoriteBooks).values({
      userId: userId,
      bookId,
    });

    return NextResponse.json({
      success: true,
      favorited: true,
      message: "Book added to favorites",
    });
  } catch (error) {
    console.error("Error adding book to favorites:", error);
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
    if (!session?.user?.id) {
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
        and(eq(favoriteBooks.userId, userId), eq(favoriteBooks.bookId, bookId))
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

// DELETE endpoint to remove a book from favorites
export async function DELETE(req: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    // Check if user is logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // Parse the request body
    const body = await req.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { success: false, error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Delete the favorite record
    await db
      .delete(favoriteBooks)
      .where(
        and(eq(favoriteBooks.userId, userId), eq(favoriteBooks.bookId, bookId))
      );

    return NextResponse.json({
      success: true,
      favorited: false,
      message: "Book removed from favorites",
    });
  } catch (error) {
    console.error("Error removing book from favorites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}
