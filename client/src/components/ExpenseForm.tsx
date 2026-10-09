import { useState } from "react";
import type { Category, Expense } from "../types/Expense";

export function ExpenseForm({
  appendExpense,
}: {
  appendExpense: (expense: Expense) => void;
}) {
  const [expense, setExpense] = useState<
    Partial<Omit<Expense, "userId" | "date" | "id">>
  >({
    amount: 0,
    description: "",
    category: "others",
    // userId: "05",
    // date: new Date(),
    // id: "2",
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
    { id: 4, c: "others" },
  ];
  return (
    <>
      <form
        className="flex gap-2 "
        onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => {
          e.preventDefault();
          appendExpense(expense);
        }}
      >
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={expense.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setExpense({ ...expense, amount: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label htmlFor="category">Choose a Category:</label>
          <select
            name="category"
            id="category"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setExpense({ ...expense, category: e.target.value as Category })
            }
          >
            {categories.map(({ id, c }) => {
              return (
                <option value={c} key={id}>
                  {c}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor="description">Description:</label>
          <input
            id="description"
            name="description"
            placeholder="Enter description..."
            value={expense.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setExpense({ ...expense, description: e.target.value })
            }
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </>
  );
}
