import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { AlertTriangle, Calendar, Clock } from "lucide-react";

interface BookCardProps extends Book {
  showDueDate?: boolean;
  dueDate?: Date;
  daysUntilDue?: number;
  isOverdue?: boolean;
  isLoanedBook?: boolean;
}

const BookCard = ({
  id,
  title,
  genre,
  coverColor,
  coverUrl,
  isLoanedBook = false,
  showDueDate = false,
  dueDate,
  daysUntilDue,
  isOverdue,
}: BookCardProps) => {
  // Format the due date to a readable string
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
      <Link
        href={`/books/${id}`}
        className={cn(isLoanedBook && "w-full flex flex-col items-center")}
      >
        <BookCover coverColor={coverColor} coverImage={coverUrl} />

        <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
          <p className="book-title">{title}</p>
          <p className="book-genre">{genre}</p>
        </div>

        {(isLoanedBook || showDueDate) && dueDate && (
          <div className="mt-3 w-full">
            <div
              className={cn(
                "book-loaned flex items-center gap-2 p-2 rounded-md",
                isOverdue
                  ? "bg-red-50 text-red-700"
                  : daysUntilDue && daysUntilDue < 3
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-50 text-gray-700"
              )}
            >
              {isOverdue ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}

              <div className="flex flex-col text-xs">
                <p className="font-medium">
                  {isOverdue
                    ? `Overdue by ${Math.abs(daysUntilDue || 0)} days`
                    : `${daysUntilDue !== undefined ? daysUntilDue : 0} days left to return`}
                </p>
                <p className="text-xs opacity-80">Due: {formattedDueDate}</p>
              </div>
            </div>

            <Button variant="outline" className="book-btn mt-2 w-full text-xs">
              Download receipt
            </Button>
          </div>
        )}
      </Link>
    </li>
  );
};

export default BookCard;
