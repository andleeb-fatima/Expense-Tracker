import dotenv from "dotenv";

dotenv.config();
import dns, { type RecordWithTtl } from "node:dns";

// Added to fix MongoDB Atlas SRV resolution failures in some network environments.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { authenticateUser } from "./middleware/authenticateUser.ts";
import { validateQuery } from "./middleware/validateQuery.ts";
import { globalErrorHandler } from "./middleware/errorHandler.ts";
import { validateBody } from "./middleware/validateBody.ts";
import type { Express, Request, Response, NextFunction } from "express";
import {
  createExpenseSchema,
  getExpensesSchema,
  updateExpenseSchema,
} from "./schemas/expenseSchema.ts";
import type { CreateUser, LoginUser } from "./schemas/userSchema.ts";
import express from "express";
import { connectDB } from "./config/db.ts";
import { ExpenseModel, type ExpenseDocument } from "./models/Expense.model.ts";
import { expensesArr } from "./constant.ts";
import { calculateTotal, getTotalsByCategory } from "./utils/utilityfunc.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type {
  GetExpenseQuery,
  PaginationQuery,
  ExpenseFilter,
} from "./schemas/expenseSchema.ts";
import type {
  CreateExpenseDto,
  ExpenseSummaryDto,
  UpdateExpenseDto,
} from "./DTOs/index.ts";
import type { IExpense, PaginationResponse } from "./types/index.ts";
import { createUserSchema, loginUserSchema } from "./schemas/userSchema.ts";
import type { IUser } from "./types/User.ts";
import { UserModel } from "./models/User.model.ts";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Express = express();
const PORT = process.env.PORT || 3000;

console.log(process.env.JWT_ACCESS_SECRET);

// Middleware for parsing JSON and URL-encoded bodies
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Enable this if you are sending cookies or authorization headers
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.post(
  "/signup",
  validateBody(createUserSchema),
  async (
    req: Request<{}, {}, CreateUser>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { password, name, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      if (!name || !email || !password) {
        return next({ statusCode: 400, message: "All fields are required." });
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return next({
          statusCode: 409,
          message: "Email is already registered.",
        });
      }

      const user: IUser = await UserModel.create({
        name,
        password: hashedPassword,
        email,
      });
      // return res.status(201).json({ user });
      return res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email },
        message: "Account created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/login",
  validateBody(loginUserSchema),
  async (
    req: Request<{}, {}, LoginUser>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { password, email } = req.body;
      if (!email || !password) {
        return next({ statusCode: 400, message: "All fields are required." });
      }

      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) {
        return next({ statusCode: 401, message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next({ statusCode: 401, message: "Invalid email or password" });
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_ACCESS_SECRET!,
        {
          expiresIn: "1h",
        },
      );
      console.log("accessToken", accessToken);
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!refreshSecret) {
        throw new Error(
          "JWT_REFRESH_SECRET is not defined in environment variables",
        );
      }

      const refreshToken = jwt.sign({ userId: user._id }, refreshSecret, {
        expiresIn: "3d",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });

      res.status(200).json({
        message: "Logged in successfully",
        user: { id: user._id, name: user.name, email: user.email, accessToken },
      });
    } catch (error) {
      next(error);
    }
  },
);
app.post("/refresh", (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    next({ statusCode: 401, message: "Token Required" });
  }
  console.log("refreshToken", refreshToken);
  const verifiedToken = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET!,
  );
  if (!verifiedToken) {
    next({ statusCode: 401, message: "Expired or Invalid token" });
  }
  const newAccessToken = jwt.sign(
    { userId: req.userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" },
  );

  res.json({ accessToken: newAccessToken });
});

app.use(authenticateUser);

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
app.delete(
  "/expenses/:id",
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return next({ statusCode: 404, message: "Expense not found" });
      }

      const deletedExpense = await ExpenseModel.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });

      if (!deletedExpense) {
        return next({ statusCode: 404, message: "Expense not found" });
      }

      return res.status(204).send();
    } catch (error: unknown) {
      next(error);
    }
  },
);
app.get(
  "/expenses",
  validateQuery(getExpensesSchema),
  async (
    req: Request,
    res: Response<PaginationResponse>,
    next: NextFunction,
  ) => {
    try {
      const { category, from, to, sortBy, sortOrder }: GetExpenseQuery =
        req.query;
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;

      const userId = req.userId;
      const filter: Record<string, any> = { userId };
      console.log(filter, "filter");
      if (category) {
        filter.category = category;
      }
      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (to) filter.date.$lte = to;
      }

      const expenses = await ExpenseModel.find(filter)
        .sort({ [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await ExpenseModel.countDocuments(filter);

      return res.status(200).json({ page, limit, total, items: expenses });
    } catch (error) {
      next(error);
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

      if (!expensesSummary || expensesSummary.length === 0) {
        return next({
          statusCode: 404,
          message: "No expenses found for the user",
        });
      }
      return res.status(200).json(expensesSummary);
    } catch (error: unknown) {
      next(error);
    }
  },
);

app.get(
  "/expenses/totals-by-category",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const userExpense = await ExpenseModel.findOne({
        _id: id,
        userId: req.userId,
      });

      if (!userExpense) {
        return next({ statusCode: 404, message: "Expense Not Found" });
      }

      return res.status(200).json(userExpense);
    } catch (error) {
      console.error(`Error fetching expense with id ${req.params.id}:`, error);
      return next(error);
    }
  },
);

app.get(
  "/expenses/total",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expenses = await ExpenseModel.find({ userId: req.userId });
      const total: number = calculateTotal(expenses);
      return res.status(200).json({ total });
    } catch (error) {
      console.error("Error calculating total expenses:", error);
      return next(error);
    }
  },
);

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
