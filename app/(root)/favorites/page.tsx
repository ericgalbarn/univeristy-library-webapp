import React from "react";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { books, favoriteBooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart } from "lucide-react";
import BookCover from "@/components/BookCover";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Favorite Books | University Library",
  description: "View your favorite books from the University Library.",
};

export default async function FavoritesPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Get user's favorite books
  const userFavorites = await db
    .select({
      book: books,
    })
    .from(favoriteBooks)
    .innerJoin(books, eq(favoriteBooks.bookId, books.id))
    .where(eq(favoriteBooks.userId, session.user.id as string));

  const favoriteBooksList = userFavorites.map((item) => item.book);

  return (
    <main className="container mx-auto py-10 px-6 md:px-8 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4 border-b pb-6 mb-2">
          <div className="bg-amber-50 p-3 rounded-full">
            <Heart className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Favorite Books
            </h1>
            <p className="text-gray-600 mt-1 text-lg">
              Books you've marked as favorites in the University Library
            </p>
          </div>
        </div>

        <div className="min-h-[60vh]">
          {favoriteBooksList.length > 0 ? (
            <>
              <div className="bg-amber-50 rounded-lg p-4 mb-6 flex items-center">
                <div className="bg-amber-100 rounded-full p-2 mr-3">
                  <Heart
                    className="h-5 w-5 text-amber-500"
                    fill="currentColor"
                  />
                </div>
                <p className="text-amber-800">
                  You have {favoriteBooksList.length} favorite{" "}
                  {favoriteBooksList.length === 1 ? "book" : "books"}
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {favoriteBooksList.map((book) => (
                  <li key={book.id} className="group">
                    <Link href={`/books/${book.id}`}>
                      <div className="flex flex-col rounded-lg overflow-hidden transition-all duration-300 bg-gray-50 hover:bg-gray-100 shadow hover:shadow-md p-4">
                        <div className="relative mb-4 mx-auto">
                          <BookCover
                            coverColor={book.coverColor}
                            coverImage={book.coverUrl}
                          />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm z-10">
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium text-gray-900 line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {book.genre}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-8 py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="rounded-full bg-amber-100 p-5">
                <Heart className="h-14 w-14 text-amber-500" />
              </div>
              <div className="space-y-3 max-w-md">
                <h2 className="text-2xl font-semibold text-gray-900">
                  No favorite books yet
                </h2>
                <p className="text-gray-600 text-lg">
                  You haven't added any books to your favorites yet. Browse the
                  library and click the heart icon on books you like.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="mt-4 px-8 py-6 text-lg shadow-md bg-amber-500 hover:bg-amber-600"
              >
                <Link
                  href="/browse-library"
                  className="flex items-center gap-3"
                >
                  <BookOpen className="h-6 w-6" />
                  Browse Library
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
