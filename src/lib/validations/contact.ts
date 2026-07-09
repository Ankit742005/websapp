import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  company: z.string().trim().max(120).optional(),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .optional(),
  company: z.string().trim().max(120).nullable().optional(),
});
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
