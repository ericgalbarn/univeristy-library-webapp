import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { string } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string): string =>
  name
    .split("")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * Safely encodes a string to base64 in both Node.js and browser environments
 */
export function safeBase64Encode(str: string): string {
  // For Node.js environments
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }

  // For browser environments
  // Handle UTF-8 characters properly
  const utf8Encoder = new TextEncoder();
  const bytes = utf8Encoder.encode(str);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Extracts YouTube video ID from various URL formats
 * @param url YouTube URL (can be youtube.com, youtu.be, or embed formats)
 * @returns YouTube video ID or null if not a valid YouTube URL
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;

  // Match both youtube.com and youtu.be URL formats
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // ID should be 11 characters
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Checks if a URL is a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("youtube-nocookie.com")
  );
}
