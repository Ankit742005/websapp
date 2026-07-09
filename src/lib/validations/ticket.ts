import { z } from "zod";
import { ticketStatusSchema, ticketPrioritySchema } from "@/lib/constants/enums";

/** Create ticket — subject required (3–140 chars per US-2 AC). */
export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(140, "Subject must be under 140 characters"),
  body: z.string().trim().min(1, "Description is required").max(10_000),
  contactId: z.string().min(1, "Select a contact"),
  priority: ticketPrioritySchema,
  assigneeId: z.string().optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

/** Update ticket fields. All optional — partial update. */
export const updateTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(140)
    .optional(),
  body: z.string().trim().min(1).max(10_000).optional(),
  contactId: z.string().min(1).optional(),
  priority: ticketPrioritySchema.optional(),
  assigneeId: z.string().nullable().optional(),
  status: ticketStatusSchema.optional(),
});
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

/** Add a comment to a ticket. */
export const createCommentSchema = z.object({
  ticketId: z.string().min(1, "Ticket is required"),
  body: z.string().trim().min(1, "Comment cannot be empty").max(10_000),
  isInternal: z.boolean().default(false),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
