import type { IExpense, Category } from "../types/index.ts";
export function calculateTotal(expenses: IExpense[]): number {
  let sum = 0;
  for (const expense of expenses) {
    sum += expense.amount;
  }
  return sum;
}

export function getTotalsByCategory(
  expenses: IExpense[],
): Record<Category, number> {
  return expenses.reduce(
    (acc, expense) => {
      const { category, amount } = expense;

      acc[category] = (acc[category] ?? 0) + amount;
      console.log("acc, amount", acc, amount);
      return acc;
    },
    {} as Record<Category, number>,
  );
}
