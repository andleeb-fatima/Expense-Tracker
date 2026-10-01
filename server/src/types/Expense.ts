export interface IExpense {
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
  | "other";
