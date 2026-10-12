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

export const getExpensesSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    category: z
      .enum(["food", "transport", "utilities", "entertainment", "other"])
      .optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  })
  .refine((data) => {
    if (data.from && data.to) {
      return data.from <= data.to;
    }
    return true;
  });

export type PaginationQuery = z.infer<typeof getExpensesSchema>;

export type GetExpenseQuery = Omit<PaginationQuery, "limit" | "page">;
export type ExpenseFilter = Omit<
  PaginationQuery,
  "page" | "limit" | "from" | "to" | "sortBy" | "sortOrder"
> & {
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
};
