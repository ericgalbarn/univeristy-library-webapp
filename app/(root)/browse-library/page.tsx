"use client";

import React, { useState, useEffect } from "react";
import BookCard from "@/components/BookCard";
import BrowseFilters, { FilterOptions } from "@/components/BrowseFilters";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Filter as FilterIcon,
  X,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GenreWithBooks = {
  genre: string;
  books: Book[];
};

const BrowseLibraryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    minRating: null,
    maxRating: null,
    availability: null,
  });

  const MAX_SIDEBAR_GENRES = 10;
  const displayedGenres = showAllGenres
    ? genres
    : genres.slice(0, MAX_SIDEBAR_GENRES);
  const hasMoreGenres = genres.length > MAX_SIDEBAR_GENRES;

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (val) => val !== "" && val !== null && val !== "desc" && val !== "createdAt"
  ).length;

  // Initial load - fetch all genres
  useEffect(() => {
    fetchGenres();
  }, []);

  // Initial load - fetch all books (separate effect to avoid dependency array issues)
  useEffect(() => {
    fetchAllBooks(filters);
  }, []);

  // When a genre is selected, fetch books for that genre
  useEffect(() => {
    if (selectedGenre) {
      fetchBooksByGenre(selectedGenre, filters);
    }
  }, [selectedGenre, filters]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/books/by-genre?genresOnly=true");

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setGenres(data.genres);
      } else {
        throw new Error(data.error || "Failed to fetch genres");
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load genres"
      );
      toast.error("Failed to load library genres. Please try again.");
    }
  };

  const fetchAllBooks = async (filterOptions: FilterOptions = filters) => {
    setLoading(true);
    setError(null);
    setSelectedGenre(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("showAll", "true");

      if (filterOptions.search) {
        params.append("search", filterOptions.search);
      }

      if (filterOptions.sortBy) {
        params.append("sortBy", filterOptions.sortBy);
      }

      if (filterOptions.sortOrder) {
        params.append("sortOrder", filterOptions.sortOrder);
      }

      if (filterOptions.minRating !== null) {
        params.append("minRating", filterOptions.minRating.toString());
      }

      if (filterOptions.maxRating !== null) {
        params.append("maxRating", filterOptions.maxRating.toString());
      }

      if (filterOptions.availability !== null) {
        params.append("availability", filterOptions.availability);
      }

      const response = await fetch(`/api/books/by-genre?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setBooks(data.books);
        // Don't update filters with server response to avoid refresh loops
      } else {
        throw new Error(data.error || "Failed to fetch books");
      }
    } catch (error) {
      console.error("Error fetching all books:", error);
      setError(error instanceof Error ? error.message : "Failed to load books");
      toast.error("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksByGenre = async (
    genre: string,
    filterOptions: FilterOptions = filters
  ) => {
    setLoading(true);
    setError(null);
    setSelectedGenre(genre);

    try {
      // Build query params
      const params = new URLSearchParams();

      params.append("genre", genre);

      if (filterOptions.search) {
        params.append("search", filterOptions.search);
      }

      if (filterOptions.sortBy) {
        params.append("sortBy", filterOptions.sortBy);
      }

      if (filterOptions.sortOrder) {
        params.append("sortOrder", filterOptions.sortOrder);
      }

      if (filterOptions.minRating !== null) {
        params.append("minRating", filterOptions.minRating.toString());
      }

      if (filterOptions.maxRating !== null) {
        params.append("maxRating", filterOptions.maxRating.toString());
      }

      if (filterOptions.availability !== null) {
        params.append("availability", filterOptions.availability);
      }

      const response = await fetch(`/api/books/by-genre?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setBooks(data.books);
        // Don't update filters with server response to avoid refresh loops
      } else {
        throw new Error(data.error || "Failed to fetch books");
      }
    } catch (error) {
      console.error(`Error fetching books for genre ${genre}:`, error);
      setError(error instanceof Error ? error.message : "Failed to load books");
      toast.error(`Failed to load books for ${genre}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedGenre) {
      fetchBooksByGenre(selectedGenre, filters);
      toast.success(`Refreshing ${selectedGenre} books...`);
    } else {
      fetchAllBooks(filters);
      toast.success("Refreshing all books...");
    }
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    if (selectedGenre) {
      fetchBooksByGenre(selectedGenre, newFilters);
    } else {
      fetchAllBooks(newFilters);
    }

    // On mobile, close filter panel after applying
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterOptions = {
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      minRating: null,
      maxRating: null,
      availability: null,
    };

    setFilters(defaultFilters);
    if (selectedGenre) {
      fetchBooksByGenre(selectedGenre, defaultFilters);
    } else {
      fetchAllBooks(defaultFilters);
    }
  };

  const handleGenreClick = (genre: string) => {
    if (genre === selectedGenre) {
      // If clicking the already selected genre, show all books
      setSelectedGenre(null);
      fetchAllBooks(filters);
    } else {
      // Otherwise select the genre
      fetchBooksByGenre(genre, filters);
    }

    // On mobile, close the filter panel
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8 bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center shadow-sm backdrop-blur-sm">
              <Library className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Browse Library
              </h1>
              <p className="mt-1 text-white">
                Discover your next favorite book
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 md:hidden border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <FilterIcon className="h-4 w-4 text-gray-600" />
              <span className="text-gray-800">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw
                className={`h-4 w-4 text-gray-600 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-gray-800">
                {loading ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Genre Sidebar - Desktop */}
        <div className="hidden md:block w-56 flex-shrink-0 lg:w-64">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-6 w-1 bg-white rounded-full"></div>
            <h2 className="text-lg font-semibold text-white">Genres</h2>
          </div>

          <div className="space-y-1.5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {loading && !genres.length ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedGenre(null);
                    fetchAllBooks(filters);
                  }}
                  className={cn(
                    "w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all",
                    selectedGenre === null
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  All Books
                </button>

                {displayedGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className={cn(
                      "w-full rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all",
                      selectedGenre === genre
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {genre}
                  </button>
                ))}

                {hasMoreGenres && (
                  <button
                    onClick={() => setShowAllGenres(!showAllGenres)}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-md py-2 text-xs text-primary hover:bg-gray-50"
                  >
                    {showAllGenres ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        See All Genres
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="mt-6">
            <BrowseFilters
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Mobile Filters - Conditional Rendering */}
        {showFilters && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setShowFilters(false)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-auto rounded-t-xl bg-white p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary">
                  Browse By Genre
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-2 hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedGenre(null);
                    fetchAllBooks(filters);
                    setShowFilters(false);
                  }}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    selectedGenre === null
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  )}
                >
                  All Books
                </button>

                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      handleGenreClick(genre);
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      selectedGenre === genre
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    )}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <BrowseFilters
                initialFilters={filters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
        )}

        {/* Books Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex h-[50vh] items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading books...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8">
              <p className="text-lg font-medium text-red-600">{error}</p>
              <Button onClick={handleRefresh} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : books.length > 0 ? (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-white rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    {selectedGenre || "All Books"}
                  </h2>
                </div>

                <p className="text-sm text-white">
                  Showing{" "}
                  <span className="font-medium text-white">{books.length}</span>{" "}
                  {books.length === 1 ? "book" : "books"}
                  {activeFilterCount > 0 && (
                    <span className="text-white/80"> (filtered)</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {books.map((book) => (
                  <div key={book.id} className="flex justify-center">
                    <div className="w-full max-w-[220px] transform hover:scale-[1.03] hover:shadow-md transition-all duration-200 rounded-lg">
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
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8">
              <BookOpen className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-700">
                No books found {selectedGenre ? `for ${selectedGenre}` : ""}
              </p>
              <p className="mt-2 text-gray-500">
                Try adjusting your filters or check back later for new additions
              </p>

              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Clear Filters</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseLibraryPage;
