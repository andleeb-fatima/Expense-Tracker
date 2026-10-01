import type { IExpense } from "./types/Expense.js";
export const expensesArr: IExpense[] = [
  {
    id: "1",
    amount: 2000,
    category: "food",
    description: "The expense for food",
    date: new Date(),
    userId: "01",
  },
  {
    id: "2",
    amount: 2000,
    category: "utilities",
    description: "The expense for food",
    date: new Date(),
    userId: "02",
  },
  {
    id: "3",
    amount: 2000,
    category: "food",
    description: "The expense for food",
    date: new Date(),
    userId: "03",
  },
];
