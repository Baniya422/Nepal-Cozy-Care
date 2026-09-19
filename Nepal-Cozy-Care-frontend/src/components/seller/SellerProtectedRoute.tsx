import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface SellerProtectedRouteProps {
  children: React.ReactNode;
}

export default function SellerProtectedRoute({ children }: SellerProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let localUser: { id?: number; name?: string; email?: string; role?: string } | null = null;

  try {
    localUser = userStr ? JSON.parse(userStr) : null;
  } catch {
    localUser = null;
  }

  const isRoleAllowedLocally =
    localUser &&
    (localUser.role === "seller" ||
      localUser.role === "super_admin" ||
      localUser.role === "admin");

  const [authorized, setAuthorized] = useState<boolean | null>(
    !token ? false : isRoleAllowedLocally ? true : null
  );

  useEffect(() => {
    if (!token) {
      setAuthorized(false);
      return;
    }

    if (isRoleAllowedLocally) {
      setAuthorized(true);
      return;
    }

    let isMounted = true;
    const verifyRole = async () => {
      try {
        const res = await fetch(`${API}/api/seller/application-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const backendRole = json.data?.role;
          const hasApprovedShop = json.data?.shop?.status === "approved";

          if (
            backendRole === "seller" ||
            backendRole === "super_admin" ||
            backendRole === "admin" ||
            hasApprovedShop
          ) {
            try {
              const currentStored = JSON.parse(localStorage.getItem("user") || "{}");
              const updated = { ...currentStored, role: backendRole || "seller" };
              localStorage.setItem("user", JSON.stringify(updated));
              window.dispatchEvent(new Event("storage"));
            } catch {
              // ignore
            }
            if (isMounted) setAuthorized(true);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to verify seller permissions", err);
      }
      if (isMounted) setAuthorized(false);
    };

    verifyRole();

    return () => {
      isMounted = false;
    };
  }, [token, isRoleAllowedLocally]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (authorized === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: "#64748b",
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "32px",
            height: "32px",
            border: "3px solid #cbd5e1",
            borderTopColor: "#059669",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/become-a-seller" replace />;
  }

  return <>{children}</>;
}
