import { useState, useMemo } from "react";
import type { Expense, ExpenseListProps } from "../types/Expense";
export function ExpenseList({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  pageSize = 5,
}: ExpenseListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category));
    return Array.from(cats);
  }, [expenses]);

  // --- Filter and Sort Logic ---
  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        // Category Filter
        if (
          selectedCategory !== "ALL" &&
          expense.category !== selectedCategory
        ) {
          return false;
        }

        // Date Range Filter (assumes expense object has a `date` field in YYYY-MM-DD or ISODate format)
        if (expense.date) {
          const expDate = new Date(expense.date).getTime();
          if (startDate && expDate < new Date(startDate).getTime())
            return false;
          if (endDate && expDate > new Date(endDate).valueOf() + 86400000)
            return false; // include full end day
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "amount-desc") return b.amount - a.amount;
        if (sortBy === "amount-asc") return a.amount - b.amount;

        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (sortBy === "date-asc") return dateA - dateB;
        return dateB - dateA; // default: date-desc
      });
  }, [expenses, selectedCategory, startDate, endDate, sortBy]);

  // --- Category Totals Calculation ---
  const totalsByCategory = useMemo(() => {
    return filteredAndSortedExpenses.reduce<Record<string, number>>(
      (acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount || 0);
        return acc;
      },
      {},
    );
  }, [filteredAndSortedExpenses]);

  const grandTotal = useMemo(() => {
    return Object.values(totalsByCategory).reduce((sum, val) => sum + val, 0);
  }, [totalsByCategory]);

  // --- Pagination Calculation ---
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedExpenses.length / pageSize),
  );

  // Ensure current page doesn't exceed total pages after filtering
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedExpenses.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedExpenses, safeCurrentPage, pageSize]);

  // Handlers for Delete Confirmation
  const confirmDelete = () => {
    if (expenseToDelete && onDeleteExpense) {
      onDeleteExpense(expenseToDelete.id);
    }
    setExpenseToDelete(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* 3. Header & Add Expense Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
          <p className="text-sm text-gray-500">
            Manage and track your daily spending
          </p>
        </div>
        <button
          onClick={onAddExpense}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition flex items-center justify-center gap-2"
        >
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
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
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
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
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* 5. Totals by Category Summary Display */}
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
          Grand Total: ${grandTotal.toFixed(2)}
        </div>
      </div>

      {/* Expense List Items */}
      <div className="space-y-3">
        {paginatedExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed rounded-xl">
            No expenses found matching the selected filters.
          </div>
        ) : (
          paginatedExpenses.map((expense) => {
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
                      <span className="text-xs text-gray-400">({date})</span>
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

                {/* 3 & 4. Inline Edit & Delete Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onEditExpense?.(expense)}
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

      {/* 1. Pagination Controls */}
      <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
        <div>
          Page <span className="font-semibold">{safeCurrentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={safeCurrentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* 4. Delete Confirmation Modal */}
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
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
