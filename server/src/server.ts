import dotenv from "dotenv";

dotenv.config();
import dns from "node:dns";

// Added to fix MongoDB Atlas SRV resolution failures in some network environments.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { authenticateUser } from "./middleware/authenticateUser.ts";
import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { connectDB } from "./config/db.ts";
import { ExpenseModel, type ExpenseDocument } from "./models/Expense.model.ts";
import { expensesArr } from "./constant.ts";
import { calculateTotal, getTotalsByCategory } from "./utils/utilityfunc.ts";

import type {
  CreateExpenseDto,
  ExpenseSummaryDto,
  UpdateExpenseDto,
} from "./DTOs/index.ts";
import type { IExpense } from "./types/index.ts";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authenticateUser);
app.post(
  "/expenses",
  async (req: Request<{}, {}, CreateExpenseDto>, res: Response) => {
    try {
      const { amount, category, description } = req.body;
      if (!amount || !category || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const newExpense: IExpense = await ExpenseModel.create({
        ...req.body,
        date: Date.now(),
        userId: req.userId,
      });
      return res.status(201).json(newExpense);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
    }
  },
);

app.patch(
  "/expenses/:id",
  async (req: Request<{ id: string }, {}, UpdateExpenseDto>, res: Response) => {
    try {
      const { id } = req.params;
      const updatedExpense = await ExpenseModel.findOneAndUpdate(
        { _id: id, userId: req.userId },
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        },
      );
      if (!req.userId) {
        return res.status(401).json({ message: "UserId required" });
      }
      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      return res.status(200).json(updatedExpense);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return res.status(500).json({ message });
    }
  },
);

app.get("/expenses/summary", async (req: Request, res: Response) => {
  try {
    const expensesSummary: ExpenseSummaryDto[] = await ExpenseModel.find({
      userId: req.userId,
    }).select("amount category");
    console.log("the userId", req.userId);
    if (!req.userId) {
      return res.status(404).json({ message: "UserId required" });
    }
    return res.status(200).json(expensesSummary);
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/expenses/totals-by-category", async (req: Request, res: Response) => {
  try {
    const expenses = await ExpenseModel.find({ userId: req.userId });
    const totalExpensesByCategory = getTotalsByCategory(expenses);
    return res.status(200).json(totalExpensesByCategory);
  } catch (error) {
    console.error("Error calculating expenses by category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get(
  "/expenses/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;

      const userExpense = await ExpenseModel.findOne({
        _id: id,
        userId: req.userId,
      });

      if (!userExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      return res.status(200).json(userExpense);
    } catch (error) {
      console.error(`Error fetching expense with id ${req.params.id}:`, error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

app.get("/expenses/total", async (req: Request, res: Response) => {
  try {
    const total: number = calculateTotal(expensesArr);
    return res.status(200).json({ total });
  } catch (error) {
    console.error("Error calculating total expenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 404 Handler (Unmatched Routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

console.log("Attempting to connect to MongoDB...");
await connectDB();
// Start the server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default app;
