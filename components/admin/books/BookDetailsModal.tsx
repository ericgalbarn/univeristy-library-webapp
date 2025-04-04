"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, BookOpen, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { Star } from "lucide-react";
import config from "@/lib/config";
import { IKVideo, ImageKitProvider } from "imagekitio-next";

interface BookDetailsModalProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookDetailsModal = ({
  bookId,
  isOpen,
  onClose,
}: BookDetailsModalProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "borrowers">(
    "details"
  );
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [borrowersLoading, setBorrowersLoading] = useState(false);

  // Fetch book data
  useEffect(() => {
    const fetchBookData = async () => {
      if (!bookId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/books/${bookId}`);
        const data = await response.json();

        if (data.success) {
          setBook(data.book);
        } else {
          setError(data.error || "Failed to fetch book details");
          console.error("Error fetching book details:", data.error);
        }
      } catch (err) {
        console.error("Error in BookDetailsModal:", err);
        setError("An unexpected error occurred while fetching book data");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchBookData();
    } else {
      // Reset state when modal closes
      setBook(null);
      setLoading(true);
      setError(null);
      setActiveTab("details");
      setBorrowers([]);
      setBorrowersLoading(false);
    }
  }, [bookId, isOpen]);

  // Fetch borrowers data when tab changes
  useEffect(() => {
    const fetchBorrowers = async () => {
      if (!bookId || activeTab !== "borrowers") return;

      setBorrowersLoading(true);

      try {
        const response = await fetch(`/api/admin/books/${bookId}/borrowers`);
        const data = await response.json();

        if (data.success) {
          setBorrowers(data.borrowers);
        } else {
          console.error("Error fetching borrowers:", data.error);
        }
      } catch (err) {
        console.error("Error fetching borrowers:", err);
      } finally {
        setBorrowersLoading(false);
      }
    };

    fetchBorrowers();
  }, [bookId, activeTab]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Book Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-admin"></div>
              <p className="mt-4 text-sm text-gray-500">
                Loading book details...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading book details
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : book ? (
          <div className="mt-4">
            {/* Book Header */}
            <div className="flex items-start gap-6">
              <div
                className="relative h-40 w-28 overflow-hidden rounded"
                style={{ backgroundColor: book.coverColor }}
              >
                {book.coverUrl && (
                  <Image
                    src={`${config.env.imagekit.urlEndpoint}${book.coverUrl}`}
                    alt={book.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-500">by {book.author}</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {book.genre}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < book.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-sm font-medium">Availability:</span>
                  <span className="text-sm">
                    {book.availableCopies}/{book.totalCopies} copies
                  </span>
                  <div className="ml-2 h-2 w-24 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(book.availableCopies / book.totalCopies) * 100}%`,
                        backgroundColor:
                          book.availableCopies === 0
                            ? "#ef4444"
                            : book.availableCopies < book.totalCopies / 3
                              ? "#f97316"
                              : "#22c55e",
                      }}
                    ></div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Added on{" "}
                  {format(
                    new Date(book.createdAt || new Date()),
                    "MMMM d, yyyy"
                  )}
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 mt-8 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === "details"
                      ? "border-primary-admin text-primary-admin"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Book Information
                </button>
                <button
                  className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === "borrowers"
                      ? "border-primary-admin text-primary-admin"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("borrowers")}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Borrowing History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "details" ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Book Description */}
                <div className="lg:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Description
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {book.description}
                  </p>
                </div>

                {/* Preview Video */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Preview Video
                  </h4>
                  {book.videoUrl ? (
                    <ImageKitProvider
                      publicKey={config.env.imagekit.publicKey}
                      urlEndpoint={config.env.imagekit.urlEndpoint}
                    >
                      <IKVideo
                        path={book.videoUrl}
                        controls={true}
                        className="aspect-video w-full rounded-md"
                      />
                    </ImageKitProvider>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-md bg-gray-100">
                      <p className="text-sm text-gray-500">
                        No video available
                      </p>
                    </div>
                  )}
                </div>

                {/* Book Summary */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Book Summary
                  </h4>
                  <div className="max-h-56 overflow-y-auto text-sm text-gray-600">
                    {book.summary ? (
                      book.summary.split("\n").map((paragraph, index) => (
                        <p key={index} className="mb-2">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p>No summary available.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-admin"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Loading borrowing history...
                    </span>
                  </div>
                ) : borrowers.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 p-8 text-center">
                    <UserCheck className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No borrowing records
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This book hasn't been borrowed by any users yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-700">
                      Showing {borrowers.length}{" "}
                      {borrowers.length === 1 ? "user" : "users"} who borrowed
                      this book
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Borrow Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Return Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {borrowers.map((borrower) => (
                            <tr key={borrower.id}>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {borrower.fullName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {borrower.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {format(
                                  new Date(borrower.borrowDate),
                                  "MMM d, yyyy"
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {format(
                                  new Date(borrower.dueDate),
                                  "MMM d, yyyy"
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {borrower.returnDate
                                  ? format(
                                      new Date(borrower.returnDate),
                                      "MMM d, yyyy"
                                    )
                                  : "Not returned"}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    borrower.status === "RETURNED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {borrower.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailsModal;
