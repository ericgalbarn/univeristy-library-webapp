"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROLE_ENUM, STATUS_ENUM } from "@/db/schema";
import { z } from "zod";
import { userFiltersSchema } from "@/lib/admin/actions/user/schema";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface UserFiltersProps {
  onFilter: (filters: z.infer<typeof userFiltersSchema>) => void;
  onClose: () => void;
  initialFilters?: z.infer<typeof userFiltersSchema>;
}

const UserFilters = ({ onFilter, onClose, initialFilters }: UserFiltersProps) => {
  const [filters, setFilters] = useState<z.infer<typeof userFiltersSchema>>(
    initialFilters || {}
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (value === "") {
      // If the value is empty string, remove the property from filters
      const newFilters = { ...filters };
      delete newFilters[name as keyof typeof newFilters];
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = () => {
    onFilter(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
      >
        <X className="h-5 w-5" />
      </button>
      
      <h3 className="mb-4 text-lg font-medium">Filter Users</h3>
      
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Filter */}
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
            value={filters.status || ""}
            onChange={handleChange}
          >
            <option value="">All Status</option>
            {STATUS_ENUM.enumValues.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label
            htmlFor="role"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
            value={filters.role || ""}
            onChange={handleChange}
          >
            <option value="">All Roles</option>
            {ROLE_ENUM.enumValues.map((role) => (
              <option key={role} value={role}>
                {role}
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
            value={filters.sortBy || ""}
            onChange={handleChange}
          >
            <option value="">Default (Date Created)</option>
            <option value="fullName">Name</option>
            <option value="email">Email</option>
            <option value="universityId">University ID</option>
            <option value="status">Status</option>
            <option value="role">Role</option>
            <option value="lastActivityDate">Last Active</option>
            <option value="createAt">Date Created</option>
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
            value={filters.sortOrder || "asc"}
            onChange={handleChange}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Date Range for Created At */}
        <div>
          <label
            htmlFor="createdAfter"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Created After
          </label>
          <Input
            id="createdAfter"
            name="createdAfter"
            type="date"
            className="w-full"
            value={filters.createdAfter || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="createdBefore"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Created Before
          </label>
          <Input
            id="createdBefore"
            name="createdBefore"
            type="date"
            className="w-full"
            value={filters.createdBefore || ""}
            onChange={handleChange}
          />
        </div>

        {/* Date Range for Last Activity */}
        <div>
          <label
            htmlFor="lastActiveAfter"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Last Active After
          </label>
          <Input
            id="lastActiveAfter"
            name="lastActiveAfter"
            type="date"
            className="w-full"
            value={filters.lastActiveAfter || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="lastActiveBefore"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Last Active Before
          </label>
          <Input
            id="lastActiveBefore"
            name="lastActiveBefore"
            type="date"
            className="w-full"
            value={filters.lastActiveBefore || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
        <Button
          type="button"
          className="bg-primary-admin text-white"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default UserFilters;
