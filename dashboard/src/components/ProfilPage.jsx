import React, { useEffect, useState } from "react";

const ProfilPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    adresse: "",
    phone_number: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Helper function to handle API responses
  const handleApiResponse = async (response) => {
    const contentType = response.headers.get("content-type");

    // Check if response is actually JSON
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response received:", text.substring(0, 200));
      throw new Error(
        "Server returned non-JSON response. Expected JSON but got: " +
          (contentType || "unknown content type")
      );
    }

    if (!response.ok) {
      let errorMessage = "HTTP error! Status: " + response.status;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        console.error("Error parsing error response JSON:", jsonError);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  };

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Check multiple possible token keys
      let token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

      // Debug: Check what's in localStorage
      console.log("All localStorage keys:", Object.keys(localStorage));
      console.log("localStorage contents:", {
        token: localStorage.getItem("token"),
        authToken: localStorage.getItem("authToken"),
        accessToken: localStorage.getItem("accessToken"),
        jwt: localStorage.getItem("jwt"),
      });

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log(
        "Fetching profile with token:",
        token.substring(0, 20) + "..."
      );

      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Profile fetch response status:", response.status);
      console.log("Profile fetch response headers:", response.headers);

      const data = await handleApiResponse(response);

      if (!data.user) {
        throw new Error("Invalid response format: user data not found");
      }

      setUser(data.user);
      setProfileForm({
        username: data.user.username || "",
        email: data.user.email || "",
        adresse: data.user.adresse || "",
        phone_number: data.user.phone_number || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Error fetching profile: " + error.message);

      // If it's an auth error, clear the token
      if (
        error.message.includes("authentication") ||
        error.message.includes("401")
      ) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log("Updating profile with data:", profileForm);

      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          Accept: "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      console.log("Update profile response status:", response.status);
      console.log("Update profile response headers:", response.headers);

      const data = await handleApiResponse(response);

      if (!data.user) {
        throw new Error("Invalid response format: user data not found");
      }

      setUser(data.user);
      setEditMode(false);
      alert("Profil mis à jour avec succès!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile: " + error.message);

      // If it's an auth error, clear the token
      if (
        error.message.includes("authentication") ||
        error.message.includes("401")
      ) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      let token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log("Changing password...");

      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          Accept: "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      console.log("Change password response status:", response.status);
      console.log("Change password response headers:", response.headers);

      await handleApiResponse(response);

      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Mot de passe modifié avec succès!");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password: " + error.message);

      // If it's an auth error, clear the token
      if (
        error.message.includes("authentication") ||
        error.message.includes("401")
      ) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white mb-8 shadow-2xl border border-white/20">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                {user?.username}
              </h1>
              <p className="opacity-90 text-xl font-medium">
                {user?.role || "Utilisateur"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              Informations personnelles
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Changer mot de passe
              </button>
              <button
                onClick={() => {
                  if (editMode) {
                    handleUpdateProfile();
                  } else {
                    setEditMode(true);
                  }
                }}
                disabled={loading}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                {editMode ? (
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                )}
                {editMode ? "Sauvegarder" : "Modifier"}
              </button>
              {editMode && (
                <button
                  onClick={() => {
                    setEditMode(false);
                    setProfileForm({
                      username: user?.username || "",
                      email: user?.email || "",
                      adresse: user?.adresse || "",
                      phone_number: user?.phone_number || "",
                    });
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Annuler
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  Nom d'utilisateur
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                ) : (
                  <p className="text-gray-900 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
                    {user?.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  </div>
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                ) : (
                  <p className="text-gray-900 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  Adresse
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={profileForm.adresse}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        adresse: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                ) : (
                  <p className="text-gray-900 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
                    {user?.adresse || "Non renseigné"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  Téléphone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={profileForm.phone_number}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        phone_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                ) : (
                  <p className="text-gray-900 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
                    {user?.phone_number || "Non renseigné"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl p-8 rounded-3xl w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Changer le mot de passe
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilPage;
