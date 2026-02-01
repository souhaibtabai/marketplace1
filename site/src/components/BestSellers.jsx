import React, { useState, useEffect } from "react";
import { api } from "./service/api";
import ProductCard from "./ProductCard";
import { TrendingUp, ArrowRight, Star, Zap } from "lucide-react";

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      const response = await api.getProducts({
        limit: 8,
        sortBy: "created_at",
        sortOrder: "DESC",
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error loading best sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full px-6 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="w-64 h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="w-48 h-4 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="w-24 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 animate-pulse rounded-2xl h-96 border"
              >
                <div className="p-4">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-6 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Meilleures ventes
              </h2>
              <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-red-100 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">
                  Populaire
                </span>
              </div>
            </div>
            <p className="text-gray-600">
              Les produits les plus vendus cette semaine
            </p>
          </div>
          <button className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold group">
            <span>Voir tout</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
              <div className="text-sm text-gray-600">Produits vendus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">4.8★</div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">24h</div>
              <div className="text-sm text-gray-600">Livraison express</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map((product, index) => (
            <div key={product.id_produit} className="relative">
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2 z-30">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-400 to-gray-500"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-400 to-orange-500"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                >
                  {index + 1}
                </div>
              </div>

              {index < 3 && (
                <div className="absolute top-2 left-2 z-20">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Best-seller
                  </div>
                </div>
              )}

              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Voir tous les best-sellers
          </button>
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ne manquez aucune offre !
            </h3>
            <p className="text-xl text-white/90 mb-6">
              Inscrivez-vous à notre newsletter pour être informé en premier
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
