import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const BookApprovalSuccessPage = () => {
  return (
    <div className="container py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4">
          Book Successfully Added to Library
        </h1>

        <p className="text-gray-600 mb-8">
          The book request has been approved and the book has been added to the
          library collection. Users can now browse and borrow this book.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-primary-admin hover:bg-primary-admin/90 text-white"
          >
            <Link href="/admin/books">View All Books</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/admin/book-addition-requests">
              Back to Addition Requests
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            <Link href="/my-profile/book-requests">View User Requests</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookApprovalSuccessPage;
