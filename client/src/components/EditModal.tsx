import { useForm, type SubmitHandler } from "react-hook-form";
import type { CreateExpense } from "../schemas/expenseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseSchema } from "../schemas/expenseSchema";
import apiClient from "../api/expenses";
import type { Expense } from "../types/Expense";
import { useEffect } from "react";

export default function ExpenseForm({
  appendExpense,
  expense,
}: {
  expense: Expense;
  appendExpense: (expense: Expense) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<CreateExpense>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: expense,
  });
  interface CategoryArr {
    id: number;
    c: string;
  }
  const categories: CategoryArr[] = [
    { id: 0, c: "food" },
    { id: 1, c: "utilities" },
    { id: 2, c: "transport" },
    { id: 3, c: "entertainment" },
    { id: 4, c: "other" },
  ];

  const onSubmit: SubmitHandler<CreateExpense> = async (data) => {
    try {
      const response = await apiClient.post("/expenses", data);
      appendExpense(response.data);

      return response.data;
    } catch (error) {
      console.error("Failed to create expense:", error);
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        defaultValue="100"
        {...(register("amount"), { required: true, valueAsNumber: true })}
        aria-invalid={errors.amount ? "true" : "false"}
        aria-describedby={errors.amount ? "amount-error" : undefined}
      />
      {errors.amount && <span>This field is required</span>}

      <select
        {...(register("category"), { required: true })}
        aria-invalid={errors.category ? "true" : "false"}
        aria-describedby={errors.category ? "category-error" : undefined}
      >
        {categories.map(({ id, c }) => {
          return (
            <option value={c} key={id}>
              {c}
            </option>
          );
        })}
      </select>
      {errors.category && <span>This field is required</span>}

      <input {...register("description")} />

      <button type="submit" disabled={isSubmitting}>
        Update Expense
      </button>
    </form>
  );
}
