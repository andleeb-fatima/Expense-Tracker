import { useEffect, useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import { Navigate, Route, Routes } from "react-router-dom";
import type { Expense } from "./types/Expense";
import { getLastItem } from "./utils/addExpense";
import Login from "./pages/Login";
import apiclient from "./api/expenses";
import { SignupForm } from "./pages/Signup";
import axios from "axios";
import ExpenseList from "./components/ExpenseList";
import NoticeBanner from "./components/NoticeBanner";
import FilterBar from "./components/FilterBar";

function App() {
  // const [expenses, setExpenses] = useState<Expense[]>(expensesArr);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function refreshToken() {
    await apiclient.get("/refresh");
  }

  function addExpense(expense: Expense): void {
    const newExpense = [...expenses, expense];
    setExpenses(newExpense);
    console.log("new expense", newExpense);
  }
  // console.log(getLastItem(expenses));
  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };
  return (
    <>
      {/* <ExpenseForm appendExpense={addExpense} />
      <ExpenseList expenses={expenses} /> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route
          path="/expenseForm"
          element={
            <RequireAuth>
              <ExpenseForm appendExpense={addExpense} />
            </RequireAuth>
          }
        />

        <Route
          path="/expenseList"
          element={
            <RequireAuth>
              <ExpenseList />
            </RequireAuth>
          }
        />
      </Routes>
      <NoticeBanner />
      <FilterBar />
    </>
  );
}

export default App;
