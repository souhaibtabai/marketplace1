import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import "../App.css";

import ProfilPage from "./ProfilPage";
import ProduitPage from "./ProduitPage";
import OrderPage from "./OrderPage";
import CategoriePage from "./CategoriePage";
import LogoutPage from "./LogoutPage";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("profil");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user: currentUser } = useAuth();

  const handleMenuClick = (menuKey) => {
    if (menuKey === "logout") {
      setShowLogoutModal(true);
    } else {
      setCurrentPage(menuKey);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const renderContent = () => {
    switch (currentPage) {
      case "profil":
        return <ProfilPage />;
      case "produit":
        return <ProduitPage />;
      case "order":
        return <OrderPage />;
      case "categorie":
        return <CategoriePage />;
      default:
        return <ProfilPage />;
    }
  };

  const menu = [
    {
      key: "profil",
      label: "Profile",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
    },
    {
      key: "produit",
      label: "Products",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      key: "order",
      label: "Orders",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      key: "categorie",
      label: "Categories",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      key: "logout",
      label: "Logout",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      <div className="flex h-full">
        {/* Enhanced Sidebar */}
        <div
          className={`bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-72" : "w-20"
          } shadow-2xl relative`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div
              className={`flex items-center gap-3 ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl text-white font-bold">Dashboard</h1>
                  {currentUser && (
                    <p className="text-white/60 text-xs uppercase tracking-wider">
                      {currentUser.role}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4">
            <ul className="space-y-2">
              {menu.map((m) => (
                <li key={m.key}>
                  <button
                    onClick={() => handleMenuClick(m.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      currentPage === m.key && m.key !== "logout"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    } ${!sidebarOpen && "justify-center"}`}
                    aria-label={m.label}
                  >
                    <span
                      className={
                        currentPage === m.key && m.key !== "logout"
                          ? ""
                          : "group-hover:scale-110 transition-transform duration-200"
                      }
                    >
                      {m.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="font-medium">{m.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info at Bottom */}
          {sidebarOpen && currentUser && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {currentUser.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {currentUser.username}
                  </p>
                  <p className="text-white/50 text-xs truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {menu.find((m) => m.key === currentPage)?.label ||
                      "Dashboard"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Welcome back, {currentUser?.username}!
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 relative">
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg">
                    3
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">{renderContent()}</div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutPage
          onLogout={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </div>
  );
};

export default Dashboard;
