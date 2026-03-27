import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { getEnv } from "./config/env";
import { createApp } from "./app";

const env = getEnv();
const app = createApp();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "public");

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    return res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(env.PORT, () => {
  console.log(`Wishpool API listening on port ${env.PORT}`);
});
