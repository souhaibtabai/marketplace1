import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../components/service/api";

const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/markets/`);
      if (!response.ok) {
        throw new Error("Failed to fetch shops");
      }
      const data = await response.json();
      // Use the correct property for shops array
      setShops(Array.isArray(data.shops) ? data.shops : []);
      // Optionally, log for debugging
      console.log("Fetched shops:", data.shops);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = (shopId) => {
    // Add validation for shopId
    if (shopId) {
      navigate(`/shop/${shopId}`);
    } else {
      console.error("Invalid shop ID");
    }
  };

  const filteredShops = Array.isArray(shops)
    ? shops.filter((shop) => {
        if (!shop || !shop.name) return false; // Add safety check

        const searchLower = searchTerm.toLowerCase();
        const nameMatch = shop.name.toLowerCase().includes(searchLower);

        const description = shop.description || "";
        const descriptionMatch = description
          .toLowerCase()
          .includes(searchLower);

        return nameMatch || descriptionMatch;
      })
    : [];

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
            onClick={fetchShops}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Shops</h1>
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShops.map((shop) => (
            <div
              key={shop.id_market}
              onClick={() => handleShopClick(shop.id_market)}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-400 to-purple-600 p-6">
                {shop.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <svg
                      className="w-16 h-16 text-white opacity-80"
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
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {shop.name}
                </h3>
                {/* Fixed line-clamp issue - replaced with CSS truncation */}
                <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden">
                  {shop.description || "Visit our shop for amazing products"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <svg
                      className="inline w-4 h-4 mr-1"
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
                    </svg>
                    {shop.location || "Online"}
                  </span>
                  {shop.rating && (
                    <span className="flex items-center text-yellow-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="ml-1 text-gray-600">{shop.rating}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? `No shops found for "${searchTerm}"`
                : "No shops found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsPage;
