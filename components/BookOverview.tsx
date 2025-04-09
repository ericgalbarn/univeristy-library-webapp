import Image from "next/image";
import React from "react";

import BookCover from "./BookCover";
import BorrowBook from "./BorrowBook";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import FavoriteButton from "./FavoriteButton";

interface Props extends Book {
  userId: string;
}

const BookOverview = async ({
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,
  id,
  userId,
}: Props) => {
  // Default borrowing eligibility - if no user ID or not logged in
  let borrowingEligibility = {
    isEligible: false,
    message: "You need to log in to borrow books",
  };

  let user = null;

  // Only query user if userId is provided
  if (userId) {
    try {
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      user = userResults.length > 0 ? userResults[0] : null;

      // Update borrowing eligibility based on user status and book availability
      if (user) {
        borrowingEligibility = {
          isEligible: availableCopies > 0 && user.status === "APPROVED",
          message:
            availableCopies <= 0
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

  return (
    <section className="book-overview">
      <div className="flex flex-1 flex-col gap-5">
        <h1>{title}</h1>
        <div className="book-info">
          <p>
            By <span className="font-semibold text-light-200">{author}</span>
          </p>
          <p>
            Category{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex flex-row gap-1">
            <Image src="/icons/star.svg" alt="star" width={22} height={22} />
            <p>{rating}</p>
          </div>
        </div>

        <div className="book-copies">
          <p>
            Total Books: <span>{totalCopies}</span>
          </p>
          <p>
            Available Books: <span>{availableCopies}</span>
          </p>
        </div>

        <p className="book-description">{description}</p>

        <div className="flex items-center gap-4">
          {/* Only show borrow button if user is logged in */}
          {userId && (
            <BorrowBook
              bookId={id}
              userId={userId}
              borrowingEligibility={borrowingEligibility}
            />
          )}

          {/* Add favorite button */}
          <FavoriteButton bookId={id} size="lg" />
        </div>
      </div>

      <div className="relative flex flex-1 justify-center">
        <div className="relative">
          <BookCover
            variant="wide"
            className="z-10"
            coverColor={coverColor}
            coverImage={coverUrl}
          />

          <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
            <BookCover
              variant="wide"
              coverColor={coverColor}
              coverImage={coverUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOverview;
