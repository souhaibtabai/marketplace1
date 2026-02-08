import React, { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    console.log("🚀 Dashboard AuthProvider initializing...");
    initializeAuth();
    const cleanup = setupStorageListener();
    return cleanup;
  }, []);

  const initializeAuth = () => {
    try {
      console.log("🔍 Dashboard - Checking for auth data...");

      // ✅ STEP 1: Check URL parameters FIRST (from site redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");
      const urlUser = urlParams.get("user");

      console.log("🔗 URL Parameters:", {
        hasToken: !!urlToken,
        hasUser: !!urlUser,
        url: window.location.href,
      });

      if (urlToken && urlUser) {
        console.log("✅ Found auth data in URL parameters!");

        try {
          const userData = JSON.parse(decodeURIComponent(urlUser));

          console.log("👤 Parsed user data:", {
            id: userData.id,
            email: userData.email,
            role: userData.role,
          });

          // Save to dashboard's localStorage
          localStorage.setItem("token", urlToken);
          localStorage.setItem("user", JSON.stringify(userData));

          console.log("💾 Saved auth to dashboard localStorage");

          // Update state
          setToken(urlToken);
          setUser(userData);

          // Clean URL (remove sensitive params for security)
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log("🧹 Cleaned URL parameters");

          setLoading(false);
          return; // Exit early - we're done!
        } catch (error) {
          console.error("❌ Error parsing URL auth data:", error);
        }
      } else {
        console.log("⚠️ No URL parameters found, checking localStorage...");
      }

      // STEP 2: Fallback to localStorage
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      console.log("📦 localStorage check:", {
        hasToken: !!storedToken,
        hasUser: !!storedUser,
      });

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("✅ Restoring auth from localStorage:", {
          userId: userData.id,
          email: userData.email,
          role: userData.role,
        });
        setToken(storedToken);
        setUser(userData);
      } else {
        console.log("⚠️ No auth data found in localStorage");
      }
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      console.log("✅ Dashboard auth initialization complete");
      setLoading(false);
    }
  };

  const setupStorageListener = () => {
    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      console.log("🔄 Storage change detected:", e.key);

      if (e.key === "token" || e.key === "user" || e.key === null) {
        const newToken = localStorage.getItem("token");
        const newUser = localStorage.getItem("user");

        if (newToken && newUser) {
          try {
            const userData = JSON.parse(newUser);
            console.log("✅ Syncing auth from storage change:", userData.email);
            setToken(newToken);
            setUser(userData);
          } catch (error) {
            console.error("❌ Error parsing user data:", error);
            setToken(null);
            setUser(null);
          }
        } else {
          console.log("🔄 Clearing auth state from storage change");
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-update", handleStorageChange);
    };
  };

  const logout = () => {
    console.log("🚪 Logging out user from dashboard");

    // Clear dashboard state
    setUser(null);
    setToken(null);

    // Clear dashboard localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    console.log("🧹 Cleared dashboard auth data");

    // Notify other tabs/windows
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "token",
        newValue: null,
      }),
    );

    window.dispatchEvent(new CustomEvent("auth-update"));

    console.log("🔄 Redirecting to login page with logout flag...");

    // ⚠️ UPDATE THIS URL to your production site URL when deploying
    const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";
    window.location.replace(`${SITE_URL}/login?logout=true`);
  };

  const value = {
    user,
    token,
    logout,
    isAuthenticated: !!token && !!user,
    loading,
  };

  // Debug current state
  useEffect(() => {
    console.log("🔐 Dashboard Auth State Update:", {
      isAuthenticated: !!token && !!user,
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role,
      loading,
    });
  }, [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
