import React from "react";
import { Button } from "@/components/ui/button";

interface UserFiltersProps {
  onFilter: (filters: Record<string, string>) => void;
}

const UserFilters = ({ onFilter }: UserFiltersProps) => {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div>
        <label
          htmlFor="status-filter"
          className="mb-1 block text-xs font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status-filter"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
          defaultValue=""
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="role-filter"
          className="mb-1 block text-xs font-medium text-gray-700"
        >
          Role
        </label>
        <select
          id="role-filter"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
          defaultValue=""
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="mt-auto">
        <Button
          className="bg-primary-admin text-white"
          onClick={() => onFilter({})} // Will be implemented later
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default UserFilters;
