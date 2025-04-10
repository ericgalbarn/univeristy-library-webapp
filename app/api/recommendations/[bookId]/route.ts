import { NextResponse } from "next/server";
import { getBookRecommendations } from "@/lib/recommendation/engine";

export async function GET(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const bookId = params.bookId;

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Get recommendations
    const recommendations = await getBookRecommendations(bookId);

    // Return the recommendations
    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get recommendations",
      },
      { status: 500 }
    );
  }
}
