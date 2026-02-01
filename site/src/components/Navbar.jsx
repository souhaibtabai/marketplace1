import React, { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate("/home");
    } else {
      navigate("/login");
    }
  };
  useEffect(() => {
    console.log("Auth state changed:", {
      isAuthenticated,
      user,
      token: localStorage.getItem("token"),
    });
  }, [isAuthenticated, user]);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-2xl border-b border-blue-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link
              to="/home"
              className="text-2xl cursor-pointer font-bold bg-orange-400 bg-clip-text text-transparent"
            >
              MarketPlace
            </Link>

            {/* Location (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1 text-white/80 hover:text-white cursor-pointer group">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Page Navigation */}
            <Link
              to="/home"
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive
                    ? "text-orange-400 cursor-pointer border-b-2 border-orange-400"
                    : "text-white/80 cursor-pointer hover:text-orange-400"
                }`
              }
            >
              Accueil
            </Link>
            <Link
              to="/products"
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive
                    ? "text-orange-400 cursor-pointer border-b-2 border-orange-400"
                    : "text-white/80 cursor-pointer hover:text-orange-400"
                }`
              }
            >
              Produits
            </Link>
            <Link
              to="/shops"
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive
                    ? "text-orange-400 cursor-pointer border-b-2 border-orange-400"
                    : "text-white/80 cursor-pointer hover:text-orange-400"
                }`
              }
            >
              Shops
            </Link>

            {/* Account - Shows username when logged in */}
            <div className="flex items-center space-x-2 group relative">
              <a
                onMouseEnter={() => setIsDropdownOpen(!isDropdownOpen)}
                className=" cursor-pointer"
                aria-label="Account"
              >
                <User className="w-5 h-5 text-orange-400" />
              </a>
              {isDropdownOpen && (
                <div className="absolute top-8 right-0 bg-slate-900 border border-blue-800 rounded shadow-lg z-50 min-w-[140px]">
                  {isAuthenticated ? (
                    <div className="flex flex-col px-4 py-2">
                      <span className="text-white font-medium mb-2">
                        {user?.username || "Mon compte"}
                      </span>
                      <a
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                          navigate("/home");
                        }}
                        className="text-xs text-white/70 cursor-pointer hover:text-white text-left"
                      >
                        Déconnexion
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                      className="text-white/80 hover:text-white cursor-pointer transition-colors text-sm px-4 py-2 w-full text-left"
                    >
                      Connexion
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Orders */}
            {isAuthenticated && (
              <Link
                to="/orders"
                className={({ isActive }) =>
                  `flex flex-col no-underline cursor-pointer items-start text-white/80 hover:text-white group transition-colors ${
                    isActive ? "text-orange-400" : ""
                  }`
                }
              >
                <span className="font-semibold no-underline cursor-pointer text-sm group-hover:underline">
                  Commandes
                </span>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className={({ isActive }) =>
                `flex flex-col no-underline cursor-pointer items-start text-white/80 hover:text-white group transition-colors ${
                  isActive ? "text-orange-400" : ""
                }`
              }
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="ml-1 font-semibold text-sm group-hover:underline">
                Panier
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative cursor-pointer text-white/80 hover:text-white"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/home"
                className={({ isActive }) =>
                  `flex items-center space-x-3 w-full px-3 py-2 transition-colors ${
                    isActive
                      ? "text-orange-400"
                      : "text-white hover:text-orange-400"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Accueil</span>
              </Link>
              <Link
                to="/products"
                className={({ isActive }) =>
                  `flex items-center space-x-3 w-full px-3 py-2 transition-colors ${
                    isActive
                      ? "text-orange-400"
                      : "text-white hover:text-orange-400"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Produits</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to="/orders"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 w-full px-3 py-2 transition-colors ${
                      isActive
                        ? "text-orange-400"
                        : "text-white hover:text-orange-400"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Commandes</span>
                </Link>
              )}

              {/* Mobile Account */}
              <div className="flex items-center space-x-3 w-full px-3 py-2">
                <User size={20} className="text-orange-400" />
                {isAuthenticated ? (
                  <div className="flex flex-col">
                    <span className="text-white">
                      {user?.username || "Mon compte"}
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/home");
                        setIsMenuOpen(false);
                      }}
                      className="text-xs text-white/70 hover:text-white text-left"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-orange-400 transition-colors"
                  >
                    Connexion
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
