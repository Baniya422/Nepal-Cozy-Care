import { Navigate } from "react-router-dom";
interface AdminProtectedRouteProps {
  children: React.ReactNode;
}
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
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
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
