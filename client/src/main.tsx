import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../src/components/TestReduxStore.tsx";
import App from "./App.tsx";
// import { AppProvider } from "./components/TestContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* <AppProvider> */}
      <Provider store={store}>
        <App />
      </Provider>
      {/* </AppProvider> */}
    </BrowserRouter>
  </StrictMode>,
);
