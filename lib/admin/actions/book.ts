"use server";

import { db } from "@/db/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createBook = async (params: BookParams) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
      })
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while creating the book.",
    };
  }
};

export const updateBook = async (id: string, params: BookParams) => {
  try {
    // If totalCopies is being updated, adjust availableCopies
    let availableCopiesAdjustment = 0;

    if (params.totalCopies !== undefined) {
      // Get the current book to calculate the difference
      const currentBook = await db
        .select()
        .from(books)
        .where(eq(books.id, id))
        .limit(1);

      if (currentBook.length > 0) {
        const currentTotalCopies = currentBook[0].totalCopies;
        const currentAvailableCopies = currentBook[0].availableCopies;

        // Calculate how many new copies are being added
        const copiesDifference = params.totalCopies - currentTotalCopies;

        // Add the difference to available copies
        availableCopiesAdjustment = copiesDifference;
      }
    }

    // Create update object
    const updateData: Partial<typeof books.$inferInsert> = { ...params };

    // If we need to adjust available copies, add that to update data
    if (availableCopiesAdjustment !== 0) {
      // Get the current book to calculate the new available copies
      const currentBook = await db
        .select()
        .from(books)
        .where(eq(books.id, id))
        .limit(1);

      if (currentBook.length > 0) {
        const currentAvailableCopies = currentBook[0].availableCopies;
        updateData.availableCopies =
          currentAvailableCopies + availableCopiesAdjustment;
      }
    }

    const updatedBook = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBook[0])),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while updating the book.",
    };
  }
};
