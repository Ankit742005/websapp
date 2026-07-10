import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters").max(80),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
