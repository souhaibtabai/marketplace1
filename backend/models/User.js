// models/User.js - Fixed version
module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      id_utilisateur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_utilisateur",
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 255],
        },
      },
      username: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      adresse: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: [8, 20],
        },
      },
      role: {
        type: DataTypes.ENUM,
        values: ["CLIENT", "VENDOR", "ADMIN", "LIVREUR"], // Update these to match your existing enum
        defaultValue: "CLIENT",
        allowNull: false,
        field: "role",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "utilisateurs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          unique: true,
          fields: ["username"],
        },
        {
          fields: ["role"],
        },
      ],
    }
  );

  Utilisateur.associate = (models) => {
    Utilisateur.hasMany(models.Order, {
      foreignKey: "id_utilisateur",
      as: "orders",
    });
    Utilisateur.hasMany(models.Market, {
      foreignKey: "id_utilisateur",
      as: "markets",
    });
  };

  return Utilisateur;
};
