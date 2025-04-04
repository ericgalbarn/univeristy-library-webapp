import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { users, STATUS_ENUM } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";

// GET handler to fetch all pending account requests
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
    const statusParam = url.searchParams.get("status") || "PENDING";

    // Build query
    const baseQuery = db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
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
        // Default to PENDING if invalid status provided
        accountRequests = await baseQuery
          .where(eq(users.status, "PENDING"))
          .orderBy(desc(users.createAt));
      }
    } else {
      // Get all requests without status filtering
      accountRequests = await baseQuery.orderBy(desc(users.createAt));
    }

    return NextResponse.json({ success: true, requests: accountRequests });
  } catch (error) {
    console.error("Error fetching account requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch account requests" },
      { status: 500 }
    );
  }
}

// PUT handler to update account status (approve or reject)
export async function PUT(req: NextRequest) {
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

    // Parse request body
    const body = await req.json();
    const { userId, status, reason } = body;

    if (!userId || !status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Update user status with type assertion
    const result = await db
      .update(users)
      .set({
        status: status as "APPROVED" | "REJECTED",
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        status: users.status,
        universityCard: users.universityCard,
      });

    if (!result.length) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Here we could send an email notification to the user (optional)
    // const mailService = new MailService();
    // await mailService.sendStatusNotification(result[0].email, status, reason);

    return NextResponse.json({
      success: true,
      user: result[0],
    });
  } catch (error) {
    console.error("Error updating account status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update account status" },
      { status: 500 }
    );
  }
}

// Batch update endpoint for handling multiple account requests at once
export async function PATCH(req: NextRequest) {
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

    // Parse request body
    const body = await req.json();
    const { userIds, status } = body;

    if (
      !userIds ||
      !Array.isArray(userIds) ||
      !userIds.length ||
      !status ||
      !["APPROVED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Convert array of userIds to SQL-friendly format
    const userIdsParam = userIds.map((id) => `'${id}'`).join(",");

    // Update multiple user statuses using raw SQL for better performance with large batches
    const result = await db.execute(
      sql`UPDATE users 
          SET status = ${status as "APPROVED" | "REJECTED"} 
          WHERE id IN (${sql.raw(userIdsParam)}) 
          RETURNING id, full_name, email, status`
    );

    if (!result.rows || !result.rows.length) {
      return NextResponse.json(
        { success: false, error: "No users were updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error batch updating account status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update account statuses" },
      { status: 500 }
    );
  }
}
