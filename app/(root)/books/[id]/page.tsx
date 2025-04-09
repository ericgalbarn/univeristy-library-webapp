import React from "react";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";

import BookOverview from "@/components/BookOverview";
import { books, users } from "@/db/schema";
import { auth } from "@/auth";
import BookVideo from "@/components/BookVideo";

export default async function BookPage({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Fetch the book
    const bookData = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!bookData || bookData.length === 0) {
      return notFound();
    }

    const book = bookData[0];

    // Get the current authenticated user
    const session = await auth();
    const userId = session?.user?.id || "";

    // Default borrowing eligibility
    let borrowingEligibility = {
      isEligible: false,
      message: "You need to log in to borrow books",
    };

    // Fetch user data and determine eligibility
    if (userId) {
      try {
        const userData = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        const user = userData.length > 0 ? userData[0] : null;

        if (user) {
          borrowingEligibility = {
            isEligible: book.availableCopies > 0 && user.status === "APPROVED",
            message:
              book.availableCopies <= 0
                ? "Book is not available"
                : user.status !== "APPROVED"
                  ? "Your account is not approved for borrowing yet"
                  : "You are eligible to borrow this book",
          };
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    // Pass the data to the client component
    return (
      <>
        <BookOverview
          {...book}
          userId={userId}
          borrowingEligibility={borrowingEligibility}
        />

        <div className="book-details">
          <div className="flex-[1.5]">
            <section className="flex flex-col gap-7">
              <h3>Video</h3>
              <BookVideo videoUrl={book.videoUrl} />
            </section>
            <section className="mt-10 flex flex-col gap-7">
              <h3>Summary</h3>
              <div className="space-y-5 text-xl text-light-100">
                {book.summary.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          </div>

          {/* Similar */}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching book:", error);
    return <div>Something went wrong. Please try again later.</div>;
  }
}
