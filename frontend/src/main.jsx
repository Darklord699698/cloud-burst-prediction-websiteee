// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react"; // ✅ Import ClerkProvider
import App from "./App";
import "./index.css";

// ✅ Replace with your actual Clerk frontend API key from Clerk dashboard
const clerkFrontendApi = "pk_test_YXB0LXRyZWVmcm9nLTc4LmNsZXJrLmFjY291bnRzLmRldiQ";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkFrontendApi}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
