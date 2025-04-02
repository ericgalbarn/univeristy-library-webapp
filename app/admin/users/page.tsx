import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { getAllUsers } from "@/lib/admin/actions/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

const Page = async () => {
  const { success, data: users, error } = await getAllUsers();
  
  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Users</h2>
        <div className="flex gap-2">
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

        <div className="rounded-lg border border-gray-200">
          <div className="grid grid-cols-6 gap-4 border-b border-gray-200 bg-gray-50 p-4 font-medium">
            <div className="col-span-2">Name / Email</div>
            <div>University ID</div>
            <div>Status</div>
            <div>Role</div>
            <div>Actions</div>
          </div>

          {success && users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-6 gap-4 border-b border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-amber-100">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">{user.universityId}</div>
                
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : user.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
                    title="Edit User"
                  >
                    <Image
                      src="/icons/admin/edit.svg"
                      alt="edit"
                      width={16}
                      height={16}
                    />
                  </Button>
                  
                  <Link href={`/admin/users/${user.id}`}>
                    <Button
                      className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
                      title="View Details"
                    >
                      <Image
                        src="/icons/admin/user.svg"
                        alt="view"
                        width={16}
                        height={16}
                      />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              {error ? `Error: ${error}` : "No users found"}
            </div>
          )}
        </div>

        {success && users && (
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

export default Page;