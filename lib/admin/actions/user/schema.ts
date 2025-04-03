import { STATUS_ENUM, ROLE_ENUM } from "@/db/schema";
import { z } from "zod";

export const userUpdateSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  universityId: z.coerce.number().int().positive("University ID must be a positive number"),
  status: z.enum(STATUS_ENUM.enumValues),
  role: z.enum(ROLE_ENUM.enumValues),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(STATUS_ENUM.enumValues).optional(),
  role: z.enum(ROLE_ENUM.enumValues).optional(),
  sortBy: z.enum(['fullName', 'email', 'universityId', 'status', 'role', 'lastActivityDate', 'createAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  lastActiveAfter: z.string().optional(),
  lastActiveBefore: z.string().optional(),
});