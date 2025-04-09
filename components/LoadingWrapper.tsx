"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loading } from "./ui/loading";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Create a unique key for the current route
  const routeKey = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  // Handle initial page load
  useEffect(() => {
    // Short timeout for initial page load animation
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle route changes
  useEffect(() => {
    if (!initialLoad) {
      // Show loading state when route changes
      setIsLoading(true);

      // Simulate fetch delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, initialLoad]);

  return (
    <>
      {/* Global loading overlay for route changes */}
      <Loading
        isLoading={isLoading || initialLoad}
        fullscreen
        text="Loading content"
      />

      {/* Page content with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
