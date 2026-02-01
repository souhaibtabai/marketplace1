module.exports = (sequelize, DataTypes) => {
  const Market = sequelize.define(
    "Market",
    {
      id_market: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_market",
      },
      id_utilisateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "market",
      timestamps: false,
    }
  );

  Market.associate = (models) => {
    Market.belongsTo(models.Utilisateur, {
      foreignKey: "id_utilisateur",
    });
    Market.hasMany(models.Produit, {
      foreignKey: "id_market",
    });
  };

  return Market;
};
