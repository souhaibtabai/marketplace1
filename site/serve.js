import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const DIST_DIR = path.join(__dirname, "dist");

// Serve static files from the dist directory
app.use(express.static(DIST_DIR));

// SPA fallback: serve index.html for all non-file routes
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"), (err) => {
    if (err) {
      console.error("Failed to serve index.html:", err.message);
      res.status(500).send("Server error: unable to load application");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Site server running on port ${PORT}`);
}).on("error", (err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
