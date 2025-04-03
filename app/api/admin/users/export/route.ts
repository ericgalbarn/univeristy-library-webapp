import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { generateUsersExcel } from "@/lib/utils/excel";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      console.error("Unauthorized access attempt to export users");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is an admin
    const userRecord = await db
      .select({
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userRecord.length || userRecord[0].role !== "ADMIN") {
      console.error("Non-admin user attempted to export users");
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch all users
    console.log("Fetching users for export...");
    const allUsers = await db.select().from(users);
    console.log(`Retrieved ${allUsers.length} users for export`);

    // Generate Excel file
    console.log("Generating Excel file...");
    const buffer = await generateUsersExcel(allUsers);
    console.log("Excel file generated successfully");

    // Create response with Excel file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="users-list.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
