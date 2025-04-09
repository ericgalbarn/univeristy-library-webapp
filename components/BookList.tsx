"use client";

import React, { useState, useEffect } from "react";
import BookCard from "./BookCard";
import { BookCardSkeleton } from "./ui/loading";

interface Props {
  title?: string;
  books: Book[];
  containerClassName?: string;
  showDueDate?: boolean;
  isLoading?: boolean;
}

const BookList = ({
  title,
  books,
  containerClassName,
  showDueDate = false,
  isLoading = false,
}: Props) => {
  // Add a short artificial delay to show loading state for demo purposes
  // In production, this would be controlled by the actual data fetching state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && books) {
      // Artificial delay for demo purposes
      // In production, remove this timeout and just use the isLoading prop
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [books, isLoading]);

  if (books.length < 1 && !loading) return null;

  return (
    <section className={containerClassName}>
      {title && (
        <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>
      )}

      <ul className="book-list">
        {loading
          ? // Show skeleton loading placeholders
            Array.from({ length: 6 }).map((_, index) => (
              <li key={`skeleton-${index}`}>
                <BookCardSkeleton />
              </li>
            ))
          : // Show actual books
            books.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                showDueDate={showDueDate}
                dueDate={showDueDate ? (book as any).dueDate : undefined}
                daysUntilDue={
                  showDueDate ? (book as any).daysUntilDue : undefined
                }
                isOverdue={showDueDate ? (book as any).isOverdue : undefined}
              />
            ))}
      </ul>
    </section>
  );
};

export default BookList;
