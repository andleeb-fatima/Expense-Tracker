import dotenv from "dotenv";

dotenv.config();
import dns from "node:dns";

// Added to fix MongoDB Atlas SRV resolution failures in some network environments.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { authenticateUser } from "./middleware/authenticateUser.ts";
import { globalErrorHandler } from "./middleware/errorHandler.ts";
import { validateBody } from "./middleware/validateBody.ts";
import type { Express, Request, Response, NextFunction } from "express";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "./schemas/expenseSchema.ts";
import express from "express";
import { connectDB } from "./config/db.ts";
import { ExpenseModel, type ExpenseDocument } from "./models/Expense.model.ts";
import { expensesArr } from "./constant.ts";
import { calculateTotal, getTotalsByCategory } from "./utils/utilityfunc.ts";
import jwt from "jsonwebtoken";

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

// app.use(authenticateUser);
app.post(
  "/expenses",
  validateBody(createExpenseSchema),
  async (
    req: Request<{}, {}, CreateExpenseDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { amount, category, description } = req.body;
      if (!amount || !category) {
        return next({
          statusCode: 400,
          message: "Missing required fields",
        });
      }
      const newExpense: IExpense = await ExpenseModel.create({
        ...req.body,
        date: Date.now(),
        userId: req.userId,
      });
      return res.status(201).json(newExpense);
    } catch (error: unknown) {
      next(error);
      // if (error instanceof Error) {
      //   return res.status(500).json({ message: error.message });
      // }
    }
  },
);

app.patch(
  "/expenses/:id",
  validateBody(updateExpenseSchema),
  async (
    req: Request<{ id: string }, {}, UpdateExpenseDto>,
    res: Response,
    next: NextFunction,
  ) => {
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
        const error = {
          statusCode: 401,
          message: "UserId Required",
        };
        return next(error);
      }
      if (!updatedExpense) {
        const error = {
          statusCode: 404,
          message: "Expense document not found",
        };
        return next(error);
      }
      return res.status(200).json(updatedExpense);
    } catch (error: unknown) {
      next(error);
    }
  },
);

app.get(
  "/expenses/summary",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expensesSummary: ExpenseSummaryDto[] = await ExpenseModel.find({
        userId: req.userId,
      }).select("amount category");
      console.log("the userId", req.userId);
      if (!req.userId) {
        const error = {
          statusCode: 404,
          message: "UserId Required",
        };
        return next(error);
      }
      return res.status(200).json(expensesSummary);
    } catch (error: unknown) {
      next(error);
    }
  },
);

app.post("/api/login", (req, res) => {
  // 1. Authenticate user credentials here...
  const token = jwt.sign({ userId: req.userId }, "new", {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true, // 🔒 Blocks JavaScript access (Prevents XSS)
    secure: process.env.NODE_ENV === "production", // Send only over HTTPS
    sameSite: "strict", // 🔒 Mitigates CSRF attacks
    maxAge: 3600000, // Cookie expiry matching token lifespan (1 hour)
  });

  return res.status(200).json({ success: true, message: "cookies sent" });
});

app.get(
  "/expenses/totals-by-category",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next({
          statusCode: 404,
          message: "UserId Required",
        });
      }
      const expenses = await ExpenseModel.find({ userId: req.userId });

      const totalExpensesByCategory = getTotalsByCategory(expenses);
      return res.status(200).json(totalExpensesByCategory);
    } catch (error) {
      next(error);
    }
  },
);

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
app.use(globalErrorHandler);

console.log("Attempting to connect to MongoDB...");
await connectDB();
// Start the server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default app;
