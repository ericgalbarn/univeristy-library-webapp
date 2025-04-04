"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import { X, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import BookCover from "@/components/BookCover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define simplified types for the borrow request
type BorrowRequestType = {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string | Date;
  dueDate: string | Date;
  returnDate: string | Date | null;
  status: "BORROWED" | "RETURNED";
  createdAt: string | Date;
  user: {
    id: string;
    fullName: string;
    email: string;
    universityId: number;
  };
  book: {
    id: string;
    title: string;
    author: string;
    genre: string;
    coverUrl: string;
    coverColor: string;
  };
};

const BorrowRequestsPage = () => {
  const [requests, setRequests] = useState<BorrowRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<BorrowRequestType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 10;
  const totalPages = Math.ceil((requests?.length || 0) / requestsPerPage);

  // Fetch borrow requests data
  const fetchBorrowRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/borrow-requests");

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
      } else {
        throw new Error(data.error || "Failed to fetch borrow requests");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast.error(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchBorrowRequests();
    toast.success("Refreshing borrow requests...");
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleMarkAsReturned = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/admin/borrow-requests/${requestId}/return`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update local state to reflect the change
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "RETURNED",
                  returnDate: new Date(),
                }
              : req
          )
        );
        toast.success("Book marked as returned");
      } else {
        throw new Error(data.error || "Failed to update borrow request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark book as returned"
      );
    }
  };

  const handleViewDetails = (request: BorrowRequestType) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleExportData = async () => {
    try {
      toast.info("Preparing export...");
      const response = await fetch("/api/admin/borrow-requests/export");

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "borrow-requests.csv";

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export completed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export data");
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === null || request.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  );

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Book Borrowing Requests</h2>
        <div className="flex gap-2">
          <Button
            className="bg-primary-admin text-white"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh List"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export List
          </Button>
        </div>
      </div>

      <div className="mt-7 w-full overflow-hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by book or user..."
              className={`w-full rounded-md border ${searchQuery ? "border-primary-admin" : "border-gray-300"} px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin`}
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search borrowing requests"
            />
            <div className="absolute left-3 top-2.5">
              <svg
                className={`h-4 w-4 ${searchQuery ? "text-primary-admin" : "text-gray-400"}`}
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
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              onClick={() => handleStatusFilter(null)}
              className={
                selectedStatus === null ? "bg-primary-admin text-white" : ""
              }
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedStatus === "BORROWED" ? "default" : "outline"}
              onClick={() => handleStatusFilter("BORROWED")}
              className={
                selectedStatus === "BORROWED" ? "bg-blue-600 text-white" : ""
              }
              size="sm"
            >
              Borrowed
            </Button>
            <Button
              variant={selectedStatus === "RETURNED" ? "default" : "outline"}
              onClick={() => handleStatusFilter("RETURNED")}
              className={
                selectedStatus === "RETURNED" ? "bg-green-600 text-white" : ""
              }
              size="sm"
            >
              Returned
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-admin"></div>
            <span className="ml-2 text-gray-600">Loading requests...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-500">
            {error}
            <Button
              variant="outline"
              className="ml-4 border-red-200 text-red-500 hover:bg-red-100"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-6 gap-4 border-b border-gray-200 bg-gray-50 p-4 font-medium">
              <div className="col-span-2">Book / User</div>
              <div>Borrow Date</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div>
              {paginatedRequests.map((request) => (
                <div
                  key={request.id}
                  className="grid grid-cols-6 gap-4 border-b border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="col-span-2 flex items-start gap-3">
                    <div className="h-12 w-9 overflow-hidden rounded">
                      <BookCover
                        coverColor={request.book.coverColor}
                        coverImage={request.book.coverUrl}
                        variant="extraSmall"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.book.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.book.author}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-amber-100">
                            {getInitials(request.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-600">
                          {request.user.fullName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    {format(new Date(request.borrowDate), "dd MMM yyyy")}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    {format(new Date(request.dueDate), "dd MMM yyyy")}
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        request.status === "RETURNED"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {request.status === "BORROWED" && (
                      <Button
                        className="h-8 px-3 rounded-md bg-green-100 text-green-800 hover:bg-green-200"
                        title="Mark as Returned"
                        onClick={() => handleMarkAsReturned(request.id)}
                      >
                        Return
                      </Button>
                    )}

                    <Button
                      className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
                      title="View Details"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Image
                        src="/icons/admin/eye.svg"
                        alt="view"
                        width={16}
                        height={16}
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            <div className="mb-4 flex flex-col items-center justify-center">
              <div className="mb-3 rounded-full bg-gray-100 p-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-900">
                No borrow requests found
              </h3>
              <p className="text-sm text-gray-500">
                {searchQuery && "No results match your search criteria"}
                {!searchQuery &&
                  selectedStatus &&
                  `No books currently ${selectedStatus === "BORROWED" ? "borrowed" : "returned"}`}
                {!searchQuery &&
                  !selectedStatus &&
                  "There are no book borrowing records in the system yet"}
              </p>
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
            {selectedStatus && (
              <Button
                variant="outline"
                className="mt-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => handleStatusFilter(null)}
              >
                Show all requests
              </Button>
            )}
          </div>
        )}

        {filteredRequests.length > 0 && (
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <div>
              Showing{" "}
              {filteredRequests.length > 0
                ? `${(currentPage - 1) * requestsPerPage + 1}-${Math.min(currentPage * requestsPerPage, filteredRequests.length)}`
                : "0"}{" "}
              of {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"}
              {(searchQuery || selectedStatus) && " (filtered)"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 border-gray-300 px-3 py-1 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                className="h-8 border-gray-300 px-3 py-1 text-xs"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="mb-4 text-xl">
                Borrow Request Details
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="h-32 w-24 overflow-hidden rounded">
                  <BookCover
                    coverColor={selectedRequest.book.coverColor}
                    coverImage={selectedRequest.book.coverUrl}
                    variant="small"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedRequest.book.title}
                  </h3>
                  <p className="text-gray-600">{selectedRequest.book.author}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Genre: {selectedRequest.book.genre}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-amber-100">
                        {getInitials(selectedRequest.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedRequest.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedRequest.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-xs text-gray-500">University ID</p>
                  <p className="font-medium">
                    {selectedRequest.user.universityId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedRequest.status === "RETURNED"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Borrow Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedRequest.borrowDate),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.dueDate), "dd MMM yyyy")}
                  </p>
                </div>
                {selectedRequest.returnDate && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Return Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedRequest.returnDate),
                        "dd MMM yyyy"
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  variant="outline"
                  className="border-gray-200"
                >
                  Close
                </Button>

                {selectedRequest.status === "BORROWED" && (
                  <Button
                    onClick={() => {
                      handleMarkAsReturned(selectedRequest.id);
                      setIsDetailModalOpen(false);
                    }}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Mark as Returned
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default BorrowRequestsPage;
