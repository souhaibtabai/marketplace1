import React, { useState, useEffect } from "react";

const CategoriePage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [produitsParCategorie, setProduitsParCategorie] = useState({});
  const [loadingProduits, setLoadingProduits] = useState({});
  const [errorProduits, setErrorProduits] = useState({});

  // States for category creation/editing
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    Description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Safe user data extraction with error handling
  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return { role: null, token: null };
      const user = JSON.parse(userData);
      return {
        role: user.role || null,
        token: user.token || null,
      };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return { role: null, token: null };
    }
  };

  const { role: userRole, token: userToken } = getUserData();

  // Helper function to get token consistently
  const getAuthToken = () => {
    return userToken || localStorage.getItem("token");
  };

  // Chargement des catégories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
      setLoadingCategories(false);
    } catch (err) {
      setErrorCategories(err?.message ?? "Erreur inconnue");
      setLoadingCategories(false);
    }
  };

  // Create new category - Fixed headers and URL
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Fixed: Removed trailing slash from URL
      const response = await fetch("/api/categories", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        setShowCreateModal(false);
        setFormData({ name: "", Description: "" });
        alert("Category created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Update category - Fixed URL format and category ID access
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!editingCategory) {
      alert("No category selected for editing");
      setSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/categories/${editingCategory.id_categorie}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchCategories();
        setShowEditModal(false);
        setEditingCategory(null);
        setFormData({ name: "", Description: "" });
        alert("Category updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category - Fixed URL format
  const handleDeleteCategory = async (categoryName, categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (confirmed) {
      try {
        const token = getAuthToken();
        const headers = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Fixed: Remove colon from URL
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
          headers,
        });

        if (response.ok) {
          await fetchCategories();
          alert("Category deleted successfully!");
        } else {
          const error = await response.json();
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      Description: category.Description,
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loadingCategories)
    return (
      <div className="p-4 text-gray-700">Chargement des catégories...</div>
    );
  if (errorCategories)
    return <div className="p-4 text-red-600">Erreur: {errorCategories}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Category Management
          </h1>
          {userRole === "admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Category
              </span>
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-500">📂</span>
              </div>
              <p className="text-xl text-gray-500 font-medium">
                No categories available.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((categorie) => {
              const id =
                categorie?.id_categorie ??
                categorie?.id ??
                categorie?.categoryId;
              const nom = categorie?.name ?? categorie?.label ?? "Catégorie";
              const Description = categorie.Description;
              const imageUrl = categorie?.imageUrl ?? categorie?.image ?? "";

              return (
                <div
                  key={id}
                  className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 group"
                >
                  {imageUrl ? (
                    <div
                      className="h-48 bg-cover bg-center relative overflow-hidden"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-3xl text-white"></span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                        {nom}
                      </h2>
                      {Description && (
                        <p className="text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                          {Description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      {userRole === "admin" && (
                        <button
                          onClick={() => handleEditClick(categorie)}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <svg
                            className="w-4 h-4"
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
                          Edit
                        </button>
                      )}
                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDeleteCategory(nom, id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Category
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: "", Description: "" });
                  }}
                  className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📝</span>
                    </div>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📄</span>
                    </div>
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: "", Description: "" });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Edit Category
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                    setFormData({ name: "", Description: "" });
                  }}
                  className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📝</span>
                    </div>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">📄</span>
                    </div>
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCategory(null);
                      setFormData({ name: "", Description: "" });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </span>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriePage;
