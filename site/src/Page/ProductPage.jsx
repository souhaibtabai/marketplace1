import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { api } from "../components/service/api";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";

const ProductsPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [allProducts, filters, pagination.currentPage, searchQuery]);

  const loadAllProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all products without pagination
      const response = await api.getProducts({ limit: 1000 }); // Get all products

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Expected JSON but received: ${contentType || "unknown content type"}`
        );
      }

      const data = await response.json();
      const productsArray = data.products || data || [];

      setAllProducts(productsArray);
    } catch (error) {
      console.error("Error loading products:", error);
      setError(error.message || "Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.categorieId) {
      filtered = filtered.filter(
        (product) => product.id_categorie === parseInt(filters.categorieId)
      );
    }

    // Apply price filters
    if (filters.prixMin) {
      const minPrice = parseFloat(filters.prixMin);
      filtered = filtered.filter((product) => product.price >= minPrice);
    }

    if (filters.prixMax) {
      const maxPrice = parseFloat(filters.prixMax);
      filtered = filtered.filter((product) => product.price <= maxPrice);
    }

    // Apply stock filter
    if (filters.enStock) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    // Calculate pagination
    const limit = 12;
    const totalPages = Math.ceil(filtered.length / limit);
    const startIndex = (pagination.currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    setProducts(paginatedProducts);
    setPagination((prev) => ({
      ...prev,
      totalPages: totalPages,
      total: filtered.length,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    loadAllProducts();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="max-w-7xl bg-white mx-auto px-6 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            className="w-full px-4 text-black py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <button
            type="submit"
            className="absolute right-1 top-1 bg-blue-600 text-white h-11 px-4 py-1.5 rounded-md hover:bg-blue-700"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              Produits {searchQuery && `pour "${searchQuery}"`}
            </h2>
            <p className="text-gray-600">
              {pagination.total} produit{pagination.total !== 1 ? "s" : ""}{" "}
              trouvé{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 animate-pulse rounded-lg h-80"
                ></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 mb-4">
                Impossible de charger les produits. Vérifiez que votre serveur
                backend est en marche.
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id_produit} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 2 &&
                        page <= pagination.currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            page === pagination.currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.currentPage - 3 ||
                      page === pagination.currentPage + 3
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({});
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
