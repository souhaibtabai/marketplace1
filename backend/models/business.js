module.exports = (sequelize, DataTypes) => {
  const BusinessAccountRequest = sequelize.define(
    "business_account_requests",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      requested_role: {
        type: DataTypes.ENUM("VENDOR", "LIVREUR"),
        defaultValue: "VENDOR",
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.TEXT,
      },
      tax_number: {
        type: DataTypes.STRING(100),
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
        allowNull: false,
      },
      submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      tableName: "business_account_requests",

      underscored: true,
    }
  );

  return BusinessAccountRequest;
};
