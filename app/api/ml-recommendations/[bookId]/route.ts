import { NextResponse } from "next/server";

// URL of the Python API - configurable based on environment
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:5000";

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

    // Get the URL parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "5";

    // Forward the request to the Python API
    const response = await fetch(
      `${PYTHON_API_URL}/api/recommendations/${bookId}?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python API error:", errorText);

      return NextResponse.json(
        { success: false, error: "Failed to get ML recommendations" },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();

    // Return the recommendations
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting ML recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get ML recommendations",
      },
      { status: 500 }
    );
  }
}
