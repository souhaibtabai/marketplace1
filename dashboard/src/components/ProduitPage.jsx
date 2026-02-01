import React, { useEffect, useState } from "react";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    market: "",
    minPrice: "",
    maxPrice: "",
  });

  // Safe user data extraction with error handling
  const getUserData = () => {
    try {
      // Try to get from localStorage first, fallback to null
      const userData = localStorage?.getItem("user");
      const token = localStorage?.getItem("token");

      if (userData) {
        const user = JSON.parse(userData);
        return {
          role: user.role || null,
          token: user.token || token || null,
        };
      }

      // If no user data, just check for token
      return {
        role: token ? "VENDOR" : null, // Assume VENDOR role if token exists
        token: token || null,
      };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      // Fallback: try to get just the token
      try {
        const token = localStorage?.getItem("token");
        return {
          role: token ? "VENDOR" : null,
          token: token || null,
        };
      } catch {
        return { role: null, token: null };
      }
    }
  };

  const { role: userRole, token: userToken } = getUserData();

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    id_categorie: "",
    id_market: "",
  });

  const [stockForm, setStockForm] = useState({
    stock: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/produit", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.products;
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Error fetching products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndMarkets = async () => {
    try {
      const [categoriesRes, marketsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/markets"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.categories || []
        );
      }

      if (marketsRes.ok) {
        const marketsData = await marketsRes.json();
        setMarkets(
          Array.isArray(marketsData) ? marketsData : marketsData.markets || []
        );
      }
    } catch (error) {
      console.error("Error fetching categories/markets:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndMarkets();
  }, []);

  const handleCreateProduct = async () => {
    if (
      !productForm.name ||
      !productForm.price ||
      !productForm.stock ||
      !productForm.id_categorie ||
      !productForm.id_market
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Check if user is authenticated
    if (!userToken) {
      alert("You must be logged in to create products. Please log in first.");
      return;
    }

    // Validate that category and market exist
    const categoryExists = categories.find(
      (cat) => cat.id_categorie == productForm.id_categorie
    );
    const marketExists = markets.find(
      (market) => market.id_market == productForm.id_market
    );

    if (!categoryExists) {
      alert("Selected category does not exist. Please refresh and try again.");
      return;
    }

    if (!marketExists) {
      alert("Selected market does not exist. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }

      // Convert string values to numbers for numeric fields
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        id_categorie: parseInt(productForm.id_categorie),
        id_market: parseInt(productForm.id_market),
      };

      console.log("Sending product data:", productData); // Debug log
      console.log("Using token:", userToken); // Debug log

      const response = await fetch("/api/create", {
        method: "POST",
        headers,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("Server error response:", errorData); // Debug log

        // Handle specific authentication errors
        if (response.status === 401 || response.status === 403) {
          alert(
            "Authentication failed. Please log in again. Error: " +
              (errorData.message || "Unauthorized")
          );

          return;
        }

        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      alert("Product created successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update product - FIXED URL FORMAT
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    // Validate that category and market exist
    const categoryExists = categories.find(
      (cat) => cat.id_categorie == productForm.id_categorie
    );
    const marketExists = markets.find(
      (market) => market.id_market == productForm.id_market
    );

    if (!categoryExists) {
      alert("Selected category does not exist. Please refresh and try again.");
      return;
    }

    if (!marketExists) {
      alert("Selected market does not exist. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }

      // Convert string values to numbers for numeric fields
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        id_categorie: parseInt(productForm.id_categorie),
        id_market: parseInt(productForm.id_market),
      };

      const response = await fetch(`/api/${selectedProduct.id_produit}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      alert("Product updated successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id_produit) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    setLoading(true);
    try {
      const headers = {
        Accept: "application/json",
      };

      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }

      const response = await fetch(`/api/${id_produit}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update stock - FIXED URL FORMAT
  const handleUpdateStock = async () => {
    if (!selectedProduct || !stockForm.stock) {
      alert("Please enter a valid stock quantity");
      return;
    }

    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }
      console.log("user token :", userToken);
      const response = await fetch(`/api/${selectedProduct.id_produit}/stock`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ stock: parseInt(stockForm.stock) }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      alert("Stock updated successfully!");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error updating stock: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const handleSearch = async () => {
    if (
      !searchQuery.trim() &&
      !filters.category &&
      !filters.market &&
      !filters.minPrice &&
      !filters.maxPrice
    ) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.append("q", searchQuery.trim());
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.market) queryParams.append("market", filters.market);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

      const response = await fetch(`/api/search?${queryParams}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Error searching products:", error);
      alert("Error searching products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);

    if (type === "create") {
      setProductForm({
        name: "",
        price: "",
        stock: "",
        description: "",
        id_categorie: "",
        id_market: "",
      });
    } else if (type === "edit" && product) {
      setProductForm({
        name: product.name || "",
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || "",
        id_categorie: product.id_categorie || "",
        id_market: product.id_market || "",
      });
    } else if (type === "stock" && product) {
      setStockForm({ stock: product.stock || "" });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      category: "",
      market: "",
      minPrice: "",
      maxPrice: "",
    });
    fetchProducts();
  };

  // Debug function to show current form data
  const debugFormData = () => {
    console.log("Current form data:", {
      productForm,
      categories: categories.map((c) => ({ id: c.id_categorie, name: c.name })),
      markets: markets.map((m) => ({ id: m.id_market, name: m.name })),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Product Management
          </h1>
          {userRole === "VENDOR" && (
            <button
              onClick={() => openModal("create")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              disabled={loading}
            >
              Add New Product
            </button>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-2xl p-6 mb-8 backdrop-blur-sm shadow-lg">
          <p className="text-sm text-yellow-800 font-medium">
            <strong>Debug Info:</strong> Categories: {categories.length},
            Markets: {markets.length}, User Role: {userRole || "None"}, Token:{" "}
            {userToken ? "✅ Present" : "❌ Missing"}
            <button
              onClick={debugFormData}
              className="ml-4 text-xs bg-gradient-to-r from-yellow-200 to-orange-200 hover:from-yellow-300 hover:to-orange-300 px-3 py-1 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Log Form Data
            </button>
          </p>
          {!userToken && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              ⚠️ No authentication token found. Please log in to create
              products.
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl p-6 rounded-3xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg placeholder-gray-500"
              />
            </div>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id_categorie} value={cat.id_categorie}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={filters.market}
              onChange={(e) =>
                setFilters({ ...filters, market: e.target.value })
              }
              className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
            >
              <option value="">All Markets</option>
              {markets.map((market) => (
                <option key={market.id_market} value={market.id_market}>
                  {market.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
              className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg placeholder-gray-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
              className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg placeholder-gray-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              disabled={loading}
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-lg"></div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(products) &&
            products.map((product) => (
              <div
                key={product.id_produit}
                className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500"
              >
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {product.name}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">$</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Price:
                        </span>
                        <span className="ml-2 text-green-600 font-bold">
                          {product.price} DT
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">#</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Stock:
                        </span>
                        <span className="ml-2 text-purple-600 font-bold">
                          {product.stock}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">🏪</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Market:
                        </span>
                        <span className="ml-2 text-orange-600 font-medium">
                          {product.market_name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">📂</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Category:
                        </span>
                        <span className="ml-2 text-blue-600 font-medium">
                          {product.category_name || "N/A"}
                        </span>
                      </div>
                    </div>

                    {product.description && (
                      <div className="bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-200">
                        <span className="font-semibold text-gray-700">
                          Description:
                        </span>
                        <p className="mt-1 text-gray-600">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userRole === "VENDOR" && (
                      <button
                        onClick={() => openModal("edit", product)}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        disabled={loading}
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
                    {userRole === "VENDOR" && (
                      <button
                        onClick={() => openModal("stock", product)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        disabled={loading}
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
                            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9z"
                          />
                        </svg>
                        Stock
                      </button>
                    )}
                    {userRole === "VENDOR" && (
                      <button
                        onClick={() => handleDeleteProduct(product.id_produit)}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        disabled={loading}
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
            ))}
        </div>

        {!loading && Array.isArray(products) && products.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-500">📦</span>
              </div>
              <p className="text-xl text-gray-500 font-medium">
                No products found.
              </p>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl p-8 rounded-3xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {modalType === "create" && "Add New Product"}
                  {modalType === "edit" && "Edit Product"}
                  {modalType === "stock" && "Update Stock"}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ×
                </button>
              </div>

              {(modalType === "create" || modalType === "edit") && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              stock: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category * ({categories.length} available)
                        </label>
                        <select
                          value={productForm.id_categorie}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              id_categorie: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option
                              key={cat.id_categorie}
                              value={cat.id_categorie}
                            >
                              {cat.name} (ID: {cat.id_categorie})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Market * ({markets.length} available)
                        </label>
                        <select
                          value={productForm.id_market}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              id_market: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                          required
                        >
                          <option value="">Select Market</option>
                          {markets.map((market) => (
                            <option
                              key={market.id_market}
                              value={market.id_market}
                            >
                              {market.name} (ID: {market.id_market})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="4"
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={
                        modalType === "create"
                          ? handleCreateProduct
                          : handleUpdateProduct
                      }
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                    >
                      {modalType === "create"
                        ? "Create Product"
                        : "Update Product"}
                    </button>
                  </div>
                </div>
              )}

              {modalType === "stock" && (
                <div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">#</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedProduct?.name}
                        </h3>
                        <p className="text-purple-600 font-medium">
                          Current Stock: {selectedProduct?.stock}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockForm.stock}
                      onChange={(e) => setStockForm({ stock: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 shadow-lg"
                      placeholder="Enter new stock quantity"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateStock}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductPage;
