"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { userUpdateSchema } from "./schema";

export async function getAllUsers() {
  try {
    const allUsers = await db
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
      .from(users)
      .orderBy(users.createAt);

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