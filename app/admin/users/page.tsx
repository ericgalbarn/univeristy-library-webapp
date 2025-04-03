"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { getAllUsers } from "@/lib/admin/actions/user";
import UserList from "@/components/admin/users/UserList";
import { toast } from "@/hooks/use-toast";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { success, data, error } = await getAllUsers();
      
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Users</h2>
        <div className="flex gap-2">
          <Button className="bg-primary-admin text-white" onClick={fetchUsers} disabled={loading}>
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
              placeholder="Search users..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin"
            />
            <div className="absolute left-3 top-2.5">
              <svg
                className="h-4 w-4 text-gray-400"
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
          </div>

          <Button variant="outline" className="border-gray-300 text-gray-700">
            Advanced Filters
          </Button>
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
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <div>Showing {users.length} of {users.length} users</div>
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
        )}
      </div>
    </section>
  );
};

export default UsersPage;