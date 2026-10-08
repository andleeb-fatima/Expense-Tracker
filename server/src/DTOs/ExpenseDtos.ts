import type { IExpense } from "../types/Expense.ts";

// export interface CreateExpenseDto {
//   amount: number;
//   category: Category;
//   description?: string;
// }
export type CreateExpenseDto = Omit<IExpense, "id" | "userId" | "date">;

export type UpdateExpenseDto = Partial<Omit<IExpense, "id" | "userId">>;

export type ExpenseSummaryDto = Pick<IExpense, "id" | "category" | "amount">;
