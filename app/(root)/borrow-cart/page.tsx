"use client";

import { useEffect, useState } from "react";
import { useBorrowCart } from "@/lib/BorrowCartContext";
import { Button } from "@/components/ui/button";
import BookCover from "@/components/BookCover";
import { useToast } from "@/components/ui/use-toast";
import {
  Trash2,
  Loader2,
  ShoppingCart,
  BookOpen,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BorrowCartPage() {
  const { cartItems, removeFromCart, clearCart } = useBorrowCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; status: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user info when component mounts
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/info");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          const errorData = await response.json();
          console.error("User info error:", errorData);
          setErrorMessage(
            `Failed to fetch user info: ${errorData.error || response.statusText}`
          );
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setErrorMessage("Failed to fetch user info. Please try again later.");
      }
    };

    fetchUserInfo();
  }, []);

  const handleBorrowAll = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your borrow cart is empty. Add some books first!",
        variant: "destructive",
      });
      return;
    }

    if (!user || user.status !== "APPROVED") {
      toast({
        title: "Not eligible",
        description: "Your account is not approved for borrowing books yet.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const requestBody = {
        bookIds: cartItems.map((item) => item.id),
      };

      console.log("Sending request to borrow books:", requestBody);

      const response = await fetch("/api/books/borrow-multiple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Log the raw response for debugging
      console.log("Response status:", response.status, response.statusText);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        toast({
          title: "Success!",
          description: `You've successfully borrowed ${cartItems.length} ${cartItems.length === 1 ? "book" : "books"}!`,
        });
        clearCart();
        router.push("/my-profile");
      } else {
        setErrorMessage(
          data.error || "Failed to borrow books. Please try again."
        );
        toast({
          title: "Error",
          description:
            data.error || "Failed to borrow books. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error borrowing books:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again later.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with gradient background */}
      <div className="mb-10 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-8 shadow-sm">
        <h1 className="text-4xl font-bold mb-3 text-amber-800">
          Your Borrow Cart
        </h1>
        <p className="text-amber-700 text-lg max-w-3xl">
          Review the books you want to borrow and check them out all at once
        </p>

        {cartItems.length > 0 && (
          <Badge
            variant="outline"
            className="mt-4 px-3 py-1 bg-amber-200 text-amber-800 border-amber-300"
          >
            {cartItems.length} {cartItems.length === 1 ? "book" : "books"} in
            cart
          </Badge>
        )}
      </div>

      {/* Show error message if any */}
      {errorMessage && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Error</h3>
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Go browse the library and add some books to your cart to check them
            out all at once!
          </p>
          <Button
            onClick={() => router.push("/browse-library")}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-8"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Browse Books
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div className="bg-amber-50 p-3 rounded-xl inline-flex items-center">
              <CheckCircle2 className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-amber-800">
                Ready to borrow {cartItems.length}{" "}
                {cartItems.length === 1 ? "book" : "books"}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            >
              Clear Cart <X className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cartItems.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-20 h-28 relative overflow-hidden">
                  <BookCover
                    coverColor={book.coverColor}
                    coverImage={book.coverUrl}
                    variant="small"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">by {book.author}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(book.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Remove</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 mb-6 border-t border-amber-100 pt-8">
            <div className="max-w-md mx-auto">
              <Button
                size="lg"
                onClick={handleBorrowAll}
                disabled={isSubmitting || !user || user.status !== "APPROVED"}
                className={cn(
                  "w-full py-6 text-lg font-medium shadow-md",
                  user?.status === "APPROVED"
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Borrow All Books
                  </>
                )}
              </Button>

              {user && user.status !== "APPROVED" && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Your account is not approved for borrowing books yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
