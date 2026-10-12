import { useEffect, useState } from "react";
import { ExpenseForm } from "./components/ExpenseForm";
import { Navigate, Route, Routes } from "react-router-dom";
import type { Expense } from "./types/Expense";
import { getLastItem } from "./utils/addExpense";
import Login from "./pages/Login";
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
  useEffect(() => {
    getExpenses();
  }, []);

  function addExpense(expense: Expense): void {
    const newExpense = [...expenses, expense];
    setExpenses(newExpense);
    console.log("new expense", newExpense);
  }
  console.log(getLastItem(expenses));
  // const newtoken = "new";
  // localStorage.setItem("token", newtoken);
  const RequireAuth = ({}) => {
    // const token = localStorage.getItem("token");
    // if (token !== "jkl") {
    //   return <Navigate to="/login" />;
    // }
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
        <Route path="/expense-form" element={<RequireAuth></RequireAuth>} />
        <Route path="/expenseList" element={<ExpenseList />} />
        <Route
          path="/expenseForm"
          element={<ExpenseForm2 appendExpense={addExpense} />}
        />
        <Route
          path="/expenses"
          element={
            // <RequireAuth>
            <ExpenseList />
            // </RequireAuth>
          }
        />
      </Routes>
      <ExpenseForm2 appendExpense={addExpense} />
      <ExpenseList />
    </>
  );
}

export default App;
