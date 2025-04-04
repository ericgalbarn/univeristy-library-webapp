"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type BookFiltersProps = {
  genres: string[];
  initialFilters: {
    genre: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilter: (filters: any) => void;
  onClose: () => void;
};

const BookFilters = ({
  genres,
  initialFilters,
  onFilter,
  onClose,
}: BookFiltersProps) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleReset = () => {
    const resetFilters = {
      genre: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Filter Books</h3>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Genre Filter */}
          <div>
            <label
              htmlFor="genre"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
              value={filters.genre}
              onChange={handleChange}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label
              htmlFor="sortBy"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
              value={filters.sortBy}
              onChange={handleChange}
            >
              <option value="createdAt">Date Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="genre">Genre</option>
              <option value="rating">Rating</option>
              <option value="availableCopies">Available Copies</option>
              <option value="totalCopies">Total Copies</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label
              htmlFor="sortOrder"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Sort Order
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
              value={filters.sortOrder}
              onChange={handleChange}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" className="bg-primary-admin text-white">
            Apply Filters
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookFilters;
