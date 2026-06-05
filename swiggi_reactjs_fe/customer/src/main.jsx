import React from "react";
import ReactDOM from "react-dom/client";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.js";

// import '../node_modules/hc-offcanvas-nav/dist/hc-offcanvas-nav.js'

import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./demo.css";
import "./index.css";
import { store } from "./store/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </React.StrictMode>
);
