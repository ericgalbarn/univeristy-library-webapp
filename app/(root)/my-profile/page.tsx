import BookList from "@/components/BookList";
import { Button } from "@/components/ui/button";
import { signOut, auth } from "@/auth";
import React from "react";
import { db } from "@/db/db";
import { borrowRecords, books } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Clock, LibraryBig } from "lucide-react";

const MyProfilePage = async () => {
  // Get current user session
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user's borrowed books that haven't been returned
  const borrowedRecords = await db
    .select({
      id: borrowRecords.id,
      bookId: borrowRecords.bookId,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
    })
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.userId, userId as string),
        eq(borrowRecords.status, "BORROWED"),
        isNull(borrowRecords.returnDate)
      )
    );

  // If no borrowed books, prepare empty array
  if (!borrowedRecords.length) {
    return (
      <div>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button>Logout</Button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-10">
          <LibraryBig className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No borrowed books</h2>
          <p className="text-gray-500 text-center mb-6">
            You haven't borrowed any books yet.
          </p>
          <Button asChild className="mt-2">
            <a href="/">Browse Books</a>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch the book details for each borrowed record
  const borrowedBooks = await Promise.all(
    borrowedRecords.map(async (record) => {
      const [bookDetails] = await db
        .select()
        .from(books)
        .where(eq(books.id, record.bookId));

      if (!bookDetails) return null;

      // Calculate days until due
      const dueDate = new Date(record.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Format as a Book object with additional due date info
      return {
        ...bookDetails,
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
      } as Book & { daysUntilDue: number; isOverdue: boolean };
    })
  );

  // Filter out any null values (in case a book was deleted)
  const validBorrowedBooks = borrowedBooks.filter(Boolean) as (Book & {
    daysUntilDue: number;
    isOverdue: boolean;
  })[];

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button>Logout</Button>
        </form>
      </div>

      {validBorrowedBooks.length > 0 ? (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Currently Borrowed</h2>
            </div>
            <p className="text-gray-600">
              Books you've borrowed that need to be returned
            </p>
          </div>

          <BookList
            title="Borrowed Books"
            books={validBorrowedBooks}
            showDueDate={true}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-10">
          <LibraryBig className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No borrowed books</h2>
          <p className="text-gray-500 text-center mb-6">
            You haven't borrowed any books yet.
          </p>
          <Button asChild className="mt-2">
            <a href="/">Browse Books</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
