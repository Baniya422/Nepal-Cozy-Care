import React from "react";
import { Navigate } from "react-router-dom";

interface SellerProtectedRouteProps {
  children: React.ReactNode;
}

export default function SellerProtectedRoute({ children }: SellerProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow sellers and super admins to view seller dashboard
  if (user.role === "customer") {
    return <Navigate to="/become-a-seller" replace />;
  }

  if (user.role !== "seller" && user.role !== "super_admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
