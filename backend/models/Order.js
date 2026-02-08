// models/Order.js - Fixed version
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id_order: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_order",
      },
      id_utilisateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_utilisateur",
      },
      total_prix: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_prix",
        validate: {
          min: 0,
        },
      },
      statut: {
        type: DataTypes.ENUM(
          "IN_PROGRESS",
          "PENDING",
          "CONFIRMED",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
          "RETURNED"
        ),
        allowNull: false,
        defaultValue: "IN_PROGRESS",
      },
      items: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
          isValidItems(value) {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error("La commande doit contenir au moins un article");
            }

            for (const item of value) {
              if (!item.id_produit || !item.quantity || !item.price) {
                throw new Error(
                  "Chaque article doit avoir un id_produit, quantity et price"
                );
              }
              if (item.quantity <= 0) {
                throw new Error("La quantité doit être supérieure à zéro");
              }
            }
          },
        },
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
      finished_statut_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "finished_statut_at",
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["id_utilisateur"],
        },
        {
          fields: ["statut"],
        },
        {
          fields: ["created_at"],
        },
      ],
      hooks: {
        beforeValidate: (order) => {
          // Calculate total price from items if not provided
          if (
            order.items &&
            Array.isArray(order.items) &&
            order.items.length > 0
          ) {
            const calculatedTotal = order.items.reduce((sum, item) => {
              return sum + parseFloat(item.price) * parseInt(item.quantity);
            }, 0);

            if (!order.total_prix || order.total_prix === 0) {
              order.total_prix = calculatedTotal.toFixed(2);
            }
          }
        },
      },
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.Utilisateur, {
      foreignKey: "id_utilisateur",
      as: "user",
    });
    Order.hasOne(models.Payment, {
      foreignKey: "id_order",
      as: "payment",
    });
  };

  return Order;
};
