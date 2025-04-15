import { db } from "@/db/db";
import { borrowRecords, books, users } from "@/db/schema";
import { sendEmail } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { eq, and, lt, gte } from "drizzle-orm";
import { generateBookReturnReminderEmail } from "@/lib/emailTemplates";

type InitialData = {
  // This workflow doesn't need initial data as it will run on a schedule
  // and check for all books due soon
};

// Define the thresholds for sending reminders (in days)
const REMINDER_THRESHOLDS = [7, 3, 1]; // Send reminders 7 days, 3 days, and 1 day before due date

export const { POST } = serve<InitialData>(async (context) => {
  // This workflow runs on a schedule to check for books that are due soon
  // and sends reminder emails to users

  while (true) {
    await context.run("check-due-books", async () => {
      const today = new Date();

      // For each reminder threshold, find books due in that many days
      for (const daysRemaining of REMINDER_THRESHOLDS) {
        // Calculate the target date
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysRemaining);

        // Format dates for SQL query (YYYY-MM-DD)
        const targetDateStr = targetDate.toISOString().split("T")[0];

        // Find all active borrow records with due dates matching the target date
        const dueSoonRecords = await db
          .select({
            borrowId: borrowRecords.id,
            userId: borrowRecords.userId,
            bookId: borrowRecords.bookId,
            dueDate: borrowRecords.dueDate,
          })
          .from(borrowRecords)
          .where(
            and(
              eq(borrowRecords.status, "BORROWED"),
              eq(borrowRecords.dueDate, targetDateStr)
            )
          );

        console.log(
          `Found ${dueSoonRecords.length} books due in ${daysRemaining} days`
        );

        // For each record, get user and book details and send a reminder email
        for (const record of dueSoonRecords) {
          try {
            // Get user details
            const userResult = await db
              .select({
                fullName: users.fullName,
                email: users.email,
              })
              .from(users)
              .where(eq(users.id, record.userId))
              .limit(1);

            if (userResult.length === 0) {
              console.error(
                `User not found for borrow record ${record.borrowId}`
              );
              continue;
            }

            // Get book details
            const bookResult = await db
              .select({
                title: books.title,
              })
              .from(books)
              .where(eq(books.id, record.bookId))
              .limit(1);

            if (bookResult.length === 0) {
              console.error(
                `Book not found for borrow record ${record.borrowId}`
              );
              continue;
            }

            const user = userResult[0];
            const book = bookResult[0];

            // Generate and send reminder email
            const emailHtml = await generateBookReturnReminderEmail({
              fullName: user.fullName,
              bookTitle: book.title,
              dueDate: record.dueDate,
              daysRemaining,
              borrowId: record.borrowId,
            });

            await sendEmail({
              email: user.email,
              subject:
                daysRemaining <= 2
                  ? `URGENT: Your book "${book.title}" is due in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}!`
                  : `Reminder: Your book "${book.title}" is due in ${daysRemaining} days`,
              message: emailHtml,
            });

            console.log(
              `Sent ${daysRemaining}-day reminder to ${user.email} for book "${book.title}"`
            );
          } catch (error) {
            console.error(
              `Error processing reminder for borrow record ${record.borrowId}:`,
              error
            );
          }
        }
      }
    });

    // Run this workflow once a day
    await context.sleep("wait-for-next-day", 60 * 60 * 24);
  }
});
