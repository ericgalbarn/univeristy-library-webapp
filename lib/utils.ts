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
