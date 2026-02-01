module.exports = (sequelize, DataTypes) => {
  const Categorie = sequelize.define(
    "Categorie",
    {
      id_categorie: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_categorie",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_parent: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "categories",
      timestamps: false,
    }
  );

  Categorie.associate = (models) => {
    Categorie.hasMany(models.Produit, {
      foreignKey: "id_categorie",
      as: "produits",
    });
    Categorie.belongsTo(models.Categorie, {
      foreignKey: "id_parent",
      as: "parent",
    });
    Categorie.hasMany(models.Categorie, {
      foreignKey: "id_parent",
      as: "children",
    });
  };

  return Categorie;
};
