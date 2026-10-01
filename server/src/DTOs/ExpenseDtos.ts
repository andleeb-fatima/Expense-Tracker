import type { Expense } from "../types/Expense.ts";

// export interface CreateExpenseDto {
//   amount: number;
//   category: Category;
//   description?: string;
// }
export type CreateExpenseDto = Omit<Expense, "id" | "userId" | "date">;

export type UpdateExpenseDto = Partial<Omit<Expense, "id" | "userId">>;

export type ExpenseSummaryDto = Pick<Expense, "id" | "category" | "amount">;
