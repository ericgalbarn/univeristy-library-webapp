import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { bookRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const UserBookRequestsPage = async () => {
  const session = await auth();

  // Redirect if not logged in
  if (!session || !session.user) {
    redirect("/sign-in?callbackUrl=/my-profile/book-requests");
  }

  const userId = session.user.id;

  // Fetch user's book requests
  const userBookRequests = await db
    .select()
    .from(bookRequests)
    .where(eq(bookRequests.userId, userId as string))
    .orderBy(bookRequests.createdAt);

  // Function to map status to badge variant
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">My Book Requests</h1>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/my-profile">Back to Profile</Link>
          </Button>
          <Button asChild>
            <Link href="/request-book">Request New Book</Link>
          </Button>
        </div>
      </div>

      {userBookRequests.length === 0 ? (
        <div className="text-center py-12 bg-dark-300 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-white">
            No book requests yet
          </h2>
          <p className="text-light-100 mb-6">
            You haven't submitted any book requests. Would you like to suggest a
            book for our library?
          </p>
          <Button asChild>
            <Link href="/request-book">Request a Book</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-dark-300 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-dark-400">
            <thead className="bg-dark-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-100 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-100 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-100 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-100 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-100 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-100 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-400">
              {userBookRequests.map((request) => (
                <tr key={request.id} className="hover:bg-dark-400">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-white">
                      {request.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-light-100">
                    {request.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-light-100">
                    {request.genre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-light-100">
                    {format(
                      new Date(request.createdAt || new Date()),
                      "MMM dd, yyyy"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 text-light-100">
                    {request.reviewNote || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserBookRequestsPage;
