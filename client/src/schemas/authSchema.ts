import { z } from "zod";
export const loginSchema = z.object({
  email: z.email().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const signupSchema = z.object({
  name: z.string(),
  // .min(2, { message: "Full name must be at least 2 characters" })
  // .max(50, { message: "Full name must be under 50 characters" }),
  email: z.email().min(1, { message: "Email is required" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  // .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
  // .regex(/[0-9]/, { message: "Must contain at least one number" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
