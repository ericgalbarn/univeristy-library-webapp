import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { books, users } from "@/db/schema";
import { desc, eq, asc, sql } from "drizzle-orm";
import { auth } from "@/auth";
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

    // Parse query params
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get("search") || "";
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const genre = url.searchParams.get("genre") || "";

    // Base query
    let query = db.select().from(books);

    // Apply search filter if provided
    if (searchTerm) {
      query = query.where(
        sql`${books.title} ILIKE ${`%${searchTerm}%`} OR ${books.author} ILIKE ${`%${searchTerm}%`}`
      );
    }

    // Apply genre filter if provided
    if (genre) {
      query = query.where(eq(books.genre, genre));
    }

    // Apply sorting
    if (sortOrder === "asc") {
      query = query.orderBy(asc(books[sortBy as keyof typeof books]));
    } else {
      query = query.orderBy(desc(books[sortBy as keyof typeof books]));
    }

    // Execute query
    const allBooks = await query;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Library Admin";
    workbook.created = new Date();

    // Add worksheet
    const worksheet = workbook.addWorksheet("Books");

    // Define columns
    worksheet.columns = [
      { header: "Title", key: "title", width: 40 },
      { header: "Author", key: "author", width: 30 },
      { header: "Genre", key: "genre", width: 20 },
      { header: "Rating", key: "rating", width: 10 },
      { header: "Total Copies", key: "totalCopies", width: 15 },
      { header: "Available Copies", key: "availableCopies", width: 15 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6F0FF" },
    };
    headerRow.border = {
      bottom: { style: "thin" },
    };

    // Add data rows
    allBooks.forEach((book) => {
      worksheet.addRow({
        title: book.title,
        author: book.author,
        genre: book.genre,
        rating: book.rating,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        createdAt: formatDate(book.createdAt),
      });
    });

    // Format cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Apply conditional formatting for availability
        const availableCell = row.getCell("availableCopies");
        const totalCell = row.getCell("totalCopies");

        if (availableCell.value === 0) {
          availableCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFEEEE" }, // light red
          };
        } else if (Number(availableCell.value) < Number(totalCell.value) / 3) {
          availableCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFF8E6" }, // light amber
          };
        } else {
          availableCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3FCEF" }, // light green
          };
        }
      }

      // Align cells
      row.alignment = { vertical: "middle" };
    });

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set(
      "Content-Disposition",
      'attachment; filename="books-export.xlsx"'
    );

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error exporting books:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export books" },
      { status: 500 }
    );
  }
}

// Helper function to format date
function formatDate(date: Date | null): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "";
  }
}
