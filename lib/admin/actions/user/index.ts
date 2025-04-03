"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { and, asc, desc, eq, like, gte, lte, SQL, or } from "drizzle-orm";
import { z } from "zod";
import { userFiltersSchema, userUpdateSchema } from "./schema";

export async function getAllUsers(filters?: z.infer<typeof userFiltersSchema>) {
  try {
    const conditions: SQL[] = [];
    
    if (filters) {
      // Filter by search query (match name, email, or university ID)
      if (filters.search) {
        const searchTerm = `%${filters.search.trim()}%`;
        
        // Try to parse as a number for direct universityId comparison
        const numericSearch = parseInt(filters.search.trim());
        const isNumeric = !isNaN(numericSearch);
        
        if (isNumeric) {
          // If it's a number, we can do both string match and direct numeric comparison
          conditions.push(or(
            like(users.fullName, searchTerm),
            like(users.email, searchTerm),
            like(users.universityId.toString(), searchTerm),
            eq(users.universityId, numericSearch)
          ));
        } else {
          // If it's not a number, we only do string matching
          conditions.push(or(
            like(users.fullName, searchTerm),
            like(users.email, searchTerm)
          ));
        }
      }
      
      // Filter by status
      if (filters.status) {
        conditions.push(eq(users.status, filters.status));
      }
      
      // Filter by role
      if (filters.role) {
        conditions.push(eq(users.role, filters.role));
      }
      
      // Filter by created date
      if (filters.createdAfter) {
        conditions.push(gte(users.createAt, new Date(filters.createdAfter)));
      }
      if (filters.createdBefore) {
        conditions.push(lte(users.createAt, new Date(filters.createdBefore)));
      }
      
      // Filter by last active date
      if (filters.lastActiveAfter) {
        conditions.push(gte(users.lastActivityDate, new Date(filters.lastActiveAfter)));
      }
      if (filters.lastActiveBefore) {
        conditions.push(lte(users.lastActivityDate, new Date(filters.lastActiveBefore)));
      }
    }
    
    // Start building the query
    let query = db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        status: users.status,
        role: users.role,
        lastActivityDate: users.lastActivityDate,
        createAt: users.createAt,
      })
      .from(users);
    
    // Add conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Add sorting
    if (filters?.sortBy) {
      const column = users[filters.sortBy as keyof typeof users];
      if (column) {
        query = query.orderBy(filters.sortOrder === 'desc' ? desc(column) : asc(column));
      } else {
        // Default sort by creation date
        query = query.orderBy(desc(users.createAt));
      }
    } else {
      // Default sort by creation date
      query = query.orderBy(desc(users.createAt));
    }
    
    const allUsers = await query;

    return {
      success: true,
      data: JSON.parse(JSON.stringify(allUsers)),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "An error occurred while fetching users",
    };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        status: users.status,
        role: users.role,
        universityCard: users.universityCard,
        lastActivityDate: users.lastActivityDate,
        createAt: users.createAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user.length) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(user[0])),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "An error occurred while fetching the user",
    };
  }
}

export async function updateUser(id: string, userData: z.infer<typeof userUpdateSchema>) {
  try {
    // Validate the user data
    const validatedData = userUpdateSchema.parse(userData);
    
    // Update the user
    await db
      .update(users)
      .set({
        fullName: validatedData.fullName,
        email: validatedData.email,
        universityId: validatedData.universityId,
        status: validatedData.status,
        role: validatedData.role,
      })
      .where(eq(users.id, id));

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        validationErrors: error.errors,
      };
    }
    
    return {
      success: false,
      error: "An error occurred while updating the user",
    };
  }
}