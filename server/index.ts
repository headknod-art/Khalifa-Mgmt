import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import clientsRouter from "./clients.js";
import documentsRouter from "./documents.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);


  app.use(express.json());
  app.use("/api/clients", clientsRouter);

  // Documents API
  app.use("/api/documents", documentsRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Serve index.html for all non-API GET requests (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
