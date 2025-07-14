import React from "react";
import { auth } from "@/auth";
import FavoriteButton from "@/components/FavoriteButton";
import { db } from "@/db/db";
import { books } from "@/db/schema";

export default async function TestFavoritePage() {
  const session = await auth();

  // Get a sample book for testing
  const sampleBooks = await db.select().from(books).limit(3);

  return (
    <main className="container mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">Favorite Button Test Page</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p>User ID: {session?.user?.id || "Not logged in"}</p>
          <p>User Email: {session?.user?.email || "No email"}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Favorite Button Tests</h2>

          {sampleBooks.length > 0 ? (
            <div className="space-y-4">
              {sampleBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-4 border rounded"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{book.title}</h3>
                    <p className="text-sm text-gray-600">Book ID: {book.id}</p>
                  </div>
                  <FavoriteButton bookId={book.id} size="lg" />
                </div>
              ))}
            </div>
          ) : (
            <p>No books found in database</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">JavaScript Console</h2>
          <p className="text-sm text-gray-600">
            Open browser developer tools and check the console for any error
            messages when clicking the favorite buttons above.
          </p>
        </div>
      </div>
    </main>
  );
}
