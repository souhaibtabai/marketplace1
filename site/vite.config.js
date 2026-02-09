import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { writeFileSync, readFileSync } from "fs";

// Plugin to copy index.html as 200.html for SPA fallback on static hosting (Render, Surge, etc.)
const spaFallbackPlugin = () => ({
  name: "spa-fallback",
  closeBundle() {
    try {
      const distDir = resolve("dist");
      const indexContent = readFileSync(resolve(distDir, "index.html"), "utf-8");
      writeFileSync(resolve(distDir, "200.html"), indexContent);
    } catch (err) {
      console.warn("SPA fallback plugin: Could not create 200.html -", err.message);
    }
  },
});

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [
          [
            "@locator/babel-jsx/dist",
            {
              env: "development",
            },
          ],
        ],
      },
    }),
    spaFallbackPlugin(),
  ],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000", // Your backend server
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
});
