"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { borrowBook } from "@/lib/actions/book";
import { BookOpen } from "lucide-react";

interface Props {
  userId: string;
  bookId: string;
  borrowingEligibility?: {
    isEligible: boolean;
    message: string;
  };
}
const BorrowBook = ({
  userId,
  bookId,
  borrowingEligibility = {
    isEligible: false,
    message: "Unable to determine eligibility",
  },
}: Props) => {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);

  // Destructure borrowingEligibility after providing default
  const { isEligible, message } = borrowingEligibility;

  const handleBorrowBook = async () => {
    if (!isEligible) {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return; // Add return here to prevent borrowing if not eligible
    }

    setBorrowing(true);

    try {
      const result = await borrowBook({ bookId, userId });

      if (result.success) {
        toast({
          title: "Success",
          description: "Book borrowed successfully.",
        });

        router.push("/");
      } else {
        toast({
          title: "Error",
          description:
            result.error || "An error occurred while borrowing the book.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while borrowing the book.",
        variant: "destructive",
      });
    } finally {
      setBorrowing(false);
    }
  };
  return (
    <Button
      className="book-overview-btn"
      onClick={handleBorrowBook}
      disabled={borrowing || !isEligible}
    >
      <BookOpen className="h-5 w-5 mr-2" />
      <p className="font-bebas-neue text-xl text-dark-100">
        {borrowing ? "Borrowing ..." : "Borrow Book"}
      </p>
    </Button>
  );
};

export default BorrowBook;
