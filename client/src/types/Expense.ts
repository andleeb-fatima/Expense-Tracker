export interface Expense {
  readonly id: string;
  amount: number;
  category: Category;
  description?: string;
  date: Date;
  userId: string;
}

export type Category =
  | "food"
  | "utilities"
  | "transport"
  | "entertainment"
  | "others";

export interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string | number) => void;
  pageSize?: number;
}
