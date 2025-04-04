import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/workflow";
import { generateWelcomeEmail } from "@/lib/emailTemplates";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, universityId } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and fullName are required",
        },
        { status: 400 }
      );
    }

    // Generate and send welcome email directly
    const emailHtml = await generateWelcomeEmail({ fullName, universityId });

    await sendEmail({
      email,
      subject: "Welcome to the University Library",
      message: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Welcome email sent to ${email}. Check your inbox in a few moments.`,
    });
  } catch (error) {
    console.error("Error in direct test signup:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Simple UI for testing signup
export async function GET() {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Direct Test Signup</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.5;
          color: #333;
        }
        h1 { color: #232839; }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 2rem 0;
        }
        input, button {
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #ddd;
          font-size: 1rem;
        }
        button {
          background-color: #E7C9A5;
          color: #232839;
          font-weight: bold;
          cursor: pointer;
          border: none;
        }
        button:hover {
          background-color: #d9b78e;
        }
        #result {
          margin-top: 2rem;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #ddd;
          min-height: 100px;
        }
        .success { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>Direct Test Signup for Email</h1>
      <p>This form directly sends a welcome email without creating a user. Enter your real email to receive the welcome email.</p>
      
      <form id="signupForm">
        <input type="email" id="email" placeholder="Your email" required />
        <input type="text" id="fullName" placeholder="Your full name" required />
        <input type="text" id="universityId" placeholder="University ID (optional)" />
        <button type="submit">Send Welcome Email</button>
      </form>
      
      <div id="result"></div>
      
      <script>
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = 'Sending email...';
          resultDiv.className = '';
          
          try {
            const response = await fetch('/api/test-signup-direct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: document.getElementById('email').value,
                fullName: document.getElementById('fullName').value,
                universityId: document.getElementById('universityId').value,
              }),
            });
            
            const data = await response.json();
            
            if (data.success) {
              resultDiv.innerHTML = data.message;
              resultDiv.className = 'success';
            } else {
              resultDiv.innerHTML = 'Error: ' + data.error;
              resultDiv.className = 'error';
            }
          } catch (error) {
            resultDiv.innerHTML = 'Error: ' + error.message;
            resultDiv.className = 'error';
          }
        });
      </script>
    </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
