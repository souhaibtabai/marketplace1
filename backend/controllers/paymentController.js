const { sequelize } = require("../config/database");
const { USER_ROLES } = require("../config/constants");

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

const PAYMENT_METHOD = {
  CASH: "CASH",
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  MOBILE_PAYMENT: "MOBILE_PAYMENT",
};

class PaymentController {
  async createPayment(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id_order, payment_method, notes } = req.body;

      if (!id_order || !payment_method) {
        return res.status(400).json({
          message: "Order ID and payment method are required.",
        });
      }

      // Verify order exists and belongs to user
      const [order] = await sequelize.query(
        `SELECT * FROM orders WHERE id_order = :id`,
        {
          replacements: { id: id_order },
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
        return res.status(403).json({ message: "Unauthorized access." });
      }

      // Check if payment already exists for this order
      const [existingPayment] = await sequelize.query(
        `SELECT * FROM payments WHERE id_order = :id`,
        {
          replacements: { id: id_order },
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (existingPayment) {
        await t.rollback();
        return res.status(400).json({
          message: "Payment already exists for this order.",
        });
      }

      // Validate payment method
      if (!Object.values(PAYMENT_METHOD).includes(payment_method)) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid payment method." });
      }

      // Generate transaction ID
      const transaction_id = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)
        .toUpperCase()}`;

      // Create payment record
      const [payment] = await sequelize.query(
        `INSERT INTO payments (id_order, amount, payment_method, payment_status, transaction_id, notes, payment_date)
         VALUES (:id_order, :amount, :payment_method, :payment_status, :transaction_id, :notes, NOW())
         RETURNING *`,
        {
          replacements: {
            id_order,
            amount: order.total_prix,
            payment_method,
            payment_status: PAYMENT_STATUS.PENDING,
            transaction_id,
            notes: notes || null,
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        }
      );

      await t.commit();
      return res.status(201).json({
        message: "Payment initiated successfully.",
        payment,
      });
    } catch (error) {
      await t.rollback();
      console.error("Error creating payment:", error);
      return res.status(500).json({ message: "Failed to create payment." });
    }
  }

  async confirmPayment(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      // Get payment
      const [payment] = await sequelize.query(
        `SELECT p.*, o.id_utilisateur 
         FROM payments p
         JOIN orders o ON p.id_order = o.id_order
         WHERE p.id_payment = :id`,
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      if (!payment) {
        await t.rollback();
        return res.status(404).json({ message: "Payment not found." });
      }

      // Check authorization
      if (
        req.user.role !== "admin" &&
        req.user.role !== "VENDOR" &&
        payment.id_utilisateur !== req.user.id_utilisateur
      ) {
        await t.rollback();
        return res.status(403).json({ message: "Unauthorized access." });
      }

      if (payment.payment_status === PAYMENT_STATUS.COMPLETED) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Payment already completed." });
      }

      // Update payment status
      await sequelize.query(
        `UPDATE payments 
         SET payment_status = :status, payment_date = NOW()
         WHERE id_payment = :id`,
        {
          replacements: {
            status: PAYMENT_STATUS.COMPLETED,
            id,
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );

      // Update order status to CONFIRMED
      await sequelize.query(
        `UPDATE orders 
         SET statut = 'CONFIRMED'
         WHERE id_order = :id_order`,
        {
          replacements: { id_order: payment.id_order },
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );

      await t.commit();
      return res.json({ message: "Payment confirmed successfully." });
    } catch (error) {
      await t.rollback();
      console.error("Error confirming payment:", error);
      return res.status(500).json({ message: "Failed to confirm payment." });
    }
  }

  async getPaymentByOrder(req, res) {
    try {
      const { orderId } = req.params;

      const [payment] = await sequelize.query(
        `SELECT p.*, o.id_utilisateur 
         FROM payments p
         JOIN orders o ON p.id_order = o.id_order
         WHERE p.id_order = :orderId`,
        {
          replacements: { orderId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!payment) {
        return res.status(404).json({ message: "Payment not found." });
      }

      // Check authorization
      if (
        req.user.role !== "admin" &&
        req.user.role !== USER_ROLES.VENDOR &&
        payment.id_utilisateur !== req.user.id_utilisateur
      ) {
        return res.status(403).json({ message: "Unauthorized access." });
      }

      return res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      return res.status(500).json({ message: "Failed to fetch payment." });
    }
  }

  async getAllPayments(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access." });
      }

      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = "";
      const replacements = { limit: parseInt(limit), offset };

      if (status) {
        whereClause = "WHERE p.payment_status = :status";
        replacements.status = status;
      }

      const payments = await sequelize.query(
        `SELECT p.*, o.total_prix, u.username, u.email
         FROM payments p
         JOIN orders o ON p.id_order = o.id_order
         JOIN utilisateurs u ON o.id_utilisateur = u.id_utilisateur
         ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT :limit OFFSET :offset`,
        {
          replacements,
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const [{ count }] = await sequelize.query(
        `SELECT COUNT(*)::int as count FROM payments p ${whereClause}`,
        {
          replacements: status ? { status } : {},
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.json({
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      return res.status(500).json({ message: "Failed to fetch payments." });
    }
  }
}

module.exports = new PaymentController();
