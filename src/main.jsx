import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { SensorProvider } from "./components/SensorContextProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SensorProvider>
      <App />
    </SensorProvider>
  </React.StrictMode>
);
