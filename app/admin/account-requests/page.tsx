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
  UserPlus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import config from "@/lib/config";
import { toast } from "@/hooks/use-toast";

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

// Add this EmptyState component right after the imports but before the AccountRequestsPage component definition
const EmptyState = ({
  activeTab,
  onClearSearch,
}: {
  activeTab: string;
  onClearSearch?: () => void;
}) => {
  let title = "No account requests found";
  let message = "";

  switch (activeTab) {
    case "pending":
      title = "No pending account requests";
      message =
        "There are no pending account verification requests at this time.";
      break;
    case "approved":
      title = "No approved accounts";
      message = "You haven't approved any account requests yet.";
      break;
    case "rejected":
      title = "No rejected accounts";
      message = "You haven't rejected any account requests yet.";
      break;
    default:
      title = "No account requests";
      message = "There are no account verification requests at this time.";
  }

  return (
    <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
        <UserPlus className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {onClearSearch && (
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSearch}
            className="text-xs"
          >
            Clear search
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-xs hover:bg-amber-700"
          >
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
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

  // Export to Excel
  const handleExport = async () => {
    try {
      const response = await axios.get("/api/admin/account-requests/export", {
        responseType: "blob",
      });

      // Create a download link for the Excel file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `account-requests-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting account requests:", error);
      toast({
        title: "Export failed",
        description: "Failed to export account requests. Please try again.",
        variant: "destructive",
      });
    }
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

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Account Approval Requests</h2>
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
            onClick={handleExport}
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
              placeholder="Search by name, email, ID..."
              className={`w-full rounded-md border ${searchQuery ? "border-primary-admin" : "border-gray-300"} px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin`}
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search account requests"
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
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => handleTabChange("all")}
              className={
                activeTab === "all" ? "bg-primary-admin text-white" : ""
              }
              size="sm"
            >
              All
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              onClick={() => handleTabChange("pending")}
              className={
                activeTab === "pending" ? "bg-amber-600 text-white" : ""
              }
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={activeTab === "approved" ? "default" : "outline"}
              onClick={() => handleTabChange("approved")}
              className={
                activeTab === "approved" ? "bg-green-600 text-white" : ""
              }
              size="sm"
            >
              Approved
            </Button>
            <Button
              variant={activeTab === "rejected" ? "default" : "outline"}
              onClick={() => handleTabChange("rejected")}
              className={
                activeTab === "rejected" ? "bg-red-600 text-white" : ""
              }
              size="sm"
            >
              Rejected
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
            <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 p-4 font-medium">
              <div className="col-span-2">User</div>
              <div>University ID</div>
              <div>Date Requested</div>
              <div>Actions</div>
            </div>

            <div>
              {currentRecords.map((request) => (
                <div
                  key={request.id}
                  className="grid grid-cols-5 gap-4 border-b border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${request.fullName}&background=random`}
                        alt={request.fullName}
                      />
                      <AvatarFallback>
                        {request.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.fullName}
                      </p>
                      <p className="text-sm text-gray-500">{request.email}</p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          request.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : request.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    {request.universityId}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    {format(new Date(request.createAt), "dd MMM yyyy")}
                  </div>

                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="h-8 w-8 rounded-full bg-gray-100 p-0 text-gray-600 hover:bg-gray-200"
                            title="View Details"
                            onClick={() => handleViewDetails(request)}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              ></path>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              ></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {request.status === "PENDING" && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="h-8 w-8 rounded-full bg-green-100 p-0 text-green-800 hover:bg-green-200"
                                title="Approve"
                                disabled={processingIds.includes(request.id)}
                                onClick={() =>
                                  handleStatusUpdate(request.id, "APPROVED")
                                }
                              >
                                {processingIds.includes(request.id) ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Approve this account</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="h-8 w-8 rounded-full bg-red-100 p-0 text-red-800 hover:bg-red-200"
                                title="Reject"
                                disabled={processingIds.includes(request.id)}
                                onClick={() =>
                                  handleStatusUpdate(request.id, "REJECTED")
                                }
                              >
                                {processingIds.includes(request.id) ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-800 border-t-transparent" />
                                ) : (
                                  <XIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reject this account</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            activeTab={activeTab}
            onClearSearch={
              searchQuery
                ? () => {
                    setSearchQuery("");
                    setFilteredRequests(requests);
                  }
                : undefined
            }
          />
        )}

        {filteredRequests.length > 0 && (
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <div>
              Showing{" "}
              {filteredRequests.length > 0
                ? `${indexOfFirstRecord + 1}-${Math.min(
                    indexOfLastRecord,
                    filteredRequests.length
                  )}`
                : "0"}{" "}
              of {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"}
              {searchQuery && " (filtered)"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 border-gray-300 px-3 py-1 text-xs"
                disabled={currentPage === 1}
                onClick={() => paginate(Math.max(1, currentPage - 1))}
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
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="mb-4 text-xl">
                  Account Request Details
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-6">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-amber-100 text-lg">
                      {selectedRequest.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {selectedRequest.fullName}
                    </h3>
                    <p className="text-gray-600">{selectedRequest.email}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      University ID: {selectedRequest.universityId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="text-xs text-gray-500">Request Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedRequest.createAt),
                        "dd MMMM yyyy, HH:mm"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        selectedRequest.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : selectedRequest.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    University Card/ID
                  </p>
                  <div className="overflow-hidden rounded border border-gray-200">
                    <img
                      src={`${config.env.imagekit.urlEndpoint}${selectedRequest.universityCard}`}
                      alt="University Card"
                      className="w-full object-contain"
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
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setDetailModalOpen(false)}
                    variant="outline"
                    className="border-gray-200"
                  >
                    Close
                  </Button>

                  {selectedRequest.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedRequest.id, "REJECTED");
                        }}
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        disabled={processingIds.includes(selectedRequest.id)}
                      >
                        {processingIds.includes(selectedRequest.id) ? (
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-700 border-t-transparent" />
                        ) : null}
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedRequest.id, "APPROVED");
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                        disabled={processingIds.includes(selectedRequest.id)}
                      >
                        {processingIds.includes(selectedRequest.id) ? (
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : null}
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
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
    </section>
  );
};

export default AccountRequestsPage;
