"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  X,
  Download,
  Check,
  X as XIcon,
  Image,
  ZoomIn,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import config from "@/lib/config";

// Type definition for account requests
type AccountRequestType = {
  id: string;
  fullName: string;
  email: string;
  universityId: number;
  universityCard: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createAt: string;
};

const AccountRequestsPage = () => {
  // State variables
  const [requests, setRequests] = useState<AccountRequestType[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    AccountRequestType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<AccountRequestType | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 10;
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Helper function to prepare image URL
  const getImageUrl = (url: string) => {
    if (!url) return "";
    console.log("Original university card URL:", url);

    // If it's already an ImageKit URL, return it
    if (url.includes("imagekit.io")) {
      return url;
    }

    // Use the config from the application
    return `${config.env.imagekit.urlEndpoint}/${url}`;
  };

  // Fetch account requests
  const fetchAccountRequests = async (status = "PENDING") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/api/admin/account-requests?status=${status === "all" ? "ALL" : status.toUpperCase()}`
      );
      if (response.data.success) {
        // Log the response to help debug
        console.log("API Response:", response.data);

        // Log the first request's universityCard if available
        if (response.data.requests && response.data.requests.length > 0) {
          const sampleRequest = response.data.requests[0];
          console.log("Sample request data:", {
            id: sampleRequest.id,
            fullName: sampleRequest.fullName,
            universityCard: sampleRequest.universityCard,
          });

          if (sampleRequest.universityCard) {
            console.log(
              "ImageKit URL for sample card:",
              `${config.env.imagekit.urlEndpoint}${sampleRequest.universityCard}`
            );
          } else {
            console.log("No university card found in the sample request");
          }
        }

        setRequests(response.data.requests);
        setFilteredRequests(response.data.requests);
        setTotalPages(
          Math.ceil(response.data.requests.length / recordsPerPage)
        );
      } else {
        setError(response.data.error || "Failed to fetch account requests");
      }
    } catch (err) {
      setError("An error occurred while fetching account requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchAccountRequests();
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    let statusFilter;

    switch (value) {
      case "pending":
        statusFilter = "PENDING";
        break;
      case "approved":
        statusFilter = "APPROVED";
        break;
      case "rejected":
        statusFilter = "REJECTED";
        break;
      default:
        statusFilter = "ALL";
    }

    fetchAccountRequests(statusFilter);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(
        (request) =>
          request.fullName.toLowerCase().includes(query.toLowerCase()) ||
          request.email.toLowerCase().includes(query.toLowerCase()) ||
          request.universityId.toString().includes(query)
      );
      setFilteredRequests(filtered);
    }

    setCurrentPage(1);
  };

  // Handle approval/rejection of account requests
  const handleStatusUpdate = async (
    userId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setProcessingIds((prev) => [...prev, userId]);
    try {
      const response = await axios.put("/api/admin/account-requests", {
        userId,
        status,
      });

      if (response.data.success) {
        // Update the local state
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === userId ? { ...request, status } : request
          )
        );

        // Update filtered requests as well
        setFilteredRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === userId ? { ...request, status } : request
          )
        );

        // If we're in a modal, close it
        if (detailModalOpen && selectedRequest?.id === userId) {
          setDetailModalOpen(false);
        }
      } else {
        setError(response.data.error || "Failed to update user status");
      }
    } catch (err) {
      setError("An error occurred while updating user status");
      console.error(err);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Pagination handlers
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculate pagination indices
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRequests.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Refresh data
  const handleRefresh = () => {
    fetchAccountRequests(activeTab === "all" ? "ALL" : activeTab.toUpperCase());
  };

  // View account request details
  const handleViewDetails = (request: AccountRequestType) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
    // Log to help debug
    console.log("Viewing request details:", request);
    console.log("University card from request:", request.universityCard);
    console.log(
      "ImageKit URL:",
      `${config.env.imagekit.urlEndpoint}${request.universityCard}`
    );
  };

  // Export to Excel (placeholder)
  const handleExport = () => {
    alert("Export feature will be implemented here");
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredRequests(requests);
  };

  // Handle image enlarge
  const handleEnlargeImage = (url: string) => {
    setEnlargedImage(url);
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
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
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-medium">No account requests found</h3>
      {activeTab === "pending" ? (
        <p className="mb-4 text-sm text-gray-500">
          There are no pending account requests at this time.
        </p>
      ) : (
        <p className="mb-4 text-sm text-gray-500">
          {activeTab === "approved"
            ? "No approved accounts found matching your criteria."
            : "No rejected accounts found matching your criteria."}
        </p>
      )}
      {searchQuery && (
        <Button variant="outline" onClick={handleClearSearch} size="sm">
          Clear search
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Requests</h1>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExport}
                  disabled={loading || filteredRequests.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export to Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Account Approval Requests
              </h3>
              <p className="text-sm text-muted-foreground">
                Review and manage user account requests
              </p>
            </div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search by name, email, ID..."
                className="w-full rounded-md border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-primary-admin focus:outline-none focus:ring-1 focus:ring-primary-admin"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <div className="mb-4 grid w-full grid-cols-4">
            <button
              className={`px-3 py-2 text-sm font-medium ${activeTab === "pending" ? "border-b-2 border-primary-admin text-primary-admin" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => handleTabChange("pending")}
            >
              Pending
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium ${activeTab === "approved" ? "border-b-2 border-primary-admin text-primary-admin" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => handleTabChange("approved")}
            >
              Approved
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium ${activeTab === "rejected" ? "border-b-2 border-primary-admin text-primary-admin" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => handleTabChange("rejected")}
            >
              Rejected
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium ${activeTab === "all" ? "border-b-2 border-primary-admin text-primary-admin" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => handleTabChange("all")}
            >
              All Requests
            </button>
          </div>

          <div className="mt-0">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary-admin" />
              </div>
            ) : error ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <div className="mb-2 text-red-500">
                  <svg
                    className="mx-auto h-10 w-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <p className="text-lg font-medium">Error loading data</p>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <Button
                  onClick={handleRefresh}
                  className="mt-4"
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredRequests.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">University ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b border-gray-200 text-sm hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Avatar className="mr-3 h-8 w-8">
                                <AvatarImage
                                  src={`https://ui-avatars.com/api/?name=${request.fullName}&background=random`}
                                  alt={request.fullName}
                                />
                                <AvatarFallback>
                                  {request.fullName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {request.fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {request.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{request.universityId}</td>
                          <td className="px-4 py-3">
                            {format(new Date(request.createAt), "MMM d, yyyy")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                request.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : request.status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(request)}
                              >
                                View
                              </Button>

                              {request.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                    onClick={() =>
                                      handleStatusUpdate(request.id, "APPROVED")
                                    }
                                    disabled={processingIds.includes(
                                      request.id
                                    )}
                                  >
                                    {processingIds.includes(request.id) ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Approve"
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() =>
                                      handleStatusUpdate(request.id, "REJECTED")
                                    }
                                    disabled={processingIds.includes(
                                      request.id
                                    )}
                                  >
                                    {processingIds.includes(request.id) ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Reject"
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, filteredRequests.length)} of{" "}
                      {filteredRequests.length} records
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page, i, arr) => (
                          <React.Fragment key={page}>
                            {i > 0 && arr[i - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={
                                page === currentPage ? "default" : "outline"
                              }
                              size="icon"
                              onClick={() => paginate(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          paginate(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Account Request Details</DialogTitle>
                <DialogDescription>
                  Review user information and verification documents
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    User Information
                  </h3>
                  <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center">
                      <Avatar className="mr-3 h-12 w-12">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${selectedRequest.fullName}&background=random`}
                          alt={selectedRequest.fullName}
                        />
                        <AvatarFallback>
                          {selectedRequest.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-lg font-medium">
                          {selectedRequest.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedRequest.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          University ID:
                        </span>
                        <span className="text-sm">
                          {selectedRequest.universityId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Registration Date:
                        </span>
                        <span className="text-sm">
                          {format(
                            new Date(selectedRequest.createAt),
                            "MMMM d, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Status:
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            selectedRequest.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : selectedRequest.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    University Card
                  </h3>
                  <div className="rounded-lg border p-4">
                    {selectedRequest.universityCard ? (
                      <>
                        <div
                          className="relative overflow-hidden rounded-md cursor-pointer group"
                          onClick={() =>
                            handleEnlargeImage(
                              `${config.env.imagekit.urlEndpoint}${selectedRequest.universityCard}`
                            )
                          }
                        >
                          <img
                            src={`${config.env.imagekit.urlEndpoint}${selectedRequest.universityCard}`}
                            alt="University Card"
                            className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://placehold.co/400x250/e2e8f0/64748b?text=University+Card";
                              console.error(
                                "Image failed to load:",
                                selectedRequest.universityCard,
                                "Attempted URL:",
                                `${config.env.imagekit.urlEndpoint}${selectedRequest.universityCard}`
                              );
                            }}
                            onLoad={() => {
                              console.log(
                                "Image loaded successfully:",
                                `${config.env.imagekit.urlEndpoint}${selectedRequest.universityCard}`
                              );
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <ZoomIn className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <ZoomIn className="h-3 w-3" /> Click image to enlarge
                          for better verification
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 bg-gray-100 rounded-md">
                        <Image className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          No university card image available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr className="my-4 border-t border-gray-200" />

              <DialogFooter>
                {selectedRequest.status === "PENDING" ? (
                  <div className="flex w-full justify-between">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleStatusUpdate(selectedRequest.id, "REJECTED")
                      }
                      disabled={processingIds.includes(selectedRequest.id)}
                    >
                      {processingIds.includes(selectedRequest.id) ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XIcon className="mr-2 h-4 w-4" />
                      )}
                      Reject Account
                    </Button>
                    <Button
                      onClick={() =>
                        handleStatusUpdate(selectedRequest.id, "APPROVED")
                      }
                      disabled={processingIds.includes(selectedRequest.id)}
                    >
                      {processingIds.includes(selectedRequest.id) ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Approve Account
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setDetailModalOpen(false)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <Dialog
          open={!!enlargedImage}
          onOpenChange={() => setEnlargedImage(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-1 overflow-hidden">
            <div className="relative h-full flex items-center justify-center">
              <img
                src={enlargedImage}
                alt="Enlarged University Card"
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error(
                    "Failed to load enlarged image:",
                    enlargedImage
                  );
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://placehold.co/800x500/e2e8f0/64748b?text=Image+Not+Available";
                }}
                onLoad={() =>
                  console.log(
                    "Enlarged image loaded successfully:",
                    enlargedImage
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                onClick={() => setEnlargedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AccountRequestsPage;
