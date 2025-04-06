"use client";

import React, { useState, useEffect } from "react";
import GenreBooksList from "@/components/GenreBooksList";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type GenreWithBooks = {
  genre: string;
  books: Book[];
};

const BrowseLibraryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [booksByGenre, setBooksByGenre] = useState<GenreWithBooks[]>([]);

  const fetchBooksByGenre = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/books/by-genre");

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setGenres(data.genres);
        setBooksByGenre(data.booksByGenre);
      } else {
        throw new Error(data.error || "Failed to fetch books");
      }
    } catch (error) {
      console.error("Error fetching books by genre:", error);
      setError(error instanceof Error ? error.message : "Failed to load books");
      toast.error("Failed to load library. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBooksByGenre();
    toast.success("Refreshing library...");
  };

  useEffect(() => {
    fetchBooksByGenre();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Library</h1>
          <p className="mt-1 text-gray-600">Explore our collection by genre</p>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading && !booksByGenre.length ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading library...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : booksByGenre.length > 0 ? (
        <div>
          {booksByGenre.map((genreSection) => (
            <GenreBooksList
              key={genreSection.genre}
              genre={genreSection.genre}
              books={genreSection.books}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
          <p className="text-lg font-medium text-gray-600">
            No books found in the library
          </p>
          <p className="mt-2 text-gray-500">
            Check back later for new additions
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseLibraryPage;
