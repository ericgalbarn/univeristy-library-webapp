import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/db";
import { users, books, borrowRecords as borrowings } from "@/db/schema";
import { count, desc, eq, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await db
      .select({
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.user.id as string))
      .limit(1);

    if (!adminUser.length || adminUser[0].role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required" },
        { status: 403 }
      );
    }

    // Count total users
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "USER"));
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Count total books
    const totalBooksResult = await db.select({ count: count() }).from(books);
    const totalBooks = totalBooksResult[0]?.count || 0;

    // Count pending account requests
    const pendingRequestsResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "PENDING"));
    const pendingAccountRequests = pendingRequestsResult[0]?.count || 0;

    // Count active borrowings (books that have been borrowed but not returned)
    const activeBorrowingsResult = await db
      .select({ count: count() })
      .from(borrowings)
      .where(isNull(borrowings.returnDate));
    const activeBorrowings = activeBorrowingsResult[0]?.count || 0;

    // Get recent activity data
    // Get recently registered users
    const recentRegisteredUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        createAt: users.createAt,
      })
      .from(users)
      .where(eq(users.role, "USER"))
      .orderBy(desc(users.createAt))
      .limit(3);

    // Get recent borrowings
    const recentBorrowings = await db
      .select({
        id: borrowings.id,
        userId: borrowings.userId,
        bookId: borrowings.bookId,
        createAt: borrowings.createdAt,
      })
      .from(borrowings)
      .orderBy(desc(borrowings.createdAt))
      .limit(3);

    // Get book and user details for borrowings
    const borrowingDetails = await Promise.all(
      recentBorrowings.map(async (borrowing) => {
        const user = await db
          .select({
            fullName: users.fullName,
          })
          .from(users)
          .where(eq(users.id, borrowing.userId))
          .limit(1);

        const book = await db
          .select({
            title: books.title,
          })
          .from(books)
          .where(eq(books.id, borrowing.bookId))
          .limit(1);

        return {
          id: borrowing.id,
          type: "BOOK_BORROWED",
          userName: user[0]?.fullName || "Unknown User",
          bookTitle: book[0]?.title || "Unknown Book",
          timestamp:
            borrowing.createAt?.toISOString() || new Date().toISOString(),
        };
      })
    );

    // Get recent pending requests
    const recentPendingRequests = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        createAt: users.createAt,
      })
      .from(users)
      .where(eq(users.status, "PENDING"))
      .orderBy(desc(users.createAt))
      .limit(2);

    // Format the activity data
    const recentActivity = [
      ...recentRegisteredUsers.map((user) => ({
        id: user.id,
        type: "USER_REGISTERED",
        userName: user.fullName,
        timestamp: user.createAt?.toISOString() || new Date().toISOString(),
      })),
      ...borrowingDetails,
      ...recentPendingRequests.map((user) => ({
        id: `request-${user.id}`,
        type: "ACCOUNT_REQUEST",
        userName: user.fullName,
        status: "PENDING",
        timestamp: user.createAt?.toISOString() || new Date().toISOString(),
      })),
    ]
      .sort((a, b) => {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      })
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        pendingAccountRequests,
        activeBorrowings,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
