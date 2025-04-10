import { db } from "@/db/db";
import { bookRequests, books } from "@/db/schema";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  reviewNote: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const requestId = params.id;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the book request
    const bookRequest = await db
      .select()
      .from(bookRequests)
      .where(eq(bookRequests.id, requestId))
      .limit(1);

    if (bookRequest.length === 0) {
      return NextResponse.json(
        { success: false, error: "Book request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bookRequest: bookRequest[0],
    });
  } catch (error) {
    console.error("Error fetching book request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch book request" },
      { status: 500 }
    );
  }
}

// Handle both PUT and POST for the form submission
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();
  const method = formData.get("_method");

  // If this is a form submission with _method=PUT, handle as PUT
  if (method === "PUT") {
    const status = formData.get("status") as string;
    const reviewNote = formData.get("reviewNote") as string;

    // Validation
    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    return handleStatusUpdate(
      params.id,
      status as "APPROVED" | "REJECTED",
      reviewNote
    );
  }

  return NextResponse.json(
    { success: false, error: "Invalid request method" },
    { status: 405 }
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const body = await req.json();
    const result = updateStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { status, reviewNote } = result.data;
    return handleStatusUpdate(requestId, status, reviewNote);
  } catch (error) {
    console.error("Error updating book request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update book request" },
      { status: 500 }
    );
  }
}

async function handleStatusUpdate(
  requestId: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  reviewNote?: string
) {
  try {
    const session = await auth();

    // Check if user is logged in and is an admin
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the book request to be updated
    const bookRequestResult = await db
      .select()
      .from(bookRequests)
      .where(eq(bookRequests.id, requestId))
      .limit(1);

    if (bookRequestResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Book request not found" },
        { status: 404 }
      );
    }

    const bookRequest = bookRequestResult[0];

    // Update the book request status
    await db
      .update(bookRequests)
      .set({
        status,
        reviewNote: reviewNote || null,
        updatedAt: new Date(),
      })
      .where(eq(bookRequests.id, requestId));

    // If approved, create the book in the books table
    if (status === "APPROVED") {
      await db.insert(books).values({
        title: bookRequest.title,
        author: bookRequest.author,
        genre: bookRequest.genre,
        rating: bookRequest.rating,
        coverUrl: bookRequest.coverUrl,
        coverColor: bookRequest.coverColor,
        description: bookRequest.description,
        totalCopies: bookRequest.totalCopies,
        availableCopies: bookRequest.availableCopies,
        videoUrl: bookRequest.videoUrl,
        summary: bookRequest.summary,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Book request ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error updating book request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update book request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const requestId = params.id;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the request exists
    const bookRequest = await db
      .select()
      .from(bookRequests)
      .where(eq(bookRequests.id, requestId))
      .limit(1);

    if (bookRequest.length === 0) {
      return NextResponse.json(
        { success: false, error: "Book request not found" },
        { status: 404 }
      );
    }

    // Ensure the user is either an admin or the creator of the request
    const isOwner = bookRequest[0].userId === session.user.id;

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this request",
        },
        { status: 403 }
      );
    }

    // Delete the book request
    await db.delete(bookRequests).where(eq(bookRequests.id, requestId));

    return NextResponse.json({
      success: true,
      message: "Book request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete book request" },
      { status: 500 }
    );
  }
}
