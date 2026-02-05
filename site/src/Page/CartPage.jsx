import { useContext } from "react";
import { useCart, CartContext } from "../components/context/CartContext.jsx";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Votre Panier</h2>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500">
          Votre panier est vide.
          <button
            className="mt-4 px-4 py-2 bg-orange-400 text-white rounded"
            onClick={() => navigate("/products")}
          >
            Voir les produits
          </button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-6">
            {cart.map((item) => (
              <li
                key={item.id || item.id_product}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <span className="ml-2 text-gray-500">x{item.quantity}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold">{item.price}€</span>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => removeFromCart(item.id || item.id_product)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">{totalPrice}€</span>
          </div>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => navigate("/orders")}
            >
              Commander
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
              onClick={clearCart}
            >
              Vider le panier
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
