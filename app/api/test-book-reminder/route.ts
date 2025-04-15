import { NextRequest, NextResponse } from "next/server";
import { generateBookReturnReminderEmail } from "@/lib/emailTemplates";
import { sendEmail } from "@/lib/workflow";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");

    // If no email parameter is provided, return the HTML form instead of an error
    if (!email) {
      return renderTestForm();
    }

    const fullName = searchParams.get("fullName") || "Library Member";
    const bookTitle = searchParams.get("bookTitle") || "The Great Gatsby";
    const dueDate =
      searchParams.get("dueDate") ||
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const daysRemaining = parseInt(searchParams.get("daysRemaining") || "3");
    const borrowId = searchParams.get("borrowId") || "test-borrow-id";

    // Generate and send book return reminder email
    const emailHtml = await generateBookReturnReminderEmail({
      fullName,
      bookTitle,
      dueDate,
      daysRemaining,
      borrowId,
    });

    // Log the first part of the HTML to inspect
    console.log(
      "Generated HTML (first 300 chars):",
      emailHtml.substring(0, 300)
    );

    const subject =
      daysRemaining <= 2
        ? `URGENT: Your book "${bookTitle}" is due in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}!`
        : `Reminder: Your book "${bookTitle}" is due in ${daysRemaining} days`;

    // Send email using the workflow library's sendEmail function
    await sendEmail({
      email,
      subject: subject,
      message: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Book return reminder email sent to ${email}`,
      emailLength: emailHtml.length,
      previewHTML: emailHtml.substring(0, 300) + "...",
    });
  } catch (error) {
    console.error("Error sending test book reminder email:", error);
    return NextResponse.json(
      {
        error: `Failed to send email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

// Helper function to render the HTML form
function renderTestForm() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Book Return Reminder Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button {
            background-color: #232839;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #333;
          }
          .result {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            display: none;
          }
        </style>
      </head>
      <body>
        <h1>Test Book Return Reminder Email</h1>
        <p>Use this form to test the book return reminder email template.</p>
        
        <form id="emailForm">
          <div class="form-group">
            <label for="email">Email Address (required)</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" name="fullName" placeholder="Library Member">
          </div>
          
          <div class="form-group">
            <label for="bookTitle">Book Title</label>
            <input type="text" id="bookTitle" name="bookTitle" placeholder="The Great Gatsby">
          </div>
          
          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input type="date" id="dueDate" name="dueDate">
          </div>
          
          <div class="form-group">
            <label for="daysRemaining">Days Remaining</label>
            <select id="daysRemaining" name="daysRemaining">
              <option value="7">7 days</option>
              <option value="3" selected>3 days</option>
              <option value="2">2 days (urgent)</option>
              <option value="1">1 day (urgent)</option>
            </select>
          </div>
          
          <button type="submit">Send Test Email</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <script>
          document.getElementById('emailForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const params = new URLSearchParams();
            
            for (const [key, value] of formData.entries()) {
              params.append(key, value);
            }
            
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Sending email...';
            
            try {
              const response = await fetch(\`/api/test-book-reminder?\${params.toString()}\`);
              const data = await response.json();
              
              if (response.ok) {
                resultDiv.innerHTML = \`<p style="color: green;">✅ Success! Email sent to \${formData.get('email')}</p>\`;
              } else {
                resultDiv.innerHTML = \`<p style="color: red;">❌ Error: \${data.error || 'Unknown error'}</p>\`;
              }
            } catch (error) {
              resultDiv.innerHTML = \`<p style="color: red;">❌ Error: \${error.message}</p>\`;
            }
          });
          
          // Set default due date to 3 days from now
          const dueDateInput = document.getElementById('dueDate');
          const defaultDueDate = new Date();
          defaultDueDate.setDate(defaultDueDate.getDate() + 3);
          dueDateInput.value = defaultDueDate.toISOString().split('T')[0];
        </script>
      </body>
    </html>
  `;

  return new Response(htmlContent, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

// For POST requests, also return the form
export async function POST() {
  return renderTestForm();
}
