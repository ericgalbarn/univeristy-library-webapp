import { db } from "@/db/db";
import { bookRequests } from "@/db/schema";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for validation
const bookRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().min(1, "Genre is required"),
  rating: z.number().min(1).max(5),
  coverUrl: z.string().min(1, "Cover image is required"),
  coverColor: z.string().min(1, "Cover color is required"),
  description: z.string().min(1, "Description is required"),
  totalCopies: z.number().min(1, "At least 1 copy is required"),
  availableCopies: z.number().min(0),
  videoUrl: z.string().min(1, "Video URL is required"),
  summary: z.string().min(1, "Summary is required"),
});

// POST handler to create a new book request
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
    const result = bookRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          issues: result.error.issues,
        },
        { status: 400 }
      );
    }

    const bookRequestData = result.data;
    const userId = session.user.id as string;

    // Insert the book request
    const [newBookRequest] = await db
      .insert(bookRequests)
      .values({
        userId,
        ...bookRequestData,
        status: "PENDING",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Book request submitted successfully",
      bookRequest: newBookRequest,
    });
  } catch (error) {
    console.error("Error creating book request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit book request" },
      { status: 500 }
    );
  }
}

// GET handler to fetch user's book requests
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

    // Get requests for a specific user, or for admin, all requests
    let userRequests;

    if (url.searchParams.get("all") === "true") {
      // Check if user is admin to fetch all requests
      userRequests = await db
        .select()
        .from(bookRequests)
        .orderBy(bookRequests.createdAt);
    } else {
      // For regular users, only get their own requests
      userRequests = await db
        .select()
        .from(bookRequests)
        .where(eq(bookRequests.userId, userId))
        .orderBy(bookRequests.createdAt);
    }

    return NextResponse.json({
      success: true,
      bookRequests: userRequests,
    });
  } catch (error) {
    console.error("Error fetching book requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch book requests" },
      { status: 500 }
    );
  }
}
