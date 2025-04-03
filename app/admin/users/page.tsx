"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAllUsers } from "@/lib/admin/actions/user";
import UserList from "@/components/admin/users/UserList";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { userFiltersSchema } from "@/lib/admin/actions/user/schema";
import UserFilters from "@/components/admin/users/UserFilters";
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const UsersPage = () => {
  // Use a ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<z.infer<typeof userFiltersSchema>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Define fetchUsers without dependencies to prevent circular dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUsers = useCallback(async (currentFilters?: z.infer<typeof userFiltersSchema>) => {
    setLoading(true);
    try {
      // Use the passed filters or the state filters
      const filtersToUse = currentFilters || filters;
      
      const { success, data, error } = await getAllUsers(filtersToUse);
      
      if (success && data) {
        setUsers(data);
        setError(null);
      } else {
        setError(error || "Failed to fetch users");
        toast({
          title: "Error",
          description: error || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Count active filters for badge display
  useEffect(() => {
    const count = Object.keys(filters).length;
    setActiveFiltersCount(count);
  }, [filters]);

  // Initial data fetch - only run once on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchUsers(filters);
    }
  }, []);

  // Handle search with debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Skip if search query is empty (handled directly in handleSearch)
    if (searchQuery === '') return;
    
    // Skip the initial render
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        const updatedFilters = { ...filters };
        
        if (searchQuery && searchQuery.trim() !== "") {
          updatedFilters.search = searchQuery.trim();
        } else {
          delete updatedFilters.search;
        }
        
        setFilters((prevFilters) => {
          // Only update if search value actually changed
          if (prevFilters.search !== updatedFilters.search) {
            fetchUsers(updatedFilters);
            return updatedFilters;
          }
          return prevFilters;
        });
      }
    }, 800); // Longer debounce for better UX, since we can search on Enter too

    return () => clearTimeout(timer);
  }, [searchQuery]); // Only depend on searchQuery

  const handleApplyFilters = (newFilters: z.infer<typeof userFiltersSchema>) => {
    // Preserve the search query if any
    if (searchQuery && searchQuery.trim() !== "") {
      newFilters.search = searchQuery.trim();
    }
    
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // If user clears the search input, immediately update filters to remove search criteria
    if (e.target.value === '') {
      const updatedFilters = { ...filters };
      delete updatedFilters.search;
      setFilters(updatedFilters);
      fetchUsers(updatedFilters);
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilters({});
    fetchUsers({});
  };

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Users</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-primary-admin text-white" 
            onClick={() => {
              // Explicitly pass current filters to avoid using stale closures
              const currentFilters = {...filters};
              fetchUsers(currentFilters);
            }} 
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh List"}
          </Button>
          <Button className="bg-primary-admin text-white">Export List</Button>
        </div>
      </div>

      <div className="mt-7 w-full overflow-hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              className={`w-full rounded-md border ${searchQuery ? 'border-primary-admin' : 'border-gray-300'} px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin`}
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const updatedFilters = { ...filters };
                  if (searchQuery.trim() !== '') {
                    updatedFilters.search = searchQuery.trim();
                  } else {
                    delete updatedFilters.search;
                  }
                  setFilters(updatedFilters);
                  fetchUsers(updatedFilters);
                }
              }}
              aria-label="Search users by name, email or ID"
            />
            <div className="absolute left-3 top-2.5">
              <svg
                className={`h-4 w-4 ${searchQuery ? 'text-primary-admin' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            {searchQuery && (
              <button
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchQuery("");
                  const updatedFilters = { ...filters };
                  delete updatedFilters.search;
                  setFilters(updatedFilters);
                  fetchUsers(updatedFilters);
                }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {searchQuery && (
              <div className="absolute right-10 top-2.5 text-xs text-primary-admin">
                Press Enter to search
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                className="h-9 px-2 text-sm text-red-500 hover:text-red-700"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </Button>
            )}
            
            <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700"
                >
                  Advanced Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 rounded-full bg-primary-admin px-2 py-0.5 text-xs text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="max-w-4xl p-0 sm:max-w-[900px]"
                onInteractOutside={() => setIsFiltersDialogOpen(false)}
                onEscapeKeyDown={() => setIsFiltersDialogOpen(false)}
                hideCloseButton={true}
              >
                <DialogTitle className="sr-only">Advanced User Filters</DialogTitle>
                <UserFilters 
                  onFilter={handleApplyFilters} 
                  onClose={() => setIsFiltersDialogOpen(false)}
                  initialFilters={filters}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-admin"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <UserList users={users} onRefresh={fetchUsers} />
        )}

        {!loading && !error && users && (
          <>
            {filters.search && (
              <div className="mb-3 flex items-center text-sm text-primary-admin">
                <svg 
                  className="mr-1 h-4 w-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span>Search results for: <strong>"{filters.search}"</strong></span>
              </div>
            )}
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <div>
                Showing {users.length} {users.length === 1 ? 'user' : 'users'}
                {activeFiltersCount > 0 && " (filtered)"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 border-gray-300 px-3 py-1 text-xs"
                  disabled
                >
                  Previous
                </Button>
                <span className="text-xs">Page 1 of 1</span>
                <Button
                  variant="outline"
                  className="h-8 border-gray-300 px-3 py-1 text-xs"
                  disabled
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default UsersPage;