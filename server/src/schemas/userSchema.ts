import { z } from "zod";
export const createUserSchema = z.object({
  name: z.string({ message: "Name is required" }),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});
export type CreateUser = z.infer<typeof createUserSchema>;

export const loginUserSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});
export type LoginUser = z.infer<typeof loginUserSchema>;
