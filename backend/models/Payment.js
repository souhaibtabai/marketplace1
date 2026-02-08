module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id_payment: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_payment",
      },
      id_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_order",
        references: {
          model: "orders",
          key: "id_order",
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      payment_method: {
        type: DataTypes.ENUM("CASH", "CARD", "BANK_TRANSFER", "MOBILE_PAYMENT"),
        allowNull: false,
        defaultValue: "CASH",
      },
      payment_status: {
        type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      payment_date: {
        type: DataTypes.DATE,
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
    },
    {
      tableName: "payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["id_order"],
        },
        {
          fields: ["payment_status"],
        },
        {
          fields: ["transaction_id"],
        },
      ],
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, {
      foreignKey: "id_order",
      as: "order",
    });
  };

  return Payment;
};
