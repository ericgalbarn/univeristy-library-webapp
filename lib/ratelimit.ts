// Temporary mock rate limiter to bypass Redis dependency
// import redis from "@/db/redis";
// import { Ratelimit } from "@upstash/ratelimit";

// const ratelimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.fixedWindow(5, "1m"),
//   analytics: true,
//   prefix: "@upstash/ratelimit",
// });

// Simple in-memory rate limiter (not persistent across restarts)
// Stores IP addresses and their request counts with timestamps

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimit {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // If no entry exists or window has expired, create/reset
    if (!entry || now > entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { success: true };
    }

    // If within window, check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return { success: false };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    // Clean up expired entries periodically
    if (Math.random() < 0.1) {
      // 10% chance to clean up on each request
      this.cleanup();
    }

    return { success: true };
  }

  private cleanup() {
    const now = Date.now();
    Array.from(this.store.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    });
  }
}

const ratelimit = new InMemoryRateLimit(5, 60000); // 5 requests per minute

export default ratelimit;
