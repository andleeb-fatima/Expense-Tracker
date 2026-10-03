import { z } from "zod";

export const createExpenseSchema = z.object({
  description: z.string().optional(),
  amount: z.number().positive(),
  category: z.enum([
    "food",
    "transport",
    "utilities",
    "entertainment",
    "other",
  ]),
});

export type CreateExpense = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0"),
    category: z.enum([
      "food",
      "transport",
      "utilities",
      "entertainment",
      "other",
    ]),
    description: z.string().trim().optional(),
  })
  .partial();
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;
