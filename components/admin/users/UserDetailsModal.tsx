"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserById, getUserBorrowingHistory } from "@/lib/admin/actions/user";
import { X, Calendar, Clock, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { STATUS_ENUM, ROLE_ENUM } from "@/db/schema";
import config from "@/lib/config";

interface UserDetailsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  bookCoverColor: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

const UserDetailsModal = ({
  userId,
  isOpen,
  onClose,
}: UserDetailsModalProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "borrowing">(
    "profile"
  );
  const [borrowings, setBorrowings] = useState<BorrowRecord[]>([]);
  const [borrowingsLoading, setBorrowingsLoading] = useState(false);
  const [borrowingsError, setBorrowingsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        const { success, data, error } = await getUserById(userId);

        if (success && data) {
          setUser(data);
        } else {
          setError(error || "Failed to fetch user details");
          console.error("Error fetching user details:", error);
        }
      } catch (err) {
        console.error("Error in UserDetailsModal:", err);
        setError("An unexpected error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUserData();
    } else {
      // Reset state when modal closes
      setUser(null);
      setLoading(true);
      setError(null);
      setActiveTab("profile");
      setBorrowings([]);
      setBorrowingsLoading(false);
      setBorrowingsError(null);
    }
  }, [userId, isOpen]);

  // Fetch borrowing history when activeTab changes to "borrowing"
  useEffect(() => {
    const fetchBorrowingHistory = async () => {
      if (!userId || activeTab !== "borrowing") return;

      setBorrowingsLoading(true);
      setBorrowingsError(null);

      try {
        const { success, data, error } = await getUserBorrowingHistory(userId);

        if (success && data) {
          setBorrowings(data);
        } else {
          setBorrowingsError(error || "Failed to fetch borrowing history");
          console.error("Error fetching borrowing history:", error);
        }
      } catch (err) {
        console.error("Error fetching borrowing history:", err);
        setBorrowingsError(
          "An unexpected error occurred while fetching borrowing history"
        );
      } finally {
        setBorrowingsLoading(false);
      }
    };

    fetchBorrowingHistory();
  }, [userId, activeTab]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-admin"></div>
            <span className="ml-2 text-gray-600">Loading user details...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : user ? (
          <div className="mt-2">
            {/* User Header - Avatar and basic info */}
            <div className="mb-6 flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-amber-100 text-lg">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.fullName}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-1 flex space-x-2">
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
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === "profile"
                      ? "border-primary-admin text-primary-admin"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile Information
                </button>
                <button
                  className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === "borrowing"
                      ? "border-primary-admin text-primary-admin"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("borrowing")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Borrowing History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "profile" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      University ID
                    </h4>
                    <p className="mt-1 text-sm">{user.universityId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Email Address
                    </h4>
                    <p className="mt-1 text-sm">{user.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Role</h4>
                    <p className="mt-1 text-sm">{user.role}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Status
                    </h4>
                    <p className="mt-1 text-sm">{user.status}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Account Created
                    </h4>
                    <p className="mt-1 flex items-center text-sm">
                      <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                      {user.createAt
                        ? format(new Date(user.createAt), "PPP")
                        : "Not available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Last Active
                    </h4>
                    <p className="mt-1 flex items-center text-sm">
                      <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                      {user.lastActivityDate
                        ? format(new Date(user.lastActivityDate), "PPP")
                        : "Not available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      University Card
                    </h4>
                    {user.universityCard ? (
                      <div className="mt-1 max-w-xs overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={`${config.env.imagekit.urlEndpoint}${user.universityCard}`}
                          alt="University Card"
                          width={300}
                          height={200}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">
                        No card uploaded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary-admin"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Loading borrowing history...
                    </span>
                  </div>
                ) : borrowingsError ? (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error loading borrowing history
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{borrowingsError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : borrowings.length === 0 ? (
                  <div className="rounded-md border border-gray-200 p-6 text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No borrowing records
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This user hasn't borrowed any books yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Showing {borrowings.length} borrowed{" "}
                      {borrowings.length === 1 ? "book" : "books"}
                    </h3>
                    <div className="divide-y divide-gray-200">
                      {borrowings.map((borrowing) => (
                        <div key={borrowing.id} className="flex py-4">
                          <div className="mr-4 flex-shrink-0 self-start">
                            <div
                              className="h-16 w-12 rounded-sm"
                              style={{
                                backgroundColor: borrowing.bookCoverColor,
                              }}
                            >
                              {borrowing.bookCoverUrl && (
                                <Image
                                  src={`${config.env.imagekit.urlEndpoint}${borrowing.bookCoverUrl}`}
                                  alt={borrowing.bookTitle}
                                  width={48}
                                  height={64}
                                  className="h-full w-full rounded-sm object-cover"
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">
                              {borrowing.bookTitle}
                            </h4>
                            <p className="text-xs text-gray-500">
                              by {borrowing.bookAuthor}
                            </p>
                            <div className="mt-1 space-y-1">
                              <p className="flex items-center text-xs text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                Borrowed:{" "}
                                {format(
                                  new Date(borrowing.borrowDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
                              <p className="flex items-center text-xs text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                Due:{" "}
                                {format(
                                  new Date(borrowing.dueDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  borrowing.status === "RETURNED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {borrowing.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
