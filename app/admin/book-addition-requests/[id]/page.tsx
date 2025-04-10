import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { bookRequests, users } from "@/db/schema";
import BookCover from "@/components/BookCover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Textarea } from "@/components/ui/textarea";
import BookRequestActions from "./actions";

interface Props {
  params: {
    id: string;
  };
}

const BookRequestDetailPage = async ({ params }: Props) => {
  const session = await auth();
  const { id } = params;

  // Verify admin access
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin/book-addition-requests");
  }

  try {
    // Fetch the book request with user information
    const bookRequestResult = await db
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
      .where(eq(bookRequests.id, id))
      .limit(1);

    // If the request doesn't exist, redirect to the requests page
    if (bookRequestResult.length === 0) {
      redirect("/admin/book-addition-requests");
    }

    const { request, user } = bookRequestResult[0];

    // Function to map status to badge
    const getStatusBadge = (status: string) => {
      switch (status) {
        case "APPROVED":
          return <Badge className="bg-green-500">Approved</Badge>;
        case "REJECTED":
          return <Badge className="bg-red-500">Rejected</Badge>;
        default:
          return <Badge className="bg-yellow-500">Pending</Badge>;
      }
    };

    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Book Request Review</h1>
          <Button asChild variant="outline">
            <Link href="/admin/book-addition-requests">Back to Requests</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Cover */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex justify-center">
              <div className="w-56">
                <BookCover
                  coverColor={request.coverColor}
                  coverImage={request.coverUrl}
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{request.title}</h2>
                  <p className="text-lg text-gray-600">{request.author}</p>
                </div>
                <div>{getStatusBadge(request.status)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">Genre</h3>
                  <p>{request.genre}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">Rating</h3>
                  <p>{request.rating} / 5</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">
                    Suggested Copies
                  </h3>
                  <p>{request.totalCopies}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 font-medium">
                    Requested On
                  </h3>
                  <p>
                    {format(new Date(request.createdAt || new Date()), "PPP")}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm text-gray-500 font-medium mb-2">
                  Description
                </h3>
                <p className="text-gray-800">{request.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm text-gray-500 font-medium mb-2">
                  Summary
                </h3>
                <p className="text-gray-800">{request.summary}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="text-sm text-gray-500 font-medium mb-2">
                  Requested By
                </h3>
                <div className="flex gap-6">
                  <div>
                    <p className="text-gray-800 font-medium">
                      {user?.fullName || "Unknown User"}
                    </p>
                    <p className="text-gray-600">{user?.email || "No email"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">University ID</p>
                    <p className="text-gray-800">
                      {user?.universityId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Notes (if already reviewed) */}
              {request.status !== "PENDING" && (
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">
                    Review Notes
                  </h3>
                  <p className="text-gray-800">
                    {request.reviewNote || "No notes provided."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Action Form (only for pending requests) */}
        {request.status === "PENDING" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Review Decision</h2>
            <div className="space-y-4">
              <BookRequestActions id={id} />
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading book request:", error);
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Book Request Review</h1>
          <Button asChild variant="outline">
            <Link href="/admin/book-addition-requests">Back to Requests</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-medium text-gray-600 mb-2">
            Error Loading Request
          </h2>
          <p className="text-gray-500 mb-4">
            There was an error loading this book request. It may not exist or
            there might be a server issue.
          </p>
          <Button asChild>
            <Link href="/admin/book-addition-requests">
              Return to All Requests
            </Link>
          </Button>
        </div>
      </div>
    );
  }
};

export default BookRequestDetailPage;
