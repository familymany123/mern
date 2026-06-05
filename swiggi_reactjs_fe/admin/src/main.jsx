import "fontawesome-free/css/all.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "/node_modules/admin-lte/dist/css/adminlte.min.css";

import App from "./App.jsx";
import "./global.css";

import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </React.StrictMode>
);
