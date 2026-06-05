import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/adminUtils";
import AdminLayout from "./AdminLayout";
const PrivateRoute = () => {
  const user = useAuth();

  if (!user.token) return <Navigate to="/login" />;
  return <AdminLayout />;
};

export default PrivateRoute;
