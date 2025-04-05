"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Users,
  BookOpen,
  UserPlus,
  BookMarked,
} from "lucide-react";

// Activity type
type Activity = {
  id: string;
  type: "USER_REGISTERED" | "BOOK_ADDED" | "BOOK_BORROWED" | "ACCOUNT_REQUEST";
  userName?: string;
  bookTitle?: string;
  status?: string;
  timestamp: string;
};

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const activitiesPerPage = 10;

  // Fetch all activities
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/admin/dashboard-stats");

      if (response.data.success) {
        // In a real application, you would have a dedicated endpoint for paginated activities
        // For now, we're using the dashboard stats endpoint which returns recent activities

        // Mock more activities for demonstration purposes
        const baseActivities = response.data.stats.recentActivity || [];
        const expandedActivities: Activity[] = [...baseActivities];

        // Add some mock data to demonstrate pagination (in a real app, this would come from the API)
        if (baseActivities.length > 0) {
          // Generate 25 mock activities (enough to see pagination)
          for (let i = 0; i < 25; i++) {
            const randomBase = baseActivities[i % baseActivities.length];
            if (randomBase) {
              const mockActivity = {
                ...randomBase,
                id: `mock-${randomBase.id}-${i}`,
                timestamp: new Date(Date.now() - i * 3600000).toISOString(), // Different timestamps
              };
              expandedActivities.push(mockActivity);
            }
          }
        }

        setActivities(expandedActivities);
        setTotalPages(Math.ceil(expandedActivities.length / activitiesPerPage));
      } else {
        throw new Error(response.data.error || "Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Failed to fetch activity data. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    // For older activities, show the actual date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format activity date for sorting and table display
  const formatActivityDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render activity icon based on type
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case "USER_REGISTERED":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "BOOK_ADDED":
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case "BOOK_BORROWED":
        return <BookMarked className="h-4 w-4 text-purple-500" />;
      case "ACCOUNT_REQUEST":
        return <UserPlus className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  // Get activity message based on type
  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case "USER_REGISTERED":
        return `${activity.userName} registered`;
      case "BOOK_ADDED":
        return `New book added: "${activity.bookTitle}"`;
      case "BOOK_BORROWED":
        return `${activity.userName} borrowed "${activity.bookTitle}"`;
      case "ACCOUNT_REQUEST":
        return `${activity.userName} ${activity.status === "APPROVED" ? "was approved" : "requested an account"}`;
      default:
        return "Activity recorded";
    }
  };

  // Get current page activities
  const getCurrentPageActivities = () => {
    const startIndex = (currentPage - 1) * activitiesPerPage;
    const endIndex = startIndex + activitiesPerPage;
    return activities.slice(startIndex, endIndex);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities();
    toast({
      title: "Refreshing",
      description: "Updating activity data...",
    });
  };

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="h-8 w-8 p-0">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">Activity Log</h2>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-admin"></div>
            <p className="text-sm text-gray-500">Loading activity data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No activities found</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getCurrentPageActivities().map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          {renderActivityIcon(activity.type)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getActivityMessage(activity)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {formatActivityDate(activity.timestamp)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * activitiesPerPage + 1} to{" "}
              {Math.min(currentPage * activitiesPerPage, activities.length)} of{" "}
              {activities.length} activities
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ActivitiesPage;
