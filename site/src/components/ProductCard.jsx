import React, { useState } from "react";
import { Star, Heart, ShoppingCart, Eye, Zap, Shield } from "lucide-react";
import { useCart } from "./context/CartContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    const success = await addToCart(product);
    if (success) {
      alert("Produit ajouté au panier !");
    } else {
      alert("Erreur lors de l'ajout au panier");
    }
  };

  const discountPercentage = Math.floor(Math.random() * 30) + 10; // Random discount for demo
  const originalPrice = Math.round(
    product.price * (1 + discountPercentage / 100)
  );
  const savings = originalPrice - product.price;

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-2">
        {discountPercentage > 15 && (
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{discountPercentage}%
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            Stock faible
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group-hover:scale-110"
      >
        <Heart
          size={18}
          className={`transition-colors ${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-400 hover:text-red-500"
          }`}
        />
      </button>

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.stock <= 0 && (
          <div className="absolute inset-0  backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-white font-semibold text-lg">
              Rupture de stock
            </span>
          </div>
        )}

        {/* Placeholder for product image */}
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-6xl text-gray-300">📦</div>
        </div>

        {/* Quick Actions Overlay */}
        <div
          className={`absolute inset-0 backdrop-blur-xl justify-center space-x-3 transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Brand/Market */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {product.market_name}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.category_name}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">(4.0)</span>
          <span className="ml-auto text-xs text-gray-500">127 avis</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.Description ||
            product.description ||
            "Description du produit non disponible"}
        </p>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">
              {product.price} DT
            </span>
            {discountPercentage > 15 && (
              <span className="text-lg text-gray-500 line-through">
                {originalPrice} DT
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              Économisez {savings} DT
            </p>
          )}
        </div>

        {/* Stock Status */}
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
          <div className="flex items-center space-x-1 text-green-600">
            <Shield className="w-3 h-3" />
            <span className="text-xs">Garanti</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            product.stock > 0
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {product.stock > 0 ? "Ajouter au panier" : "Indisponible"}
        </button>

        {/* Delivery Info */}
        <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Livraison rapide
          </span>
          <span>•</span>
          <span>Retour gratuit</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
