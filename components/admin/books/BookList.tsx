"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BookRow from "./BookRow";
import BookFilters from "@/components/admin/books/BookFilters";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import config from "@/lib/config";
import { toast } from "@/hooks/use-toast";

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
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch books with current filters
  const fetchBooks = async (showToast = false) => {
    setLoading(true);
    if (showToast) {
      setRefreshLoading(true);
    }

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

        if (showToast) {
          toast({
            title: "Success",
            description: "Book list refreshed successfully",
          });
        }
      } else {
        console.error("Failed to fetch books:", data.error);
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to refresh book list",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      if (showToast) {
        toast({
          title: "Error",
          description: "An error occurred while refreshing",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      if (showToast) {
        setRefreshLoading(false);
      }
    }
  };

  // Handle book list export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Construct query params to match current filters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      // Create export URL
      const exportUrl = `/api/admin/books/export?${params.toString()}`;

      // Start download
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(
          `Export failed: ${response.status} ${response.statusText}`
        );
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "books-export.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Books exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export books",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            className="bg-primary-admin text-white"
            onClick={() => fetchBooks(true)}
            disabled={refreshLoading || loading}
          >
            {refreshLoading || loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh List
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportLoading || loading || books.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exportLoading ? "Exporting..." : "Export List"}
          </Button>
        </div>
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
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-admin"></div>
              <p className="mt-4 text-sm text-gray-500">Loading books...</p>
            </div>
          </div>
        ) : books.length > 0 ? (
          <div>
            {getCurrentPageBooks().map((book) => (
              <BookRow
                key={book.id}
                book={book}
                onBookUpdated={() => fetchBooks(true)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Image
              src="/icons/admin/book.svg"
              alt="No books"
              width={48}
              height={48}
              className="opacity-30"
            />
            <p className="mt-4 text-center text-gray-500">
              No books found. Try adjusting your filters or search query.
            </p>
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
