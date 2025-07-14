"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";

interface FavoriteButtonProps {
  bookId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const FavoriteButton = ({
  bookId,
  className,
  size = "md",
}: FavoriteButtonProps) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Size variants
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Check if book is favorited on component mount
  useEffect(() => {
    if (session?.user) {
      console.log("🔍 Checking favorite status for book:", bookId);
      checkFavoriteStatus();
    } else {
      console.log("❌ No session found for favorite check");
    }
  }, [session, bookId]);

  // Check if book is in user's favorites
  const checkFavoriteStatus = async () => {
    try {
      console.log("📡 Fetching favorite status from API...");
      const response = await fetch(`/api/books/favorite?bookId=${bookId}`);
      const data = await response.json();

      console.log("📡 Favorite status response:", data);

      if (data.success) {
        setIsFavorite(data.favorited);
        console.log("✅ Favorite status set to:", data.favorited);
      } else {
        console.error("❌ Failed to check favorite status:", data.error);
      }
    } catch (error) {
      console.error("❌ Error checking favorite status:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any parent link navigation
    e.stopPropagation(); // Stop event bubbling

    console.log("🎯 Toggle favorite clicked for book:", bookId);
    console.log("👤 Session user:", session?.user);

    if (!session?.user) {
      console.log("❌ No session - showing auth toast");
      toast({
        title: "Authentication required",
        description: "Please sign in to add books to favorites",
        variant: "destructive",
      });
      return;
    }

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    setIsLoading(true);

    try {
      // Optimistically update UI first for immediate feedback
      const newFavoriteState = !isFavorite;
      console.log("🔄 Optimistically updating UI to:", newFavoriteState);
      setIsFavorite(newFavoriteState);

      const method = newFavoriteState ? "POST" : "DELETE";
      const endpoint = "/api/books/favorite";

      console.log("📡 Making API request:", { method, endpoint, bookId });

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await response.json();
      console.log("📡 API response:", data);

      if (data.success) {
        // Ensure UI state matches server state
        setIsFavorite(data.favorited);
        console.log("✅ Success! Final favorite state:", data.favorited);
        toast({
          title: data.favorited
            ? "Added to favorites"
            : "Removed from favorites",
          description: data.message,
        });
      } else {
        // Revert to original state if there was an error
        console.log("❌ API error, reverting state");
        setIsFavorite(!newFavoriteState);
        toast({
          title: "Error",
          description: data.error || "Failed to update favorites",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Revert to original state if there was an error
      console.log("❌ Network/fetch error, reverting state:", error);
      setIsFavorite(!isFavorite);
      console.error("Error toggling favorite status:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={toggleFavorite}
      disabled={isLoading}
      variant="outline"
      size="icon"
      className={cn(
        "bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200 relative overflow-hidden",
        "hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300",
        isAnimating && "animate-pulse",
        isFavorite && "shadow-rose-100 border-red-200",
        className
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "transition-all duration-300",
          sizeStyles[size],
          isFavorite ? "fill-red-500 text-red-500" : "text-gray-400",
          isAnimating && "scale-125",
          isLoading && "animate-pulse"
        )}
      />

      {/* Simple ripple effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-red-100 opacity-50 animate-ping" />
      )}
    </Button>
  );
};

export default FavoriteButton;
