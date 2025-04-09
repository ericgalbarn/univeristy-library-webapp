"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { AlertTriangle, Calendar, Clock, Heart } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useSession } from "next-auth/react";
import AddToBorrowCartButton from "./AddToBorrowCartButton";

interface BookCardProps extends Book {
  showDueDate?: boolean;
  dueDate?: Date;
  daysUntilDue?: number;
  isOverdue?: boolean;
  isLoanedBook?: boolean;
  author: string;
}

const BookCard = ({
  id,
  title,
  author,
  genre,
  coverColor,
  coverUrl,
  isLoanedBook = false,
  showDueDate = false,
  dueDate,
  daysUntilDue,
  isOverdue,
}: BookCardProps) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format the due date to a readable string
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Check if book is favorited on component mount
  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus();
    }
  }, [session, id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Check if book is in user's favorites
  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/books/favorite?bookId=${id}`);
      const data = await response.json();

      if (data.success) {
        setIsFavorite(data.favorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation

    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add books to favorites",
        variant: "destructive",
      });
      return;
    }

    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // Generate new animation key to force re-render and restart animation
    setAnimationKey((prev) => prev + 1);
    setIsLoading(true);

    try {
      const response = await fetch("/api/books/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId: id }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFavorite(data.favorited);
        toast({
          title: data.favorited
            ? "Added to favorites"
            : "Removed from favorites",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update favorites",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
      <Link
        href={`/books/${id}`}
        className={cn(isLoanedBook && "w-full flex flex-col items-center")}
      >
        <div className="relative">
          <BookCover coverColor={coverColor} coverImage={coverUrl} />

          {/* Heart icon for favoriting */}
          <div className="absolute top-2 right-2 z-20">
            <button
              onClick={toggleFavorite}
              disabled={isLoading}
              className={cn(
                "bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 hover:shadow-md",
                `animate-buttonBounce-${animationKey}`,
                isFavorite && "shadow-rose-100"
              )}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-400",
                  `animate-heartPulse-${animationKey}`
                )}
              />
              <span className="absolute inset-0 pointer-events-none">
                <span
                  className={`absolute inset-0 rounded-full animate-ripple-${animationKey} bg-red-100 opacity-0`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
          <p className="book-title">{title}</p>
          <p className="book-genre">{genre}</p>
        </div>
      </Link>

      {/* Add to Borrow Cart button */}
      <div className="mt-3">
        <AddToBorrowCartButton
          book={{ id, title, author, coverUrl, coverColor }}
          size="sm"
          variant="outline"
          className="w-full text-xs"
        />
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

      <style jsx global>{`
        @keyframes buttonBounce {
          0%,
          100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          10% {
            transform: scale(1.1) translateY(0);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          25% {
            transform: scale(1.05) translateY(-10px);
            box-shadow: 0 8px 16px rgba(255, 0, 0, 0.1);
          }
          40% {
            transform: scale(1.08) translateY(-5px);
            box-shadow: 0 6px 12px rgba(255, 0, 0, 0.1);
          }
          55% {
            transform: scale(1.05) translateY(-8px);
            box-shadow: 0 5px 10px rgba(255, 0, 0, 0.1);
          }
          70% {
            transform: scale(1.03) translateY(-3px);
            box-shadow: 0 3px 8px rgba(255, 0, 0, 0.1);
          }
          85% {
            transform: scale(1) translateY(-1px);
            box-shadow: 0 2px 5px rgba(255, 0, 0, 0.1);
          }
        }

        @keyframes heartPulse {
          0% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.25);
          }
          30% {
            transform: scale(0.95);
          }
          45% {
            transform: scale(1.15);
          }
          60% {
            transform: scale(0.95);
          }
          75% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-buttonBounce-${animationKey} {
          animation: ${animationKey > 0
            ? "buttonBounce 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards"
            : "none"};
        }

        .animate-heartPulse-${animationKey} {
          animation: ${animationKey > 0
            ? "heartPulse 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards"
            : "none"};
        }

        .animate-ripple-${animationKey} {
          animation: ${animationKey > 0
            ? "ripple 1s ease-out forwards"
            : "none"};
        }
      `}</style>
    </li>
  );
};

export default BookCard;
