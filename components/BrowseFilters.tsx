"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  SortAsc,
  SortDesc,
  Star,
  Filter,
  X,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOptions = {
  search: string;
  sortBy: string;
  sortOrder: string;
  minRating: number | null;
  maxRating: number | null;
  availability: string | null;
  firstLetter: string | null;
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
      firstLetter: null,
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
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filter Books</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Search filter */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or author"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Separator className="my-4 bg-gray-200" />

      {/* A-Z Navigation */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          A - Z
        </label>
        <div className="relative mt-6">
          <div className="relative h-2 w-full">
            {/* Track line */}
            <div className="absolute inset-0 h-0.5 w-full bg-gray-200 rounded-full" />

            {/* Active track */}
            <div
              className="absolute inset-0 h-0.5 bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((filters.firstLetter ? filters.firstLetter.charCodeAt(0) - 65 : 0) / 25) * 100}%`,
              }}
            />

            {/* Slider input */}
            <input
              type="range"
              min="0"
              max="25"
              value={
                filters.firstLetter ? filters.firstLetter.charCodeAt(0) - 65 : 0
              }
              onChange={(e) => {
                const letter = String.fromCharCode(
                  65 + parseInt(e.target.value)
                );
                handleChange("firstLetter", letter);
                // Apply filters immediately when letter changes
                onApplyFilters({ ...filters, firstLetter: letter });
              }}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:active:scale-95"
            />

            {/* Current letter indicator */}
            <div
              className={cn(
                "absolute -top-8 left-1/2 transform -translate-x-1/2 transition-all duration-300",
                filters.firstLetter ? "opacity-100" : "opacity-0"
              )}
              style={{
                left: `${((filters.firstLetter ? filters.firstLetter.charCodeAt(0) - 65 : 0) / 25) * 100}%`,
              }}
            >
              <div className="bg-primary text-white text-sm font-medium px-2.5 py-1 rounded-md shadow-sm">
                {filters.firstLetter || "A"}
              </div>
            </div>

            {/* Edge letters */}
            <div className="absolute -bottom-6 left-0 text-xs font-medium text-gray-500">
              A
            </div>
            <div className="absolute -bottom-6 right-0 text-xs font-medium text-gray-500">
              Z
            </div>
          </div>

          {/* Status message */}
          <div className="mt-8 text-center">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all duration-300",
                filters.firstLetter
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              )}
            >
              {filters.firstLetter
                ? `Showing books starting with "${filters.firstLetter}"`
                : "Slide to filter books by letter"}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4 bg-gray-200" />

      {/* Sort Options */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Sort By
        </label>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="createdAt">Date Added</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="rating">Rating</option>
            <option value="availableCopies">Availability</option>
          </select>

          <div className="flex rounded-md border border-gray-300 shadow-sm">
            <button
              type="button"
              className={cn(
                "flex flex-1 items-center justify-center gap-1 py-2 text-sm font-medium transition-colors",
                filters.sortOrder === "asc"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-50 text-gray-700"
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
                "flex flex-1 items-center justify-center gap-1 py-2 text-sm font-medium transition-colors",
                filters.sortOrder === "desc"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-50 text-gray-700"
              )}
              onClick={() => handleChange("sortOrder", "desc")}
            >
              <SortDesc className="h-4 w-4" />
              Desc
            </button>
          </div>
        </div>
      </div>

      <Separator className="my-4 bg-gray-200" />

      {/* Rating filter */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Rating
        </label>

        <div className="flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating === null ? "any" : rating}
              className={cn(
                "flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                (rating === filters.minRating &&
                  rating === filters.maxRating) ||
                  (rating === null && filters.minRating === null)
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
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

      <Separator className="my-4 bg-gray-200" />

      {/* Availability filter */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filters.availability === option.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              )}
              onClick={() => handleChange("availability", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-4 bg-gray-200" />

      {/* Apply button */}
      <Button
        onClick={handleApply}
        disabled={!hasChanges}
        className="w-full bg-primary hover:bg-primary/90 transition-colors"
      >
        <Filter className="mr-2 h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  );
};

export default BrowseFilters;
