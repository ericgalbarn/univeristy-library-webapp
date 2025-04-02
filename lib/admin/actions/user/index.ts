"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getAllUsers = async () => {
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
};

export const getUserById = async (id: string) => {
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
};