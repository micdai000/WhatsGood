import { z } from "zod";
import { LIMITS } from "@/lib/constants";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(
      LIMITS.PASSWORD_MIN_LENGTH,
      `Password must be at least ${LIMITS.PASSWORD_MIN_LENGTH} characters`,
    ),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(LIMITS.FULL_NAME_MAX_LENGTH),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        LIMITS.PASSWORD_MIN_LENGTH,
        `Password must be at least ${LIMITS.PASSWORD_MIN_LENGTH} characters`,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
