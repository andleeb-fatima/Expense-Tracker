import { createContext, useContext, useState } from "react";

const TestContext = createContext({});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [filter, setFilter] = useState("new");
  const [notice, setNotice] = useState("Notice");

  return (
    <TestContext.Provider value={{ filter, notice, setFilter, setNotice }}>
      {children}
    </TestContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
