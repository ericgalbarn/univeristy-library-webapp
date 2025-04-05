"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  BookOpen,
  UserPlus,
  BookMarked,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

// Dashboard statistics type
type DashboardStats = {
  totalUsers: number;
  totalBooks: number;
  pendingAccountRequests: number;
  activeBorrowings: number;
  recentActivity: Array<{
    id: string;
    type:
      | "USER_REGISTERED"
      | "BOOK_ADDED"
      | "BOOK_BORROWED"
      | "ACCOUNT_REQUEST";
    userName?: string;
    bookTitle?: string;
    status?: string;
    timestamp: string;
  }>;
  loading: boolean;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBooks: 0,
    pendingAccountRequests: 0,
    activeBorrowings: 0,
    recentActivity: [],
    loading: true,
  });

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // In a real implementation, you'd fetch this data from your API
        // For now, we'll simulate with dummy data
        // const response = await axios.get('/api/admin/dashboard-stats');
        // setStats({...response.data, loading: false});

        // Simulating API response with dummy data
        setTimeout(() => {
          setStats({
            totalUsers: 126,
            totalBooks: 348,
            pendingAccountRequests: 14,
            activeBorrowings: 29,
            recentActivity: [
              {
                id: "1",
                type: "USER_REGISTERED",
                userName: "John Smith",
                timestamp: new Date(
                  Date.now() - 2 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "2",
                type: "BOOK_BORROWED",
                userName: "Maria Garcia",
                bookTitle: "The Great Gatsby",
                timestamp: new Date(
                  Date.now() - 5 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "3",
                type: "ACCOUNT_REQUEST",
                userName: "David Johnson",
                status: "PENDING",
                timestamp: new Date(
                  Date.now() - 8 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "4",
                type: "BOOK_ADDED",
                bookTitle: "To Kill a Mockingbird",
                timestamp: new Date(
                  Date.now() - 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "5",
                type: "ACCOUNT_REQUEST",
                userName: "Sarah Wilson",
                status: "APPROVED",
                timestamp: new Date(
                  Date.now() - 1.5 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
            ],
            loading: false,
          });
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardStats();
  }, []);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
        return <ArrowUpRight className="h-4 w-4 text-gray-500" />;
    }
  };

  // Render activity message based on type
  const getActivityMessage = (activity: any) => {
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

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your library system
          </p>
        </div>

        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <div className="rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  stats.totalUsers.toLocaleString()
                )}
              </h3>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              asChild
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-xs text-blue-600"
            >
              <Link href="/admin/users">
                <span>View all users</span>
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Books Card */}
        <div className="rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Books</p>
              <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  stats.totalBooks.toLocaleString()
                )}
              </h3>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              asChild
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-xs text-emerald-600"
            >
              <Link href="/admin/books">
                <span>Manage books</span>
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Account Requests Card */}
        <div className="rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Requests
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  stats.pendingAccountRequests.toLocaleString()
                )}
              </h3>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <UserPlus className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              asChild
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-xs text-amber-600"
            >
              <Link href="/admin/account-requests">
                <span>Review requests</span>
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Active Borrowings Card */}
        <div className="rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Borrowings
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                {stats.loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  stats.activeBorrowings.toLocaleString()
                )}
              </h3>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <BookMarked className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              asChild
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-xs text-purple-600"
            >
              <Link href="/admin/book-requests">
                <span>Manage borrowings</span>
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <div className="rounded-lg border bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              variant="default"
              className="justify-start gap-2 bg-primary-admin text-white hover:bg-primary-admin/90"
            >
              <Link href="/admin/books/new">
                <BookOpen className="h-4 w-4" />
                Add New Book
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start gap-2">
              <Link href="/admin/book-requests">
                <BookMarked className="h-4 w-4" />
                Manage Book Requests
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start gap-2">
              <Link href="/admin/account-requests?status=PENDING">
                <UserPlus className="h-4 w-4" />
                Review Account Requests
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start gap-2">
              <Link href="/admin/users">
                <Users className="h-4 w-4" />
                User Management
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-white p-5 shadow-sm lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>

          {stats.loading ? (
            // Loading state
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    {renderActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">
              No recent activity to display
            </p>
          )}

          <div className="mt-4 border-t pt-4">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-center text-xs"
            >
              <Link href="#">View all activity</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
