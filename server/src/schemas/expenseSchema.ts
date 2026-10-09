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
    description: z.string().trim(),
  })
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Request body cannot be empty",
  });
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

export const getExpensesSchema = z.object({
  page: z
    .string()
    .default("1")
    .transform((val: string) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .default("5")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
  category: z.enum([
    "food",
    "transport",
    "utilities",
    "entertainment",
    "other",
  ]),
  from: z.date().optional(),
  to: z.date().optional(),
  sortBy: z.enum(["date", "amount"]).default("date").optional,
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional,
});

export type PaginationQuery = z.infer<typeof getExpensesSchema>;
