import { NextRequest, NextResponse } from "next/server";
import { generateWelcomeEmail } from "@/lib/emailTemplates";

export async function GET(request: NextRequest) {
  try {
    // Get parameters from query
    const searchParams = request.nextUrl.searchParams;
    const fullName = searchParams.get("name") || "Test User";
    const universityId = searchParams.get("id") || "TEST123";

    // Generate email HTML
    const emailHtml = await generateWelcomeEmail({ fullName, universityId });

    // Return HTML directly
    return new NextResponse(emailHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating email preview:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
