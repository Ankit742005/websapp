import { z } from "zod";

/** Normalize (trim + lowercase) then validate as an email. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

// bcrypt only hashes the first 72 bytes, so we cap length there.
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Keep it under 72 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Your name is required").max(80),
  orgName: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(80),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Missing reset token"),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Missing verification token"),
});
