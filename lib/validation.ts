import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  universityId: z.coerce.number(),
  universityCard: z.string().optional().or(z.literal("")), // Allow empty string for testing
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const bookSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10),
  author: z.string().trim().min(2).max(100),
  genre: z.string().trim().min(2).max(100),
  rating: z.coerce.number().min(1).max(5),
  totalCopies: z.coerce.number().int().positive().lte(10000),
  coverUrl: z.string().nonempty(),
  coverColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-F]{6}$/i),
  videoUrl: z.string().nonempty(),
  summary: z.string().trim().min(10),
});

// Helper functions for multi-genre support
export const genreArrayToString = (genres: string[]): string => {
  return genres.join(",");
};

export const genreStringToArray = (genreString: string): string[] => {
  return genreString
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
};
