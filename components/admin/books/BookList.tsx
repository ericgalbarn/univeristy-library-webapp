"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BookRow from "./BookRow";
import BookFilters from "@/components/admin/books/BookFilters";
import { Search, Filter } from "lucide-react";
import config from "@/lib/config";

type BookListProps = {
  onRefresh?: () => void;
};

const BookList = ({ onRefresh }: BookListProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    genre: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch books with current filters
  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Construct query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/admin/books?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBooks(data.books);
        setGenres(data.genres);

        // Calculate total pages
        setTotalPages(Math.ceil(data.books.length / itemsPerPage));

        // Debug log for image URLs
        console.log("ImageKit URL Endpoint:", config.env.imagekit.urlEndpoint);
        data.books.forEach((book: Book) => {
          console.log(`Book: ${book.title}, Cover URL: ${book.coverUrl}`);
        });
      } else {
        console.error("Failed to fetch books:", data.error);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce(() => {
    fetchBooks();
  }, 300);

  useEffect(() => {
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    setIsFiltersOpen(false);
    // Reset to first page when applying new filters
    setCurrentPage(1);
  };

  // Get current books for the current page
  const getCurrentPageBooks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return books.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by title or author..."
            className="max-w-md pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {isFiltersOpen && (
        <BookFilters
          genres={genres}
          initialFilters={filters}
          onFilter={handleFilterChange}
          onClose={() => setIsFiltersOpen(false)}
        />
      )}

      <div className="rounded-lg border border-gray-200">
        <div className="grid grid-cols-6 gap-4 border-b border-gray-200 bg-gray-50 p-4 font-medium">
          <div className="col-span-2">Book / Author</div>
          <div>Genre</div>
          <div>Rating</div>
          <div>Availability</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading books...</div>
        ) : books.length > 0 ? (
          <div>
            {getCurrentPageBooks().map((book) => (
              <BookRow key={book.id} book={book} onBookUpdated={fetchBooks} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No books found. Try adjusting your filters or search query.
          </div>
        )}
      </div>

      {books.length > 0 && (
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <div>
            Showing{" "}
            {books.length > 0
              ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, books.length)}`
              : "0"}{" "}
            of {books.length} {books.length === 1 ? "book" : "books"}
            {searchTerm || filters.genre ? " (filtered)" : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 border-gray-300 px-3 py-1 text-xs"
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <span className="text-xs">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              className="h-8 border-gray-300 px-3 py-1 text-xs"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;
