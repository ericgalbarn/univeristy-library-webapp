import { STATUS_ENUM, ROLE_ENUM } from "@/db/schema";
import { z } from "zod";

export const userUpdateSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  universityId: z.coerce.number().int().positive("University ID must be a positive number"),
  status: z.enum(STATUS_ENUM.enumValues),
  role: z.enum(ROLE_ENUM.enumValues),
});