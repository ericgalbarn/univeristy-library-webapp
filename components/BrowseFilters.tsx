"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, SortAsc, SortDesc, Star, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOptions = {
  search: string;
  sortBy: string;
  sortOrder: string;
  minRating: number | null;
  maxRating: number | null;
  availability: string | null;
};

interface BrowseFiltersProps {
  initialFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  className?: string;
}

const BrowseFilters = ({
  initialFilters,
  onApplyFilters,
  onClearFilters,
  className,
}: BrowseFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
    setHasChanges(false);
  }, [initialFilters]);

  // Track changes to enable/disable apply button
  useEffect(() => {
    const isDifferent = Object.keys(filters).some(
      (key) =>
        filters[key as keyof FilterOptions] !==
        initialFilters[key as keyof FilterOptions]
    );
    setHasChanges(isDifferent);
  }, [filters, initialFilters]);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Special handler for rating changes to handle exactly N stars (not range)
  const handleRatingChange = (rating: number | null) => {
    // If clicking the currently selected rating, deselect it
    if (rating === filters.minRating) {
      setFilters((prev) => ({
        ...prev,
        minRating: null,
        maxRating: null,
      }));
    } else {
      // Otherwise, set exactly that rating (not min/max range)
      setFilters((prev) => ({
        ...prev,
        minRating: rating,
        maxRating: rating, // Set max to same as min for exact rating
      }));
    }
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    const defaultFilters: FilterOptions = {
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      minRating: null,
      maxRating: null,
      availability: null,
    };

    setFilters(defaultFilters);
    onClearFilters();
  };

  // Helper for rating display
  const renderStars = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ));
  };

  // Calculate whether any filters are active
  const hasActiveFilters =
    filters.search !== "" ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc" ||
    filters.minRating !== null ||
    filters.maxRating !== null ||
    filters.availability !== null;

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Filter Books</h3>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Search filter */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or author"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Sort Options */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Sort By
        </label>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="createdAt">Date Added</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="rating">Rating</option>
            <option value="availableCopies">Availability</option>
          </select>

          <div className="flex rounded-md border border-gray-300">
            <button
              type="button"
              className={cn(
                "flex flex-1 items-center justify-center gap-1 py-2 text-sm",
                filters.sortOrder === "asc"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-50"
              )}
              onClick={() => handleChange("sortOrder", "asc")}
            >
              <SortAsc className="h-4 w-4" />
              Asc
            </button>
            <div className="w-px bg-gray-300"></div>
            <button
              type="button"
              className={cn(
                "flex flex-1 items-center justify-center gap-1 py-2 text-sm",
                filters.sortOrder === "desc"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-50"
              )}
              onClick={() => handleChange("sortOrder", "desc")}
            >
              <SortDesc className="h-4 w-4" />
              Desc
            </button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Rating filter */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rating
        </label>

        <div className="flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating === null ? "any" : rating}
              className={cn(
                "flex items-center rounded-full px-3 py-1 text-sm",
                (rating === filters.minRating &&
                  rating === filters.maxRating) ||
                  (rating === null && filters.minRating === null)
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              )}
              onClick={() => handleRatingChange(rating)}
            >
              {rating === null ? (
                "Any"
              ) : (
                <div className="flex items-center">{renderStars(rating)}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Availability filter */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Availability
        </label>

        <div className="flex flex-wrap gap-2">
          {[
            { value: null, label: "All" },
            { value: "available", label: "Available" },
            { value: "unavailable", label: "Unavailable" },
          ].map((option) => (
            <button
              key={option.value === null ? "all" : option.value}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                filters.availability === option.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              )}
              onClick={() => handleChange("availability", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Apply button */}
      <Button onClick={handleApply} disabled={!hasChanges} className="w-full">
        <Filter className="mr-2 h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  );
};

export default BrowseFilters;
