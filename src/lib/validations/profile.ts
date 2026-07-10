import { z } from "zod";
import { passwordSchema } from "@/lib/validations/auth";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  image: z.string().trim().url("Enter a valid image URL").max(2048).optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
