import React, { useEffect } from "react";
import { useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log("🔐 PrivateRoute Check (Dashboard):", {
      loading,
      isAuthenticated,
      user,
      userRole: user?.role,
      allowedRoles,
      tokenInStorage: !!localStorage.getItem("token"),
      userInStorage: !!localStorage.getItem("user"),
    });
  }, [loading, isAuthenticated, user, allowedRoles]);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("⏳ PrivateRoute: Still loading auth state...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to site login
  if (!isAuthenticated) {
    console.log(
      "❌ PrivateRoute: Not authenticated - redirecting to login with logout flag"
    );
    console.log("📦 localStorage token:", localStorage.getItem("token"));
    console.log("📦 localStorage user:", localStorage.getItem("user"));

    // Add logout=true to ensure site clears its localStorage
    window.location.href =
      (import.meta.env.VITE_SITE_URL || "http://localhost:5173") +
      "/login?logout=true";
    return null;
  }

  // Check user role
  if (user) {
    const userRole = user.role?.toLowerCase();

    console.log("✅ PrivateRoute: User authenticated", {
      userRole,
      allowedRoles,
      isAllowed: allowedRoles.length === 0 || allowedRoles.includes(userRole),
    });

    // If client somehow got here, redirect to site home
    if (userRole === "client") {
      console.log(
        "⚠️ PrivateRoute: Client trying to access dashboard - redirecting to home"
      );
      window.location.href =
        (import.meta.env.VITE_SITE_URL || "http://localhost:5173") + "/home";
      return null;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log(
        "⚠️ PrivateRoute: User role not in allowed roles - redirecting to login"
      );
      window.location.href =
        (import.meta.env.VITE_SITE_URL || "http://localhost:5173") + "/login";
      return null;
    }
  }

  // All checks passed - render the protected component
  console.log("🎉 PrivateRoute: All checks passed - rendering dashboard");
  return children;
};

export default PrivateRoute;
