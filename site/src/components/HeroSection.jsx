import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  CreditCard,
} from "lucide-react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Bienvenue sur notre MarketPlace",
      subtitle: "Découvrez des milliers de produits de qualité",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      cta: "Découvrir maintenant",
      badge: "Nouveau",
      description: "Plus de 10,000 produits disponibles",
    },
    {
      title: "Livraison rapide",
      subtitle: "Recevez vos commandes en 24-48h",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=2274&q=80",
      cta: "Voir les délais",
      badge: "Express",
      description: "Livraison gratuite dès 50 DT",
    },
    {
      title: "Meilleurs prix garantis",
      subtitle: "Comparez et économisez sur tous vos achats",
      image:
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      cta: "Comparer les prix",
      badge: "Offre",
      description: "Jusqu'à -70% sur une sélection",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative">
      {/* Main Hero Carousel */}
      <div className="relative h-[500px] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 transform translate-x-0"
                : index < currentSlide
                ? "opacity-0 transform -translate-x-full"
                : "opacity-0 transform translate-x-full"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>

            <div className="relative z-10 flex items-center h-full">
              <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold mb-6 shadow-lg">
                    <Star className="w-4 h-4 mr-2" />
                    {slide.badge}
                  </div>

                  {/* Title */}
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white leading-tight">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xl md:text-2xl mb-4 text-gray-200 font-light">
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-lg mb-8 text-gray-300">
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  <button className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                    <span className="mr-2">{slide.cta}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-full">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Livraison gratuite</p>
                <p className="text-xs text-gray-500">Dès 50 DT d'achat</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 text-gray-700">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Paiement sécurisé</p>
                <p className="text-xs text-gray-500">Garantie 100%</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end space-x-3 text-gray-700">
              <div className="p-2 bg-purple-100 rounded-full">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Retour gratuit</p>
                <p className="text-xs text-gray-500">Sous 30 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
