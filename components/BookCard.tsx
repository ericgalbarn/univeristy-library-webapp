"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import BookCover from "./BookCover";
import { ReturnIcon } from "./ui/custom-icons";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import BookCoverSvg from "./BookCoverSvg";
import FavoriteButton from "./FavoriteButton";
import AddToBorrowCartButton from "./AddToBorrowCartButton";
import { genreStringToArray } from "@/lib/validation";

interface BookCardProps extends Book {
  variant?: "default" | "loaned" | "minimal";
  showActions?: boolean;
  currentlyReading?: boolean;
  returnDate?: string | Date;
  onReturnClick?: (bookId: string) => void;
  className?: string;
}

const BookCard = ({
  id,
  title,
  author,
  genre,
  coverUrl,
  coverColor,
  totalCopies,
  availableCopies,
  rating,
  variant = "default",
  showActions = true,
  currentlyReading,
  returnDate,
  onReturnClick,
  className,
}: BookCardProps) => {
  const isLoanedBook = variant === "loaned";
  const isMinimal = variant === "minimal";

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // For hover effects
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create springs for smoother motion
  const xSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Calculate rotations based on mouse position
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [1, -1]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-1, 1]);

  // Handle mouse move for the 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMinimal) return; // Skip effect for minimal variant

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized position (0 to 1)
    const xValue = (e.clientX - rect.left) / width;
    const yValue = (e.clientY - rect.top) / height;

    // Convert to -0.5 to 0.5 range
    x.set(xValue - 0.5);
    y.set(yValue - 0.5);
  };

  // Reset on mouse leave
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Parse the comma-separated genres into an array
  const genreArray = genreStringToArray(genre);

  return (
    <motion.div
      ref={ref}
      data-cy="book-card"
      className={cn(
        "group relative flex min-h-[280px] w-full flex-col gap-2 overflow-visible transition-transform duration-300 ease-out",
        isMinimal && "min-h-fit",
        className
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: 0.1,
      }}
    >
      <div
        className={cn("relative block h-full w-full", !isMinimal && "mb-3")}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={`/books/${id}`}
          className={cn(
            "block font-medium no-underline",
            isLoanedBook && "flex items-start gap-2"
          )}
        >
          <div
            className={cn(
              "relative transform-gpu overflow-visible transition-transform duration-300 ease-out",
              !isMinimal && "mb-3"
            )}
            style={{
              transform: isMinimal
                ? "none"
                : `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <BookCover
              variant={isLoanedBook ? "small" : isMinimal ? "small" : "regular"}
              coverColor={coverColor}
              coverImage={coverUrl}
              className={isLoanedBook ? "shadow-sm" : "shadow-md"}
            />

            {/* Currently reading indicator */}
            {currentlyReading && (
              <div className="absolute -left-1 top-0 flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></div>
                Currently Reading
              </div>
            )}
          </div>

          <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
            <div className="book-card-info">
              <div className="book-card-header">
                <h3
                  className="book-card-title text-white font-medium text-sm line-clamp-2"
                  title={title}
                >
                  {title}
                </h3>
              </div>

              <p className="book-card-author text-white text-xs opacity-80 mt-1">
                {author}
              </p>

              {/* Improved rating display - placed right next to the star icon */}
              <div
                className="book-card-rating flex items-center gap-0.5 mt-1"
                data-cy="book-rating"
              >
                <Image
                  src="/icons/star.svg"
                  alt="star"
                  height={14}
                  width={14}
                />
                <p className="text-white text-xs">{rating}</p>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {genreArray.map((g, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Display availability indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    availableCopies > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p className="text-xs text-white opacity-70">
                  {availableCopies > 0
                    ? `${availableCopies} available`
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Return button for loaned books */}
        {isLoanedBook && returnDate && (
          <div className="mt-2 flex flex-col">
            <p className="text-xs text-gray-600">
              Due: {new Date(returnDate).toLocaleDateString()}
            </p>
            {onReturnClick && (
              <button
                onClick={() => onReturnClick(id)}
                className="mt-1 flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary hover:bg-primary/20"
              >
                <ReturnIcon className="h-4 w-4" />
                Return Book
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isLoanedBook && !isMinimal && showActions && (
          <div className="absolute right-0 top-0 flex translate-x-0 translate-y-0 items-start gap-2 opacity-80 transition-all hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2">
            <FavoriteButton bookId={id} />
            <AddToBorrowCartButton
              book={{
                id,
                title,
                author,
                coverUrl,
                coverColor,
              }}
              size="sm"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BookCard;
