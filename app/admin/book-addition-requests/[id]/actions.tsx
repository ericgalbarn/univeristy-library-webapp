"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BookRequestActionsProps {
  id: string;
}

const BookRequestActions = ({ id }: BookRequestActionsProps) => {
  const router = useRouter();
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/book-requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewNote,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          status === "APPROVED"
            ? "Book request approved and added to library"
            : "Book request rejected"
        );

        // Refresh the page to show the updated status
        router.refresh();

        // Navigate to success page if approved, back to list if rejected
        if (status === "APPROVED") {
          router.push("/admin/book-addition-requests/success");
        } else {
          router.push("/admin/book-addition-requests/rejection");
        }
      } else {
        toast.error(data.error || "Failed to update book request");
      }
    } catch (error) {
      console.error("Error updating book request:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="reviewNote"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Review Notes
        </label>
        <Textarea
          id="reviewNote"
          placeholder="Add notes about your decision (optional)"
          className="w-full min-h-[100px]"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => handleAction("REJECTED")}
          disabled={isSubmitting}
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          {isSubmitting ? "Processing..." : "Reject Request"}
        </Button>

        <Button
          onClick={() => handleAction("APPROVED")}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? "Processing..." : "Approve & Add to Library"}
        </Button>
      </div>
    </div>
  );
};

export default BookRequestActions;
