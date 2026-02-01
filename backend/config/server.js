const express = require("express");
const cors = require("cors");
const config = require("./environment");

function createServer() {
  const app = express();
  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      environment: config.server.env,
    });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Une erreur serveur est survenue",
      error: config.server.env === "development" ? err.message : {},
    });
  });

  return app;
}

module.exports = { createServer, config };
