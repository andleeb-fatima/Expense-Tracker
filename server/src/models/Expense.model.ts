import { Document, Schema, model } from "mongoose";
import type { Category } from "../types/Expense.ts";
export interface ExpenseDocument extends Document {
  amount: number;
  category: Category;
  description?: string;
  date: Date;
  userId: string;
}

const expenseSchema = new Schema<ExpenseDocument>(
  {
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ["food", "transport", "utilities", "entertainment", "other"],
      required: true,
    },
    description: { type: String },
    date: { type: Date, default: Date.now },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

export const ExpenseModel = model<ExpenseDocument>("Expense", expenseSchema);
