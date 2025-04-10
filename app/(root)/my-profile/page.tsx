import BookList from "@/components/BookList";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import React from "react";
import { db } from "@/db/db";
import { borrowRecords, books } from "@/db/schema";
import { eq, isNull, and, not, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  BookX,
  BookOpen,
  Clock,
  History,
  LibraryBig,
  Package,
  BookCopy,
} from "lucide-react";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import Image from "next/image";
import config from "@/lib/config";
import BookCover from "@/components/BookCover";
import { format } from "date-fns";

const MyProfilePage = async () => {
  // Get current user session
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userName = session.user.name || "User";

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

  // Fetch user's reading history (books that have been returned)
  const historyRecords = await db
    .select({
      id: borrowRecords.id,
      bookId: borrowRecords.bookId,
      borrowDate: borrowRecords.borrowDate,
      returnDate: borrowRecords.returnDate,
    })
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.userId, userId as string),
        eq(borrowRecords.status, "RETURNED"),
        not(isNull(borrowRecords.returnDate))
      )
    )
    .orderBy(desc(borrowRecords.returnDate));

  // Process the currently borrowed books
  const borrowedBooks = borrowedRecords.length
    ? await Promise.all(
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
          } as Book & {
            borrowDate: any;
            dueDate: string | Date;
            daysUntilDue: number;
            isOverdue: boolean;
          };
        })
      )
    : [];

  // Process reading history books
  const historyBooks = historyRecords.length
    ? await Promise.all(
        historyRecords.map(async (record) => {
          const [bookDetails] = await db
            .select()
            .from(books)
            .where(eq(books.id, record.bookId));

          if (!bookDetails) return null;

          return {
            ...bookDetails,
            borrowDate: record.borrowDate,
            returnDate: record.returnDate,
          } as Book & {
            borrowDate: any;
            returnDate: any;
          };
        })
      )
    : [];

  // Filter out any null values
  const validBorrowedBooks = borrowedBooks.filter(Boolean) as (Book & {
    borrowDate: any;
    dueDate: string | Date;
    daysUntilDue: number;
    isOverdue: boolean;
  })[];

  const validHistoryBooks = historyBooks.filter(Boolean) as (Book & {
    borrowDate: any;
    returnDate: any;
  })[];

  // No borrowed books and no history
  if (!validBorrowedBooks.length && !validHistoryBooks.length) {
    return (
      <div className="container mx-auto max-w-6xl px-4">
        <section className="mb-10">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="flex items-center gap-2 text-sm text-light-400 mb-2">
                <Link href="/" className="hover:text-light-200">
                  Home
                </Link>
                <span>/</span>
                <span className="text-light-200">My Profile</span>
              </div>
              <h1 className="font-bebas-neue text-5xl text-white md:text-7xl">
                My Profile
              </h1>
              <p className="text-xl text-light-100 mt-2">
                Welcome back,{" "}
                <span className="font-semibold text-primary">{userName}</span>
              </p>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="rounded-full bg-dark-400/30 p-1.5 border border-dark-600">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-light-200 hover:text-primary hover:bg-dark-500/50"
                >
                  <Link href="/">Browse More Books</Link>
                </Button>
              </div>
              <div className="rounded-full bg-dark-400/30 p-1.5 border border-dark-600">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-light-200 hover:text-primary hover:bg-dark-500/50"
                >
                  <Link href="/my-profile/book-requests">My Book Requests</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="gradient-vertical min-h-[400px] rounded-2xl p-8 flex flex-col items-center justify-center">
          <LibraryBig className="h-20 w-20 text-primary mb-6" />
          <h2 className="text-2xl font-semibold mb-3 text-white">
            No borrowed books
          </h2>
          <p className="text-light-100 text-center mb-8 max-w-md text-xl">
            You haven't borrowed any books yet. Browse our collection and find
            something that interests you.
          </p>
          <Button asChild className="book-overview_btn">
            <Link href="/">Explore the Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4">
      <section className="mb-10">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <div className="flex items-center gap-2 text-sm text-light-400 mb-2">
              <Link href="/" className="hover:text-light-200">
                Home
              </Link>
              <span>/</span>
              <span className="text-light-200">My Profile</span>
            </div>
            <h1 className="font-bebas-neue text-5xl text-white md:text-7xl">
              My Profile
            </h1>
            <p className="text-xl text-light-100 mt-2">
              Welcome back,{" "}
              <span className="font-semibold text-primary">{userName}</span>
            </p>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="rounded-full bg-dark-400/30 p-1.5 border border-dark-600">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-light-200 hover:text-primary hover:bg-dark-500/50"
              >
                <Link href="/">Browse More Books</Link>
              </Button>
            </div>
            <div className="rounded-full bg-dark-400/30 p-1.5 border border-dark-600">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-light-200 hover:text-primary hover:bg-dark-500/50"
              >
                <Link href="/my-profile/book-requests">My Book Requests</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {/* Currently Borrowed Section */}
        {validBorrowedBooks.length > 0 ? (
          <section className="gradient-vertical rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-dark-300 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Currently Borrowed
                </h2>
              </div>
              <p className="text-light-100 text-xl">
                Books you've borrowed that need to be returned to the library
              </p>
            </div>

            {/* Borrowed books grid */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {validBorrowedBooks.map((book) => (
                  <div key={book.id} className="borrowed-book">
                    <div className="borrowed-book_cover flex justify-center py-4">
                      <BookCover
                        coverColor={book.coverColor}
                        coverImage={book.coverUrl}
                        variant="medium"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-genre">{book.genre}</p>

                      <div
                        className={`mt-3 flex items-center gap-2 p-2 rounded-md ${
                          book.isOverdue
                            ? "bg-dark-300/50 border-l-4 border-red-500"
                            : book.daysUntilDue < 3
                              ? "bg-dark-300/50 border-l-4 border-amber-500"
                              : "bg-dark-300/50 border-l-4 border-green-500"
                        }`}
                      >
                        <div className="flex flex-col">
                          <p className="text-sm text-light-100">
                            {book.isOverdue
                              ? `Overdue by ${Math.abs(book.daysUntilDue)} days`
                              : `${book.daysUntilDue} days left to return`}
                          </p>
                          <p className="text-xs text-light-400">
                            Due:{" "}
                            {new Date(String(book.dueDate)).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <Button
                        asChild
                        className="bg-primary hover:bg-primary/90 text-dark-100 mt-3 min-h-11 w-full font-medium"
                      >
                        <Link
                          href={`/books/${book.id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>View Book</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="gradient-vertical rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-dark-300 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Currently Borrowed
                </h2>
              </div>

              <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
                <LibraryBig className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-white">
                  No borrowed books currently
                </h3>
                <p className="text-light-100 text-center mb-6 max-w-md">
                  Browse our collection and find something that interests you.
                </p>
                <Button asChild className="book-overview_btn">
                  <Link href="/">Explore the Library</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Reading History Section */}
        <section className="gradient-vertical rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-dark-300 p-3 rounded-full">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Reading History
              </h2>
            </div>
            <p className="text-light-100 text-xl mb-6">
              Track your reading journey and see all the books you've enjoyed
            </p>

            {validHistoryBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {validHistoryBooks.map((book) => (
                  <div
                    key={book.id}
                    className="history-book bg-dark-300/30 border border-dark-600 rounded-xl overflow-hidden"
                  >
                    <div className="flex justify-center py-4">
                      <BookCover
                        coverColor={book.coverColor}
                        coverImage={book.coverUrl}
                        variant="small"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="book-title text-white text-lg font-medium mb-1">
                        {book.title}
                      </h3>
                      <p className="book-genre text-light-400 text-sm mb-3">
                        {book.genre}
                      </p>

                      <div className="flex items-center text-xs text-light-300 mb-2">
                        <BookCopy className="h-4 w-4 mr-2" />
                        <span>
                          Borrowed:{" "}
                          {format(new Date(book.borrowDate), "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-light-300">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>
                          Returned:{" "}
                          {format(new Date(book.returnDate), "MMM d, yyyy")}
                        </span>
                      </div>

                      <Button
                        asChild
                        className="bg-dark-300 hover:bg-dark-400 text-primary mt-3 min-h-10 w-full font-medium text-sm"
                      >
                        <Link
                          href={`/books/${book.id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          <span>View Book</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-dark-300/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] border border-dark-600">
                <BookX className="h-12 w-12 text-light-400 mb-4" />
                <p className="text-light-100 text-center text-xl">
                  Your reading history will appear here once you've returned
                  books
                </p>
                <p className="text-light-400 text-center mt-2">
                  Return your borrowed books to build your reading history
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyProfilePage;
