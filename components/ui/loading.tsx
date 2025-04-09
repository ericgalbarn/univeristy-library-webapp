"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  isLoading: boolean;
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

const loadingVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 1.5,
      ease: "linear",
    },
  },
};

const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 1.2,
      times: [0, 0.5, 1],
      ease: "easeInOut",
    },
  },
};

export function Loading({
  isLoading,
  text = "Loading",
  fullscreen = false,
  className,
}: LoadingProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={cn(
            "flex flex-col items-center justify-center p-8 gap-6 z-50 backdrop-blur-sm",
            fullscreen ? "fixed inset-0 bg-dark-100/80" : "relative min-h-40",
            className
          )}
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="relative">
            {/* Outer spinning circle */}
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
              variants={spinnerVariants}
              animate="animate"
            />

            {/* Inner bouncing elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-primary rounded-full"
                    variants={bounceVariants}
                    animate="animate"
                    transition={{ delay: index * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-light-100 text-lg font-medium">{text}</p>
            <p className="text-light-300 text-sm text-center max-w-xs">
              Please wait while we prepare your content...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Create a simpler, smaller loading indicator for inline usage
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "w-8 h-8 rounded-full border-2 border-primary border-t-transparent",
        className
      )}
      variants={spinnerVariants}
      animate="animate"
    />
  );
}

// Create a loading skeleton that can be used for content placeholders
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-dark-300", className)} />
  );
}

// Export a book card skeleton for consistent loading throughout the app
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col space-y-4 animate-pulse">
      <div className="relative">
        <div className="xs:w-[174px] w-[114px] xs:h-[239px] h-[169px] bg-dark-300 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-dark-300 rounded w-3/4" />
        <div className="h-3 bg-dark-300 rounded w-1/2" />
      </div>
    </div>
  );
}
