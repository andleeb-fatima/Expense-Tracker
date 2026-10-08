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
export type PaginationResponse = {
  items: IExpense[];
  page: number;
  limit: number;
  total: number;
};
