import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/db";
import { users } from "@/db/schema";
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

    // Parse query parameters
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status") || "ALL";

    // Build query
    const baseQuery = db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        status: users.status,
        createAt: users.createAt,
      })
      .from(users);

    // Execute query with or without status filter
    let accountRequests;

    if (statusParam !== "ALL") {
      // Validate the status parameter against enum values
      if (["PENDING", "APPROVED", "REJECTED"].includes(statusParam)) {
        accountRequests = await baseQuery
          .where(
            eq(users.status, statusParam as "PENDING" | "APPROVED" | "REJECTED")
          )
          .orderBy(desc(users.createAt));
      } else {
        // Default to all if invalid status provided
        accountRequests = await baseQuery.orderBy(desc(users.createAt));
      }
    } else {
      // Get all users
      accountRequests = await baseQuery.orderBy(desc(users.createAt));
    }

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Account Requests");

    // Define the columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "University ID", key: "universityId", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Request Date", key: "createAt", width: 20 },
    ];

    // Add styling to the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };

    // Add the account requests to the worksheet
    accountRequests.forEach((request) => {
      worksheet.addRow({
        id: request.id,
        fullName: request.fullName,
        email: request.email,
        universityId: request.universityId,
        status: request.status,
        createAt: formatDate(request.createAt),
      });
    });

    // Apply conditional formatting for different statuses
    for (let i = 2; i <= accountRequests.length + 1; i++) {
      const statusCell = worksheet.getCell(`E${i}`);
      if (statusCell.value === "APPROVED") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F4EA" }, // Light green
        };
      } else if (statusCell.value === "REJECTED") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCE8E6" }, // Light red
        };
      } else if (statusCell.value === "PENDING") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF8E1" }, // Light amber
        };
      }
    }

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set the headers for the response
    const headers = {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=account-requests.xlsx",
    };

    // Return the Excel file
    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Error exporting account requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export account requests" },
      { status: 500 }
    );
  }
}

// Helper function to format dates safely
function formatDate(date: any): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date) || "";
  }
}
