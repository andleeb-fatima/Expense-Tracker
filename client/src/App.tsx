import { useState } from "react";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { Navigate, Route, Routes } from "react-router-dom";
import type { Expense } from "./types/types";
import { getLastItem } from "./utils/addExpense";
import Login from "./pages/Login";
import { SignupForm } from "./pages/Signup";
function App() {
  // const [expenses, setExpenses] = useState<Expense[]>(expensesArr);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function addExpense(expense: Expense): void {
    const newExpense = [...expenses, expense];
    setExpenses(newExpense);
    console.log("new expense", newExpense);
  }
  console.log(getLastItem(expenses));
  const newtoken = "new";
  localStorage.setItem("token", newtoken);
  const RequireAuth = ({}) => {
    const token = localStorage.getItem("token");
    if (token !== "jkl") {
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
        <Route path="/expense-form" element={<RequireAuth></RequireAuth>} />
        {/* <Route
          path="/expenses"
          element={
            <RequireAuth>
              <ExpenseList expenses={expenses} />
            </RequireAuth>
          }
        /> */}
      </Routes>
    </>
  );
}

export default App;
