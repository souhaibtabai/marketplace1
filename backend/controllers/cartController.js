const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

class CartController {
  async addToCart(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id_produit, quantity = 1 } = req.body;

      // Validate product exists and has sufficient stock
      const [product] = await sequelize.query(
        `SELECT * FROM produits WHERE id_produit = $1`,
        { bind: [id_produit], type: QueryTypes.SELECT, transaction: t }
      );

      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      if (product.stock < quantity) {
        await t.rollback();
        return res.status(400).json({ message: "Stock insuffisant" });
      }

      // Check if item already in cart
      const [existingItem] = await sequelize.query(
        `SELECT * FROM cart WHERE id_utilisateur = $1 AND id_produit = $2`,
        {
          bind: [req.user.id_utilisateur, id_produit],
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (existingItem) {
        // Update quantity
        await sequelize.query(
          `UPDATE cart SET quantity = quantity + $1 WHERE id_cart = $2`,
          {
            bind: [quantity, existingItem.id_cart],
            type: QueryTypes.UPDATE,
            transaction: t,
          }
        );
      } else {
        // Add new item
        await sequelize.query(
          `INSERT INTO cart (id_utilisateur, id_produit, quantity) VALUES ($1, $2, $3)`,
          {
            bind: [req.user.id_utilisateur, id_produit, quantity],
            type: QueryTypes.INSERT,
            transaction: t,
          }
        );
      }

      await t.commit();
      res.json({ message: "Produit ajouté au panier" });
    } catch (error) {
      await t.rollback();
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout au panier" });
    }
  }
  async removeFromCart(req, res) {
    try {
      const { id_cart } = req.body;
      await sequelize.query(
        `DELETE FROM cart WHERE id_cart = $1 AND id_utilisateur = $2`,
        { bind: [id_cart, req.user.id_utilisateur], type: QueryTypes.DELETE }
      );
      res.json({ message: "Produit supprimé du panier" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  }

  async clearCart(req, res) {
    try {
      await sequelize.query(`DELETE FROM cart WHERE id_utilisateur = $1`, {
        bind: [req.user.id_utilisateur],
        type: QueryTypes.DELETE,
      });
      res.json({ message: "Panier vidé" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Erreur lors du vidage du panier" });
    }
  }

  async getCart(req, res) {
    try {
      const cartItems = await sequelize.query(
        `SELECT c.*, p.name, p.price, p.stock, p.description,
                m.name as market_name, cat.name as category_name
         FROM cart c
         JOIN produits p ON c.id_produit = p.id_produit
         LEFT JOIN market m ON p.id_market = m.id_market
         LEFT JOIN categories cat ON p.id_categorie = cat.id_categorie
         WHERE c.id_utilisateur = $1`,
        { bind: [req.user.id_utilisateur], type: QueryTypes.SELECT }
      );

      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      res.json({
        items: cartItems,
        total,
        itemCount: cartItems.length,
      });
    } catch (error) {
      console.error("Error getting cart:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du panier" });
    }
  }
}

module.exports = {
  CartController: new CartController(),
};
