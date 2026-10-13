import apiClient from "../api/expenses";
import type { Expense, GetExpensesParams } from "../types/Expense";
import { useState, useEffect, useMemo } from "react";
const ExpenseList = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<GetExpensesParams>({
    category: "",
    to: "",
    from: "",
    sortBy: "",
    page: 1,
    limit: 10,
  });

  const categories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category));
    return Array.from(cats);
  }, [expenses]);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  async function getExpenses() {
    try {
      const params = {};
      for (const [key, value] of Object.entries(filters)) {
        if (value === "") continue;
        else params[key] = value;
      }
      const response = await apiClient.get("/expenses", {
        params: {
          category: filters.category,
          from: filters.to,
          to: filters.from,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: filters.page,
          limit: filters.limit,
        },
      });
      console.log(response);
      setExpenses(response.data);
      setTotalPages(Math.ceil(response.data.total / filters.limit));
      console.log(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching data:", error.message);
      }
    }
  }
  useEffect(() => {
    getExpenses();
  }, []);
  async function deleteExpense(id: string) {
    if (expenseToDelete) {
      await apiClient.delete(`/expenses/${id}`);
    }
    setExpenseToDelete(null);

    const updatedExpenses = expenses.filter((item) => item.id !== id);
    return updatedExpenses;
  }

  async function editExpense(id: string) {
    const updatedExpense = await apiClient.patch(`/expenses/${id}`);
    return updatedExpense;
  }
  const totalsByCategory = async () => {
    return await apiClient.get("/expenses/totals-by-category");
  };
  const grandTotal = async () => {
    const total = await apiClient.get("/expenses/total");
    return total.data;
  };

  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <>
      {" "}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value,
                page: 1,
              }))
            }
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                from: e.target.value,
                page: 1,
              }))
            }
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                to: e.target.value,
                page: 1,
              }))
            }
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value,
                page: 1,
              }))
            }
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {/* <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option> */}
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>
      <button onClick={() => getExpenses()}>Get Expenses</button>
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Filtered Totals Summary
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(totalsByCategory).length === 0 ? (
            <span className="text-xs text-gray-500">No categories found</span>
          ) : (
            Object.entries(totalsByCategory).map(([cat, total]) => (
              <span
                key={cat}
                className="bg-white border border-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full shadow-sm font-medium"
              >
                {cat}:{" "}
                <strong className="text-blue-950">${total.toFixed(2)}</strong>
              </span>
            ))
          )}
        </div>
        <div className="text-right border-t border-blue-200 pt-2 text-sm font-bold text-blue-950">
          Grand Total: ${grandTotal}
        </div>
      </div>
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed rounded-xl">
            No expenses found matching the selected filters.
          </div>
        ) : (
          expenses.map((expense) => {
            const { id, amount, category, description, date } = expense;
            return (
              <div
                key={id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition gap-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                      ${Number(amount).toFixed(2)}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-md font-medium">
                      {category}
                    </span>
                    {date && (
                      <span className="text-xs text-gray-400">
                        {date.toString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {description || (
                      <span className="italic text-gray-400">
                        No Description Provided
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => editExpense(expense.id)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setExpenseToDelete(expense)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
        <div>
          Page <span className="font-semibold">{filters.page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={filters.page <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={filters.page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this expense of{" "}
              <strong>${expenseToDelete.amount}</strong> for "
              <strong>{expenseToDelete.category}</strong>"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteExpense(expenseToDelete.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseList;
