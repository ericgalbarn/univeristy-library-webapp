"use client";

import React from "react";
import BookCard from "@/components/BookCard";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

type GenreBooksListProps = {
  genre: string;
  books: Book[];
};

const GenreBooksList = ({ genre, books }: GenreBooksListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [books]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollable, 400);
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="mb-16 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">{genre}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`rounded-full p-2 ${
              canScrollLeft
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "cursor-default text-gray-300"
            }`}
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`rounded-full p-2 ${
              canScrollRight
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "cursor-default text-gray-300"
            }`}
            aria-label="Scroll right"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex w-full gap-6 overflow-x-auto pb-4"
        onScroll={checkScrollable}
      >
        {books.map((book) => (
          <div key={book.id} className="w-[220px] min-w-[220px]">
            <BookCard
              id={book.id}
              title={book.title}
              author={book.author}
              genre={book.genre}
              description={book.description}
              rating={book.rating}
              coverUrl={book.coverUrl}
              coverColor={book.coverColor}
              totalCopies={book.totalCopies}
              availableCopies={book.availableCopies}
              createdAt={book.createdAt}
              videoUrl={book.videoUrl}
              summary={book.summary}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreBooksList;
