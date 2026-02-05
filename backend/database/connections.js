const { Sequelize } = require("sequelize");
const config = require("../config/environment");
const fs = require("fs");
const path = require("path");

class Database {
  constructor() {
    this.sequelize = new Sequelize(
      config.database.database,
      config.database.username,
      config.database.password,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: "postgres",
        logging: config.database.logging,
        pool: config.database.pool,
        define: {
          timestamps: true,
          underscored: true,
        },
        timezone: "+01:00",
      }
    );

    this.models = {};
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log(" Connexion à la base de données réussie");
      return this.sequelize;
    } catch (error) {
      console.error(" Erreur de connexion à la base de données:", error);
      process.exit(1);
    }
  }

  async loadModels() {
    const modelsPath = path.join(__dirname, "..", "models");

    const modelFiles = fs
      .readdirSync(modelsPath)
      .filter((file) => file.endsWith(".js") && file !== "index.js");

    for (const file of modelFiles) {
      const modelPath = path.join(modelsPath, file);
      const model = require(modelPath)(this.sequelize);
      this.models[model.name] = model;
    }

    Object.keys(this.models).forEach((modelName) => {
      if (this.models[modelName].associate) {
        this.models[modelName].associate(this.models);
      }
    });
  }

  async sync(force = false) {
    try {
      await this.loadModels();
      await this.sequelize.sync({ force });
      console.log(" Modèles synchronisés avec succès");
    } catch (error) {
      console.error(" Erreur de synchronisation des modèles:", error);
    }
  }

  getModel(modelName) {
    return this.models[modelName];
  }

  async close() {
    await this.sequelize.close();
    console.log(" Connexion à la base de données fermée");
  }
}

module.exports = new Database();
