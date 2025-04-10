import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XCircle } from "lucide-react";

const BookRejectionPage = () => {
  return (
    <div className="container py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Book Request Rejected</h1>

        <p className="text-gray-600 mb-8">
          The book request has been rejected. The user will be notified about
          your decision along with any review notes you've provided.
        </p>

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/admin/book-addition-requests">
              Back to Addition Requests
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookRejectionPage;
