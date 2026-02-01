import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className=" max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">MarketPlace</h3>
            <p className="text-gray-400">
              Votre destination shopping en ligne pour tous vos besoins.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <span className="text-sm">f</span>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500">
                <span className="text-sm">t</span>
              </div>
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-700">
                <span className="text-sm">i</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Politique de retour
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Catégories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Électronique
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mode
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Maison
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sports
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <Mail size={18} />
                <span>support@marketplace.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} />
                <span>+216 53 249 787</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} />
                <span>Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MarketPlace. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
