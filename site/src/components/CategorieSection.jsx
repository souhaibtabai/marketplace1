import React, { useState, useEffect } from "react";
import { api } from "./service/api";
import {
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  Heart,
  BookOpen,
  UtensilsCrossed,
  Car,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback categories with icons
  const fallbackCategories = [
    {
      name: "Électronique",
      icon: Smartphone,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Vêtements",
      icon: Shirt,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      name: "Maison & Jardin",
      icon: Home,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Sports & Loisirs",
      icon: Dumbbell,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      name: "Beauté & Santé",
      icon: Heart,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      name: "Livres",
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      name: "Alimentation",
      icon: UtensilsCrossed,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      name: "Automobile",
      icon: Car,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
    },
  ];

  const getIconForCategory = (categoryName, index) => {
    const IconComponent =
      fallbackCategories[index % fallbackCategories.length].icon;
    return IconComponent;
  };

  const getColorsForCategory = (index) => {
    return fallbackCategories[index % fallbackCategories.length];
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Catégories populaires
            </h2>
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4 mx-auto"></div>
                <div className="w-20 h-4 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayCategories =
    categories.length > 0
      ? categories
      : fallbackCategories.map((cat, index) => ({
          id_categorie: index,
          name: cat.name,
        }));

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Catégories populaires
            </h2>
            <p className="text-gray-600">
              Explorez nos catégories les plus recherchées
            </p>
          </div>
          <button className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold group">
            <span>Voir tout</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
          {displayCategories.slice(0, 8).map((category, index) => {
            const IconComponent = getIconForCategory(category.name, index);
            const colors = getColorsForCategory(index);

            return (
              <div key={category.id_categorie} className="group cursor-pointer">
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div
                    className={`w-16 h-16 ${colors.bgColor} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`w-8 h-8 ${colors.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-center text-sm group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trending Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Tendances du moment</h3>
            </div>
            <p className="text-xl text-white/90 mb-6">
              Découvrez les produits les plus populaires cette semaine
            </p>
            <button className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Voir les tendances
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
