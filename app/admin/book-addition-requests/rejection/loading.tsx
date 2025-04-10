import React from "react";

export default function RejectionLoading() {
  return (
    <div className="container py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto text-center animate-pulse">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-gray-200"></div>
        </div>

        <div className="h-8 bg-gray-200 rounded max-w-sm mx-auto mb-4"></div>

        <div className="space-y-2 mb-8">
          <div className="h-4 bg-gray-100 rounded max-w-md mx-auto"></div>
          <div className="h-4 bg-gray-100 rounded max-w-sm mx-auto"></div>
        </div>

        <div className="flex justify-center">
          <div className="h-10 bg-gray-100 rounded w-40"></div>
        </div>
      </div>
    </div>
  );
}
