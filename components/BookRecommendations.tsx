"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Recommendation } from "@/lib/recommendation/engine";
import BookCard from "@/components/BookCard";
import { cn } from "@/lib/utils";

interface BookRecommendationsProps {
  bookId: string;
  className?: string;
}

const BookRecommendations = ({
  bookId,
  className,
}: BookRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/recommendations/${bookId}`);

        if (response.data.success) {
          setRecommendations(response.data.recommendations);
        } else {
          setError("Failed to load recommendations");
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("An error occurred while loading recommendations");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a bookId
    if (bookId) {
      fetchRecommendations();
    }
  }, [bookId]);

  // Don't show anything if there are no recommendations
  if (!loading && recommendations.length === 0 && !error) {
    return null;
  }

  return (
    <div className={cn("mt-12", className)}>
      <h2 className="mb-6 text-2xl font-bold text-light-200">
        You might also like
      </h2>

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-center text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recommendations.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              genre={book.genre}
              coverUrl={book.coverUrl}
              coverColor={book.coverColor}
              rating={book.rating}
              totalCopies={book.totalCopies}
              availableCopies={book.availableCopies}
              description={book.description}
              videoUrl={book.videoUrl}
              summary={book.summary}
              createdAt={book.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookRecommendations;
