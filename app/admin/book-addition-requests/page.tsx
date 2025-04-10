import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { bookRequests, users } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";

const BookAdditionRequestsPage = async () => {
  const session = await auth();

  // Verify admin access
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin/book-addition-requests");
  }

  try {
    // Fetch all book requests with user information (join)
    const allBookRequests = await db
      .select({
        request: bookRequests,
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          universityId: users.universityId,
        },
      })
      .from(bookRequests)
      .leftJoin(users, eq(bookRequests.userId, users.id))
      .orderBy(desc(bookRequests.createdAt));

    // Count by status
    const statusCounts = {
      PENDING: allBookRequests.filter((r) => r.request.status === "PENDING")
        .length,
      APPROVED: allBookRequests.filter((r) => r.request.status === "APPROVED")
        .length,
      REJECTED: allBookRequests.filter((r) => r.request.status === "REJECTED")
        .length,
      TOTAL: allBookRequests.length,
    };

    return (
      <div className="container p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Book Addition Requests</h1>
            <p className="text-gray-500 mt-1">
              Manage book requests submitted by users
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">
              Total Requests
            </h3>
            <p className="text-2xl font-bold mt-1">{statusCounts.TOTAL}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-yellow-500 text-sm font-medium">Pending</h3>
            <p className="text-2xl font-bold mt-1">{statusCounts.PENDING}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-green-500 text-sm font-medium">Approved</h3>
            <p className="text-2xl font-bold mt-1">{statusCounts.APPROVED}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-red-500 text-sm font-medium">Rejected</h3>
            <p className="text-2xl font-bold mt-1">{statusCounts.REJECTED}</p>
          </div>
        </div>

        {/* Requests list */}
        {allBookRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-gray-600">
              No book requests yet
            </h3>
            <p className="text-gray-500 mt-1">
              There are no book addition requests from users at this time.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      When
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allBookRequests.map((item) => (
                    <tr key={item.request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.request.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.request.genre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.request.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.fullName || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.user?.email || "No email available"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(
                          new Date(item.request.createdAt || new Date()),
                          { addSuffix: true }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.request.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : item.request.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.request.status.charAt(0) +
                            item.request.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button asChild size="sm" className="mr-2">
                          <Link
                            href={`/admin/book-addition-requests/${item.request.id}`}
                          >
                            Review
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading book requests:", error);
    return (
      <div className="container p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Book Addition Requests</h1>
            <p className="text-gray-500 mt-1">
              Manage book requests submitted by users
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-gray-600">
            Error Loading Requests
          </h3>
          <p className="text-gray-500 mt-1">
            There was an error loading book requests. Please try again later.
          </p>
        </div>
      </div>
    );
  }
};

export default BookAdditionRequestsPage;
