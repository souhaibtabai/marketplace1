class CartController {
  async addToCart(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id_produit, quantity = 1 } = req.body;

      // Validate product exists and has sufficient stock
      const [product] = await sequelize.query(
        `SELECT * FROM produits WHERE id_produit = $1`,
        { bind: [id_produit], type: QueryTypes.SELECT, transaction: t }
      );

      if (!product) {
        throw new AppError("Produit non trouvé", 404);
      }

      if (product.stock < quantity) {
        throw new AppError("Stock insuffisant", 400);
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
      next(error);
    }
  }
  async removeFromCart(req, res, next) {
    try {
      const { id_cart } = req.body;
      await sequelize.query(
        `DELETE FROM cart WHERE id_cart = $1 AND id_utilisateur = $2`,
        { bind: [id_cart, req.user.id_utilisateur], type: QueryTypes.DELETE }
      );
      res.json({ message: "Produit supprimé du panier" });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      await sequelize.query(`DELETE FROM cart WHERE id_utilisateur = $1`, {
        bind: [req.user.id_utilisateur],
        type: QueryTypes.DELETE,
      });
      res.json({ message: "Panier vidé" });
    } catch (error) {
      next(error);
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
      next(error);
    }
  }
}

// 2. Review Controller (reviewController.js)
class ReviewController {
  async createReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const { id: id_produit } = req.params;

      // Check if user has bought this product
      const [hasPurchased] = await sequelize.query(
        `SELECT COUNT(*) as count FROM orders o
         WHERE o.id_utilisateur = $1 
         AND JSON_EXTRACT(o.items, '$[*].id_produit') LIKE '%$2%'
         AND o.statut = 'DELIVERED'`,
        { bind: [req.user.id_utilisateur, id_produit], type: QueryTypes.SELECT }
      );

      if (hasPurchased.count === 0) {
        return res.status(400).json({
          message: "Vous devez avoir acheté ce produit pour le noter",
        });
      }

      // Check if already reviewed
      const [existingReview] = await sequelize.query(
        `SELECT id_review FROM reviews 
         WHERE id_utilisateur = $1 AND id_produit = $2`,
        { bind: [req.user.id_utilisateur, id_produit], type: QueryTypes.SELECT }
      );

      if (existingReview) {
        return res.status(400).json({
          message: "Vous avez déjà noté ce produit",
        });
      }

      const [review] = await sequelize.query(
        `INSERT INTO reviews (id_utilisateur, id_produit, rating, comment)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        {
          bind: [req.user.id_utilisateur, id_produit, rating, comment],
          type: QueryTypes.SELECT,
        }
      );

      res.status(201).json({ message: "Avis ajouté", review: review[0] });
    } catch (error) {
      next(error);
    }
  }
}

// 3. Wishlist Controller (wishlistController.js)
class WishlistController {
  async addToWishlist(req, res) {
    try {
      const { productId } = req.params;

      // Check if already in wishlist
      const [existing] = await sequelize.query(
        `SELECT id_wishlist FROM wishlist 
         WHERE id_utilisateur = $1 AND id_produit = $2`,
        { bind: [req.user.id_utilisateur, productId], type: QueryTypes.SELECT }
      );

      if (existing) {
        return res.status(400).json({ message: "Déjà dans la wishlist" });
      }

      await sequelize.query(
        `INSERT INTO wishlist (id_utilisateur, id_produit) VALUES ($1, $2)`,
        { bind: [req.user.id_utilisateur, productId], type: QueryTypes.INSERT }
      );

      res.json({ message: "Ajouté à la wishlist" });
    } catch (error) {
      next(error);
    }
  }
}

// 4. Analytics Controller (analyticsController.js)
class AnalyticsController {
  async getDashboardStats(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Non autorisé" });
      }

      // Get various statistics
      const [userStats] = await sequelize.query(
        `SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'CLIENT' THEN 1 END) as clients,
          COUNT(CASE WHEN role = 'VENDOR' THEN 1 END) as vendors
         FROM utilisateurs`
      );

      const [orderStats] = await sequelize.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_prix) as total_revenue,
          COUNT(CASE WHEN statut = 'IN_PROGRESS' THEN 1 END) as pending_orders
         FROM orders`
      );

      const [productStats] = await sequelize.query(
        `SELECT 
          COUNT(*) as total_products,
          COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock
         FROM produits`
      );

      res.json({
        users: userStats[0],
        orders: orderStats[0],
        products: productStats[0],
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  CartController: new CartController(),
  ReviewController: new ReviewController(),
  WishlistController: new WishlistController(),
  AnalyticsController: new AnalyticsController(),
};
