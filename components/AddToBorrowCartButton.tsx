"use client";

import { useBorrowCart } from "@/lib/BorrowCartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AddToBorrowCartButtonProps {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    coverColor: string;
  };
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function AddToBorrowCartButton({
  book,
  className,
  variant = "default",
  size = "default",
}: AddToBorrowCartButtonProps) {
  const { addToCart, removeFromCart, isInCart } = useBorrowCart();
  const [isLoading, setIsLoading] = useState(false);

  const inCart = isInCart(book.id);

  const handleToggleCart = async () => {
    setIsLoading(true);

    try {
      if (inCart) {
        removeFromCart(book.id);
      } else {
        addToCart(book);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleCart}
      disabled={isLoading}
      variant={inCart ? "outline" : variant}
      size={size}
      className={cn(
        "flex items-center gap-2",
        inCart &&
          "border-green-500 text-green-500 hover:text-green-600 hover:border-green-600 hover:bg-green-50/50",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : inCart ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {size !== "icon" && (inCart ? "In Borrow Cart" : "Add to Borrow Cart")}
    </Button>
  );
}
