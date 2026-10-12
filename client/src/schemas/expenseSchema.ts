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
