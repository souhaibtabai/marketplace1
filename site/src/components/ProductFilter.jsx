import React, { useState, useEffect } from "react";
import { api } from "./service/api";

const ProductFilter = ({ onFilterChange, filters }) => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getCategories();

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response structures
      let categoriesArray = [];
      if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data?.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (data?.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      }

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("Erreur lors du chargement des filtres");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };

    // Handle different value types and empty values
    if (value === "" || value === null || value === undefined) {
      delete newFilters[key];
    } else if (key === "enStock") {
      if (value === false) {
        delete newFilters[key];
      } else {
        newFilters[key] = true;
      }
    } else if (key === "prixMin" || key === "prixMax") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
    } else if (key === "categorieId") {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue <= 0) {
        delete newFilters[key];
      } else {
        newFilters[key] = numValue;
      }
    } else {
      newFilters[key] = value;
    }

    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(
      (cat) => cat.id_categorie === parseInt(categoryId)
    );
    return category ? category.name : `Category ${categoryId}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-black font-semibold">Filtres</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-blue-600 hover:text-blue-800"
        >
          {isOpen ? "Masquer" : "Afficher"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
          <button
            onClick={loadCategories}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className={`space-y-6 ${isOpen ? "block" : "hidden"} md:block`}>
        {/* Price Range */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Prix (TND)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.prixMin || ""}
              onChange={(e) => handleFilterChange("prixMin", e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.prixMax || ""}
              onChange={(e) => handleFilterChange("prixMax", e.target.value)}
            />
          </div>
          {/* Price validation message */}
          {filters.prixMin &&
            filters.prixMax &&
            parseFloat(filters.prixMin) > parseFloat(filters.prixMax) && (
              <p className="text-red-500 text-xs mt-1">
                Le prix minimum ne peut pas être supérieur au prix maximum
              </p>
            )}
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Catégorie
          </label>
          <select
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.categorieId || ""}
            onChange={(e) => handleFilterChange("categorieId", e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id_categorie} value={cat.id_categorie}>
                {cat.name || cat.nom || `Category ${cat.id_categorie}`}
              </option>
            ))}
          </select>
          {categories.length === 0 && !loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              Aucune catégorie disponible
            </p>
          )}
          {categories.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {categories.length} catégorie{categories.length > 1 ? "s" : ""}{" "}
              disponible{categories.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* In Stock Filter */}
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.enStock === true}
              onChange={(e) => handleFilterChange("enStock", e.target.checked)}
            />
            <span className="text-sm text-black">
              Produits en stock uniquement
            </span>
          </label>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearAllFilters}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          disabled={Object.keys(filters).length === 0}
        >
          Effacer les filtres{" "}
          {Object.keys(filters).length > 0 &&
            `(${Object.keys(filters).length})`}
        </button>

        {/* Filter Summary */}
        {Object.keys(filters).length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Filtres actifs:</p>
            <div className="flex flex-wrap gap-2">
              {filters.prixMin && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Min: {filters.prixMin} TND
                </span>
              )}
              {filters.prixMax && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Max: {filters.prixMax} TND
                </span>
              )}
              {filters.categorieId && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {getCategoryDisplayName(filters.categorieId)}
                </span>
              )}
              {filters.enStock && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  En stock
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;
