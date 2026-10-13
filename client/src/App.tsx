import { useEffect, useState } from "react";
import { ExpenseForm } from "./components/ExpenseForm";
import { Navigate, Route, Routes } from "react-router-dom";
import type { Expense } from "./types/Expense";
import { getLastItem } from "./utils/addExpense";
import Login from "./pages/Login";
import apiclient from "./api/expenses";
import { SignupForm } from "./pages/Signup";
import axios from "axios";
import ExpenseList from "./components/ExpenseList";
import ExpenseForm2 from "./components/ExpenseForm2";
function App() {
  // const [expenses, setExpenses] = useState<Expense[]>(expensesArr);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function getExpenses() {
    try {
      const response = await axios.get("http://localhost:3000/expenses");
      setExpenses(response.data);
      console.log(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching data:", error.message);
      }
    }
  }
  async function refreshToken() {
    await apiclient.get("/refresh");
  }
  useEffect(() => {
    getExpenses();
    refreshToken();
  }, []);

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
    return (
      <>
        {" "}
        <ExpenseForm appendExpense={addExpense} />
      </>
    );
  };
  return (
    <>
      {/* <ExpenseForm appendExpense={addExpense} />
      <ExpenseList expenses={expenses} /> */}
      <Routes>
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
          path="/expenseForm"
          element={
            <RequireAuth>
              <ExpenseList />
            </RequireAuth>
          }
        />

        <Route
          path="/expenseList"
          element={
            <RequireAuth>
              <ExpenseForm appendExpense={addExpense} />
            </RequireAuth>
          }
        />
      </Routes>
      <ExpenseForm2 appendExpense={addExpense} />
      <ExpenseList />
    </>
  );
}

export default App;
