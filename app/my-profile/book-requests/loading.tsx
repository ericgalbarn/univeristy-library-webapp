import { LoadingSkeleton } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BookRequestsLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-300 rounded w-56 mb-1 text-white"></div>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" disabled className="text-white">
            <Link href="/my-profile">Back to Profile</Link>
          </Button>
          <Button asChild disabled className="text-dark-100">
            <Link href="/request-book">Request New Book</Link>
          </Button>
        </div>
      </div>

      <div className="bg-dark-300 rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="bg-dark-400 py-3 px-6">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-dark-500 rounded"></div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-dark-200">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`h-4 bg-dark-400 rounded ${
                      colIndex === 0 ? "w-4/5" : "w-3/4"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
