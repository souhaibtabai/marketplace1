const { sequelize } = require("../config/database");
const { ORDER_STATUS } = require("../config/constants");

const validateOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const validatedItems = [];
  for (const item of items) {
    if (!item.id_produit) {
      throw new Error("Each item must have a product ID (id_produit).");
    }
    if (!item.quantity || item.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    const [product] = await sequelize.query(
      `SELECT * FROM produits WHERE id_produit = :id`,
      {
        replacements: { id: item.id_produit },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!product) {
      throw new Error(`Product with ID ${item.id_produit} not found.`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.id_produit}.`);
    }

    validatedItems.push({
      id_produit: item.id_produit,
      quantity: item.quantity,
      price: product.price,
    });
  }
  return validatedItems;
};

class OrderController {
  async createOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const { items } = req.body;
      if (!items) {
        return res.status(400).json({ message: "Items are required." });
      }
      const validatedItems = await validateOrderItems(items);

      const total_prix = validatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const [order] = await sequelize.query(
        `INSERT INTO orders (id_utilisateur, items, statut, total_prix) 
         VALUES (:id_utilisateur, :items, :statut, :total_prix) 
         RETURNING *`,
        {
          replacements: {
            id_utilisateur: req.user.id_utilisateur,
            items: JSON.stringify(validatedItems),
            statut: ORDER_STATUS.IN_PROGRESS,
            total_prix,
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        }
      );

      // Update product stock
      for (const item of validatedItems) {
        await sequelize.query(
          `UPDATE produits SET stock = stock - :quantity WHERE id_produit = :id`,
          {
            replacements: {
              quantity: item.quantity,
              id: item.id_produit,
            },
            type: sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }

      await t.commit();
      return res.status(201).json({
        message: "Order created successfully.",
        order,
      });
    } catch (err) {
      await t.rollback();
      return res.status(400).json({ message: err.message });
    }
  }

  async getOrderProducts(req, res) {
    try {
      const orderId = req.params.id;
      const [order] = await sequelize.query(
        `SELECT * FROM orders WHERE id_order = :id`,
        {
          replacements: { id: orderId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      if (
        req.user.role === "CLIENT" &&
        order.id_utilisateur !== req.user.id_utilisateur
      ) {
        return res.status(403).json({ message: "Unauthorized access." });
      }

      const items = JSON.parse(order.items);
      const productIds = items.map((item) => item.id_produit);

      const products = await sequelize.query(
        `SELECT * FROM produits WHERE id_produit IN (${productIds.join(",")})`,
        { type: sequelize.QueryTypes.SELECT }
      );

      const result = items
        .map((item) => {
          const product = products.find(
            (p) => p.id_produit === item.id_produit
          );
          return product
            ? { product, quantity: item.quantity, price: item.price }
            : null;
        })
        .filter(Boolean);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order products." });
    }
  }

  async getUserOrders(req, res) {
    try {
      const orders = await sequelize.query(
        `SELECT o.*, u.username 
         FROM orders o 
         LEFT JOIN utilisateurs u ON o.id_utilisateur = u.id_utilisateur 
         WHERE o.id_utilisateur = :id 
         ORDER BY o.created_at DESC`,
        {
          replacements: { id: req.user.id_utilisateur },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch orders." });
    }
  }

  async getOrderById(req, res) {
    try {
      const [order] = await sequelize.query(
        `SELECT o.*, u.username, u.email 
         FROM orders o 
         LEFT JOIN utilisateurs u ON o.id_utilisateur = u.id_utilisateur 
         WHERE o.id_order = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      if (
        req.user.role === "CLIENT" &&
        order.id_utilisateur !== req.user.id_utilisateur
      ) {
        return res.status(403).json({ message: "Unauthorized access." });
      }

      return res.json(order);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch order." });
    }
  }

  async cancelOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const [order] = await sequelize.query(
        `SELECT * FROM orders WHERE id_order = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (!order) {
        await t.rollback();
        return res.status(404).json({ message: "Order not found." });
      }

      if (order.id_utilisateur !== req.user.id_utilisateur) {
        await t.rollback();
        return res.status(403).json({ message: "Unauthorized action." });
      }

      if (order.statut !== ORDER_STATUS.IN_PROGRESS) {
        await t.rollback();
        return res.status(400).json({ message: "Order cannot be canceled." });
      }

      const items = JSON.parse(order.items);
      for (const item of items) {
        await sequelize.query(
          `UPDATE produits SET stock = stock + :quantity WHERE id_produit = :id`,
          {
            replacements: {
              quantity: parseInt(item.quantity),
              id: item.id_produit,
            },
            type: sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }

      await sequelize.query(
        `UPDATE orders SET statut = :statut, finished_statut_at = NOW() WHERE id_order = :id`,
        {
          replacements: {
            statut: ORDER_STATUS.CANCELLED,
            id: req.params.id,
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );

      await t.commit();
      return res.json({ message: "Order canceled successfully." });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Failed to cancel order." });
    }
  }

  async getAllOrders(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access." });
      }

      const { page = 1, limit = 10, statut } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = "";
      const replacements = { limit: parseInt(limit), offset };

      if (statut) {
        whereClause = "WHERE o.statut = :statut";
        replacements.statut = statut;
      }

      // ✅ FIX: Quote "orders" table name
      const orders = await sequelize.query(
        `SELECT o.*, u.username, u.email 
       FROM "orders" o 
       LEFT JOIN utilisateurs u ON o.id_utilisateur = u.id_utilisateur 
       ${whereClause}
       ORDER BY o.created_at DESC 
       LIMIT :limit OFFSET :offset`,
        {
          replacements,
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // ✅ FIX: Quote "orders" table name in COUNT query too
      const [{ count }] = await sequelize.query(
        `SELECT COUNT(*)::int as count FROM "orders" o ${whereClause}`,
        {
          replacements: statut ? { statut } : {},
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.json({
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      });
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return res.status(500).json({ message: "Failed to fetch orders." });
    }
  }
  async updateOrderStatus(req, res) {
    const t = await sequelize.transaction();
    try {
      const { statut } = req.body;
      const [order] = await sequelize.query(
        `SELECT * FROM orders WHERE id_order = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (!order) {
        await t.rollback();
        return res.status(404).json({ message: "Order not found." });
      }

      if (!Object.values(ORDER_STATUS).includes(statut)) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid status." });
      }

      let updateQuery = `UPDATE orders SET statut = :statut`;
      const replacements = { statut, id: req.params.id };

      if (
        [
          ORDER_STATUS.DELIVERED,
          ORDER_STATUS.CANCELLED,
          ORDER_STATUS.RETURNED,
        ].includes(statut)
      ) {
        updateQuery += `, finished_statut_at = NOW()`;
      }

      updateQuery += ` WHERE id_order = :id`;

      await sequelize.query(updateQuery, {
        replacements,
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      });

      await t.commit();
      return res.json({ message: "Status updated successfully." });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Failed to update status." });
    }
  }
}

module.exports = new OrderController();
