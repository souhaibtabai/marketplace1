module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define(
    "cart",
    {
      id_cart: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_utilisateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_produit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      tableName: "cart",
      timestamps: false,
    }
  );

  cart.associate = (models) => {
    cart.belongsTo(models.Utilisateur, { foreignKey: "id_utilisateur" });
    cart.belongsTo(models.Produit, { foreignKey: "id_produit" });
  };

  return cart;
};
