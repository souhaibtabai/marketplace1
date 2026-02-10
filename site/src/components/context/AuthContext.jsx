import React, { useState, useEffect, createContext, useContext } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log("🚀 [AuthContext] AuthProvider component initializing");
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
    setupStorageListener();
  }, []);

  const initializeAuth = () => {
    console.log("🔧 [AuthContext] initializeAuth called");
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      console.log("🔍 [AuthContext] storedToken exists:", !!storedToken);
      console.log("🔍 [AuthContext] storedUser exists:", !!storedUser);

      if (storedToken && storedUser) {
        console.log("✅ [AuthContext] Found stored credentials, parsing user data");
        const userData = JSON.parse(storedUser);
        console.log("👤 [AuthContext] Parsed user data:", userData);
        setToken(storedToken);
        setUser(userData);
        console.log("✅ [AuthContext] Auth state initialized with stored credentials");
      } else {
        console.log("ℹ️ [AuthContext] No stored credentials found");
      }
    } catch (error) {
      console.error("❌ [AuthContext] Error initializing auth:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("🧹 [AuthContext] Cleared corrupted localStorage data");
    } finally {
      setLoading(false);
      console.log("✅ [AuthContext] Auth initialization complete, loading set to false");
    }
  };

  const setupStorageListener = () => {
    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user" || e.key === null) {
        const newToken = localStorage.getItem("token");
        const newUser = localStorage.getItem("user");

        if (newToken && newUser) {
          try {
            const userData = JSON.parse(newUser);
            setToken(newToken);
            setUser(userData);
          } catch (error) {
            console.error("Error parsing user data:", error);
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for same-tab updates
    window.addEventListener("auth-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-update", handleStorageChange);
    };
  };

  const login = async (credentials) => {
    try {
      console.log("🔐 Login attempt with:", {
        email: credentials.email,
        passwordLength: credentials.password?.length,
        hasPassword: !!credentials.password,
      });

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log("📡 Login response status:", response.status);
      console.log(
        "📡 Login response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON. Content-Type:", contentType);
        return { success: false, message: "Erreur de connexion au serveur" };
      }

      const data = await response.json();
      console.log("📄 Login response data:", data);

      if (!response.ok) {
        // Enhanced error logging
        console.error("❌ Login failed:");
        console.error("- Status:", response.status);
        console.error("- Status Text:", response.statusText);
        console.error("- Error Data:", data);

        // Check for specific error types
        if (response.status === 401) {
          console.error("🚨 401 Unauthorized - Possible issues:");
          console.error("  • Wrong email/password combination");
          console.error("  • User doesn't exist in database");
          console.error("  • Password hashing mismatch");
          console.error("  • Backend authentication logic error");
        }

        return {
          success: false,
          message: data.message || data.error || "Erreur de connexion",
          status: response.status,
        };
      }

      if (data.token && data.user) {
        console.log("✅ Login successful!");
        console.log("👤 User data:", data.user);
        console.log("🎟️ Token length:", data.token.length);

        // Store in localStorage for shared session
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update state
        setToken(data.token);
        setUser(data.user);

        // Notify other tabs/windows
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "token",
            newValue: data.token,
          })
        );

        return { success: true, user: data.user };
      }

      console.error("❌ Login failed - missing token or user data");
      return { success: false, message: "Réponse inattendue du serveur" };
    } catch (error) {
      console.error("💥 Network/Parse error during login:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return { success: false, message: "Erreur réseau ou de connexion" };
    }
  };

  const register = async (userData) => {
    try {
      console.log("📝 Registration attempt");

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("📄 Registration response:", data);

      if (response.ok && data.success) {
        // Store in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update state
        setToken(data.token);
        setUser(data.user);

        // Notify other tabs/windows
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "token",
            newValue: data.token,
          })
        );

        return { success: true, user: data.user };
      }

      return {
        success: false,
        message: data.message || "Erreur d'inscription",
      };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Erreur réseau" };
    }
  };

  const logout = () => {
    console.log("🚪 [AuthContext] logout function called");
    console.log("🔍 [AuthContext] Current user:", user);
    console.log("🔍 [AuthContext] Current token:", token);
    console.log("🔍 [AuthContext] localStorage token before clear:", localStorage.getItem("token"));
    console.log("🔍 [AuthContext] localStorage user before clear:", localStorage.getItem("user"));
    
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    console.log("✅ [AuthContext] State cleared - user and token set to null");
    console.log("✅ [AuthContext] localStorage cleared");
    console.log("🔍 [AuthContext] localStorage token after clear:", localStorage.getItem("token"));
    console.log("🔍 [AuthContext] localStorage user after clear:", localStorage.getItem("user"));

    // Notify other tabs/windows
    console.log("📡 [AuthContext] Dispatching storage event for cross-tab sync");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "token",
        newValue: null,
      })
    );

    // Dispatch custom event for same-tab updates
    console.log("📡 [AuthContext] Dispatching auth-update event");
    window.dispatchEvent(new CustomEvent("auth-update"));
    console.log("✅ [AuthContext] Logout completed");
  };

  // Debug function to test backend connectivity
  const testBackendConnection = async () => {
    try {
      console.log("🔍 Testing backend connection...");
      const response = await fetch(`${API_BASE_URL}/api/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend connection OK:", data);
      } else {
        console.error("❌ Backend connection failed:", response.status);
      }
    } catch (error) {
      console.error("💥 Backend connection error:", error);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    testBackendConnection, // Add this for debugging
    isAuthenticated: !!token && !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
