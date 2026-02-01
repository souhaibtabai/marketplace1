module.exports = (sequelize, DataTypes) => {
  const Produit = sequelize.define(
    "Produit",
    {
      id_produit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      id_market: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_categorie: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "produits",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Produit.associate = (models) => {
    Produit.belongsTo(models.Market, { foreignKey: "id_market" });
    Produit.belongsTo(models.Categorie, { foreignKey: "id_categorie" });
    Produit.hasMany(models.Order, { foreignKey: "id_produit" });
    Produit.hasMany(models.cart, { foreignKey: "id_produit" });
  };

  return Produit;
};
