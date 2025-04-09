"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import BookCover from "./BookCover";
import BorrowBook from "./BorrowBook";
import FavoriteButton from "./FavoriteButton";
import AddToBorrowCartButton from "./AddToBorrowCartButton";
import { Loading, LoadingSkeleton } from "./ui/loading";

interface Props extends Book {
  userId: string;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
  isLoading?: boolean;
}

const BookOverview = ({
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
  borrowingEligibility,
  isLoading: externalLoading = false,
}: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Motion values for natural, fluid animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Add spring physics for more natural movement
  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Transform values for the shadow book (more subtle)
  const rotate = useTransform(xSpring, [-100, 100], [14, 10]);

  // Define all the transform hooks at component level to fix ordering issues
  const shadowX = useTransform(xSpring, (v) => v * 0.25);
  const shadowY = useTransform(ySpring, (v) => v * 0.5);
  const frontRotateY = useTransform(xSpring, [-10, 10], [-2, 2]);
  const frontRotateX = useTransform(ySpring, [-10, 10], [2, -2]);

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Update position based on mouse movement
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center (normalized to -1 to 1)
    const moveX = (e.clientX - centerX) / (rect.width / 2);
    const moveY = (e.clientY - centerY) / (rect.height / 2);

    // Apply subtle movement (scaled down for subtlety)
    x.set(moveX * 5);
    y.set(moveY * -8); // Reversed for natural feel
  };

  const navigateToBookDetails = () => {
    router.push(`/books/${id}`);
  };

  // Simulate loading state for demo purposes
  useEffect(() => {
    if (!externalLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [externalLoading]);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.section
          className="book-overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="loading"
        >
          <div className="flex flex-1 flex-col gap-5 w-full">
            <LoadingSkeleton className="h-16 w-4/5" />
            <div className="book-info">
              <LoadingSkeleton className="h-7 w-40" />
              <LoadingSkeleton className="h-7 w-52" />
              <LoadingSkeleton className="h-7 w-20" />
            </div>
            <div className="book-copies">
              <LoadingSkeleton className="h-7 w-48" />
              <LoadingSkeleton className="h-7 w-64" />
            </div>
            <LoadingSkeleton className="h-32 w-full" />
            <div className="flex items-center gap-4">
              <LoadingSkeleton className="h-14 w-40" />
              <LoadingSkeleton className="h-14 w-40" />
              <LoadingSkeleton className="h-14 w-14 rounded-full" />
            </div>
          </div>

          <div className="relative flex flex-1 justify-center">
            <div className="relative animate-pulse">
              <div className="xs:w-[296px] w-[256px] xs:h-[404px] h-[354px] bg-dark-300 rounded-md" />
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          className="book-overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="content"
        >
          <div className="flex flex-1 flex-col gap-5">
            <h1>{title}</h1>
            <div className="book-info">
              <p>
                By{" "}
                <span className="font-semibold text-light-200">{author}</span>
              </p>
              <p>
                Category{" "}
                <span className="font-semibold text-light-200">{genre}</span>
              </p>

              <div className="flex flex-row gap-1">
                <Image
                  src="/icons/star.svg"
                  alt="star"
                  width={22}
                  height={22}
                />
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

              {/* Add to Borrow Cart button */}
              <AddToBorrowCartButton
                book={{ id, title, author, coverUrl, coverColor }}
                size="default"
              />

              {/* Add favorite button */}
              <FavoriteButton bookId={id} size="lg" />
            </div>
          </div>

          <div className="relative flex flex-1 justify-center">
            <motion.div
              className="relative cursor-pointer perspective-container"
              onClick={navigateToBookDetails}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                scale: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                },
              }}
            >
              {/* Shadow book - positioned behind */}
              <motion.div
                className="absolute left-16 top-10 max-sm:hidden will-change-transform"
                style={{
                  rotate,
                  zIndex: 1,
                  x: shadowX,
                  y: shadowY,
                }}
              >
                <BookCover
                  variant="wide"
                  coverColor={coverColor}
                  coverImage={coverUrl}
                />
              </motion.div>

              {/* Front book - always on top */}
              <motion.div
                className="relative will-change-transform"
                style={{
                  zIndex: 2, // Higher z-index to ensure it's always on top
                  x: xSpring,
                  y: ySpring,
                  rotateY: frontRotateY,
                  rotateX: frontRotateX,
                }}
              >
                <BookCover
                  variant="wide"
                  className="shadow-lg"
                  coverColor={coverColor}
                  coverImage={coverUrl}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default BookOverview;
