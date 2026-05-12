// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Global CSS (base first, then utilities, then component/app styles)

import "./assets/css/styles.css";        // legacy or vendor styles you keep



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

