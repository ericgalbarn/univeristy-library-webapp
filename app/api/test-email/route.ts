import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/workflow";
import { generateWelcomeEmail } from "@/lib/emailTemplates";

export async function GET(request: NextRequest) {
  try {
    // Get email from query parameter or use default
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email") || "test@example.com";
    const fullName = searchParams.get("name") || "Test User";
    const universityId = searchParams.get("id") || "TEST123";

    // Generate and send welcome email
    const emailHtml = await generateWelcomeEmail({ fullName, universityId });

    // Log the first part of the HTML to inspect
    console.log(
      "Generated HTML (first 300 chars):",
      emailHtml.substring(0, 300)
    );

    await sendEmail({
      email,
      subject: "Test Welcome Email",
      message: emailHtml,
    });

    return NextResponse.json({
      success: true,
      emailLength: emailHtml.length,
      message: `Email sent to ${email}. Please check your inbox.`,
      previewHTML: emailHtml.substring(0, 300) + "...",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
