import React from "react";

const LogoutPage = ({ onLogout, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Confirm Logout
          </h2>
          <p className="text-gray-600 text-lg">
            Are you sure you want to sign out of your account?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
export default LogoutPage;
