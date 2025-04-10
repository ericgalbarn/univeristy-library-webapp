import { books as booksSchema } from "@/db/schema";
import { db } from "@/db/db";
import { eq, not, desc, asc, sql } from "drizzle-orm";

// Book type with all required fields
export type SimpleBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  coverColor: string;
  rating: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  videoUrl: string;
  summary: string;
  createdAt: Date | null;
};

// Recommendation with score
export type Recommendation = SimpleBook & {
  similarityScore: number;
};

// Genre relationship map - define semantic relationships between genres
// Higher value means more closely related (0-1 scale)
const genreRelationships: Record<string, Record<string, number>> = {
  // Sports hierarchy
  sport: {
    football: 0.9,
    basketball: 0.9,
    tennis: 0.9,
    cricket: 0.9,
    swimming: 0.9,
    athletics: 0.9,
    fitness: 0.8,
    health: 0.7,
  },
  football: {
    sport: 0.9,
    soccer: 0.95,
  },
  basketball: {
    sport: 0.9,
  },
  tennis: {
    sport: 0.9,
  },
  cricket: {
    sport: 0.9,
  },

  // Art and culture
  art: {
    painting: 0.9,
    sculpture: 0.9,
    photography: 0.8,
    music: 0.7,
    dance: 0.7,
    theater: 0.7,
    literature: 0.6,
  },
  music: {
    art: 0.7,
    dance: 0.6,
  },

  // Science categories
  science: {
    physics: 0.9,
    chemistry: 0.9,
    biology: 0.9,
    astronomy: 0.9,
    mathematics: 0.8,
    psychology: 0.6,
    "computer science": 0.8,
  },

  // Fiction categories
  fiction: {
    mystery: 0.8,
    thriller: 0.8,
    romance: 0.7,
    "science fiction": 0.8,
    fantasy: 0.8,
    "historical fiction": 0.8,
    horror: 0.7,
    adventure: 0.8,
  },

  // Add more relationships as needed
};

/**
 * Calculate similarity between two genres
 * Returns a score between 0-1 where 1 is exact match
 */
function calculateGenreSimilarity(genre1: string, genre2: string): number {
  // Convert to lowercase for comparison
  const g1 = genre1.toLowerCase();
  const g2 = genre2.toLowerCase();

  // Exact match
  if (g1 === g2) return 1.0;

  // Check defined relationships (in both directions)
  if (genreRelationships[g1] && genreRelationships[g1][g2] !== undefined) {
    return genreRelationships[g1][g2];
  }

  if (genreRelationships[g2] && genreRelationships[g2][g1] !== undefined) {
    return genreRelationships[g2][g1];
  }

  // Fall back to word matching if no relationship is defined
  const words1 = g1.split(/[\s,]+/).filter((w) => w.length > 2);
  const words2 = g2.split(/[\s,]+/).filter((w) => w.length > 2);

  // Count matching words
  let matchingWords = 0;
  for (const word of words1) {
    if (words2.includes(word)) matchingWords++;
  }

  // Calculate similarity score based on matching words
  if (matchingWords > 0) {
    return 0.5 * (matchingWords / Math.max(words1.length, words2.length));
  }

  // Default low similarity for unrelated genres
  return 0.05;
}

/**
 * Get recommendations for a specific book
 */
export async function getBookRecommendations(
  bookId: string,
  limit: number = 4
): Promise<Recommendation[]> {
  try {
    // Get the source book
    const sourceBook = await db
      .select()
      .from(booksSchema)
      .where(eq(booksSchema.id, bookId))
      .limit(1);

    if (!sourceBook || sourceBook.length === 0) {
      return [];
    }

    // Get the genre to compare with
    const genre = sourceBook[0].genre;

    // Get all other books ordered by most recent
    const otherBooks = await db
      .select()
      .from(booksSchema)
      .where(not(eq(booksSchema.id, bookId)))
      .orderBy(desc(booksSchema.createdAt))
      .limit(50); // Limit to 50 for performance

    // Score books by genre similarity
    const scoredBooks: Recommendation[] = otherBooks.map((book) => {
      const score = calculateGenreSimilarity(genre, book.genre);

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        coverUrl: book.coverUrl,
        coverColor: book.coverColor,
        rating: book.rating,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        description: book.description,
        videoUrl: book.videoUrl,
        summary: book.summary,
        createdAt: book.createdAt,
        similarityScore: score,
      };
    });

    // Sort by similarity score (highest first) and take top N
    return scoredBooks
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting book recommendations:", error);
    return [];
  }
}
