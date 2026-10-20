import type { Expense } from "./types/Expense";
export let expensesArr: Expense[] = [
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
    description: "",
    date: new Date(),
    userId: "02",
  },
  {
    id: "3",
    amount: 2000,
    category: "others",
    description: "The expense for food",
    date: new Date(),
    userId: "03",
  },
];
