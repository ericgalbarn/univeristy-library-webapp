import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/db";
import { borrowRecords, users, books } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRecord = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userRecord.length || userRecord[0].role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch borrow records with related data using SQL joins
    const borrowRequests = await db
      .select({
        // Borrow record fields
        id: borrowRecords.id,
        userId: borrowRecords.userId,
        bookId: borrowRecords.bookId,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        returnDate: borrowRecords.returnDate,
        status: borrowRecords.status,
        createdAt: borrowRecords.createdAt,
        // User fields
        userName: users.fullName,
        userEmail: users.email,
        universityId: users.universityId,
        // Book fields
        bookTitle: books.title,
        bookAuthor: books.author,
        bookGenre: books.genre,
      })
      .from(borrowRecords)
      .leftJoin(users, eq(borrowRecords.userId, users.id))
      .leftJoin(books, eq(borrowRecords.bookId, books.id))
      .orderBy(desc(borrowRecords.createdAt));

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Book Requests");

    // Define the columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "User Name", key: "userName", width: 20 },
      { header: "Email", key: "userEmail", width: 30 },
      { header: "University ID", key: "universityId", width: 15 },
      { header: "Book Title", key: "bookTitle", width: 30 },
      { header: "Author", key: "bookAuthor", width: 20 },
      { header: "Genre", key: "bookGenre", width: 15 },
      { header: "Borrow Date", key: "borrowDate", width: 15 },
      { header: "Due Date", key: "dueDate", width: 15 },
      { header: "Return Date", key: "returnDate", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    // Add the borrow requests to the worksheet
    borrowRequests.forEach((request) => {
      worksheet.addRow({
        id: request.id,
        userName: request.userName,
        userEmail: request.userEmail,
        universityId: request.universityId,
        bookTitle: request.bookTitle,
        bookAuthor: request.bookAuthor,
        bookGenre: request.bookGenre,
        borrowDate: formatDate(request.borrowDate),
        dueDate: formatDate(request.dueDate),
        returnDate: request.returnDate ? formatDate(request.returnDate) : "",
        status: request.status,
      });
    });

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set the headers for the response
    const headers = {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=book-requests.xlsx",
    };

    // Return the Excel file
    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Error exporting borrow requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export borrow requests" },
      { status: 500 }
    );
  }
}

// Helper function to format dates safely
function formatDate(date: any): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date) || "";
  }
}
