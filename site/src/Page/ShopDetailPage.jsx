import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/context/CartContext";

const ShopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [currentPriceRange, setCurrentPriceRange] = useState({
    min: 0,
    max: 1000,
  });

  console.log("Route params:", useParams());
  console.log("Current ID:", id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchShopData();
  }, [id]);

  const fetchShopData = async () => {
    try {
      setLoading(true);

      // Fetch shop details
      const shopResponse = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/markets/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!shopResponse.ok) throw new Error("Failed to fetch shop details");
      const shopData = await shopResponse.json();
      setShop(shopData);

      // Fetch shop products
      const productsResponse = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/markets/${id}/products`);
      if (!productsResponse.ok) throw new Error("Failed to fetch products");
      const productsData = await productsResponse.json();
      const productsArray = Array.isArray(productsData)
        ? productsData
        : productsData.products || [];
      setProducts(productsArray);
      setFilteredProducts(productsArray);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(productsArray.map((p) => p.category)),
      ];
      setCategories(uniqueCategories);

      // Set price range based on products
      if (productsData.length > 0) {
        const prices = productsData.map((p) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange({ min: minPrice, max: maxPrice });
        setCurrentPriceRange({ min: minPrice, max: maxPrice });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, currentPriceRange, sortBy]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) =>
        p.price >= currentPriceRange.min && p.price <= currentPriceRange.max
    );

    // Sort products
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handlePriceChange = (type, value) => {
    setCurrentPriceRange((prev) => ({
      ...prev,
      [type]: Number(value),
    }));
  };

  const handleAddToCart = async (product) => {
    const success = await addToCart(product.id_produit, 1);
    console.log("Add to cart response:", success);
    if (success) {
      alert(`Ajouté au panier: ${product.name}`);
    } else {
      alert("Erreur lors de l'ajout au panier.");
    }
  };

  const handleBackToShops = () => {
    navigate("/shops");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={handleBackToShops}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              {shop?.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{shop?.name}</h1>
              <p className="text-gray-600 mt-1">{shop?.description}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
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
                  {shop?.location || "Location not specified"}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
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
                  {filteredProducts.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg text-black font-semibold mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Category
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === "all"}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      All Categories
                    </span>
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">
                      Min: ${currentPriceRange.min}
                    </label>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={currentPriceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Max: ${currentPriceRange.max}
                    </label>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={currentPriceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full mt-1"
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    ${currentPriceRange.min} - ${currentPriceRange.max}
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-500">
                  No products found matching your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  // Use inside ShopDetailPage.jsx
                  <div
                    key={product.id_produit || product.id}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl text-gray-300">📦</div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10">
                          <span className="text-white font-semibold text-lg">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {product.category}
                      </p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description || "Description non disponible"}
                      </p>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price} DT
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              product.stock > 10
                                ? "bg-green-500"
                                : product.stock > 0
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {product.stock > 10
                              ? "En stock"
                              : product.stock > 0
                              ? `${product.stock} restant(s)`
                              : "Rupture"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                          product.stock > 0
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {product.stock > 0
                          ? "Ajouter au panier"
                          : "Indisponible"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;
