import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated, user } = useAuth();

  // ✅ Clear localStorage if coming from logout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("logout") === "true") {
      console.log(
        "🚪 Logout detected - clearing site localStorage and auth state"
      );

      // Call the logout function to clear state
      logout();

      // Clean the URL
      window.history.replaceState({}, document.title, "/login");
    }
  }, [logout]);

  // Redirect if already authenticated
  useEffect(() => {
    // Add a small delay to ensure logout has completed
    const timeoutId = setTimeout(() => {
      const hasToken = localStorage.getItem("token");

      if (isAuthenticated && user && hasToken) {
        const userRole = user.role?.toLowerCase();
        console.log("🔄 Already authenticated as:", userRole);

        if (["admin", "vendor", "livreur"].includes(userRole)) {
          const token = localStorage.getItem("token");
          const userData = localStorage.getItem("user");
          const dashboardUrl = new URL("http://localhost:5174/dashboard");
          dashboardUrl.searchParams.set("token", token);
          dashboardUrl.searchParams.set("user", encodeURIComponent(userData));
          window.location.href = dashboardUrl.toString();
        } else if (userRole === "client") {
          navigate("/home", { replace: true });
        }
      }
    }, 100); // Small delay to let logout complete

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Veuillez remplir tous les champs");
      }

      if (!formData.email.includes("@")) {
        throw new Error("Veuillez entrer une adresse email valide");
      }

      console.log("Attempting login with:", { email: formData.email });

      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login result:", result);

      if (!result.success) {
        throw new Error(result.message || "Échec de la connexion");
      }

      const userRole = result.user?.role?.toLowerCase();

      if (!userRole) {
        throw new Error("Informations utilisateur incomplètes");
      }

      // ✅ FIX: Role-based redirection with token passing
      if (["admin", "vendor", "livreur"].includes(userRole)) {
        console.log("✅ Redirecting to dashboard app with token...");

        // Get token from localStorage (site)
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        // Pass token and user via URL parameters (will be removed by dashboard)
        const dashboardUrl = new URL("http://localhost:5174/dashboard");
        dashboardUrl.searchParams.set("token", token);
        dashboardUrl.searchParams.set("user", encodeURIComponent(user));

        console.log("🔗 Redirecting to:", dashboardUrl.toString());
        window.location.href = dashboardUrl.toString();
      } else if (userRole === "client") {
        // Client stays on site - use navigate() for same-app navigation
        const from = location.state?.from?.pathname || "/home";
        navigate(from, { replace: true });
      } else {
        throw new Error("Rôle utilisateur non reconnu");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleBusinessAccountClick = () => {
    navigate("/business-account");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30 shadow-xl">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Connexion</h2>
              <p className="text-white/90 text-lg">Accédez à votre compte</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 px-8 py-10 space-y-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Adresse email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full text-black px-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 hover:bg-gray-100/80 hover:shadow-lg"
                  placeholder="votre@email.com"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full text-black px-4 py-4 pr-12 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 hover:bg-gray-100/80 hover:shadow-lg"
                    placeholder="Votre mot de passe"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                  />
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                    Se souvenir de moi
                  </span>
                </label>
                <a
                  type="button"
                  className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Vous n'avez pas de compte ?{" "}
                <a
                  onClick={handleRegisterClick}
                  className="text-blue-600 cursor-pointer hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  Créer un compte
                </a>
              </p>
            </div>
            <div className="mt-4 text-center">
              <a
                onClick={handleBusinessAccountClick}
                className="text-blue-600 cursor-pointer hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
              >
                Créer un compte professionnel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
