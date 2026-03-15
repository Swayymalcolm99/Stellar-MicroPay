/**
 * src/server.js
 * Express server entry point for Stellar MicroPay backend.
 */

"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const accountRoutes = require("./routes/accounts");
const paymentRoutes = require("./routes/payments");
const healthRoutes = require("./routes/health");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/health", healthRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ✨ Stellar MicroPay API
  🚀 Server running at http://localhost:${PORT}
  🌐 Network: ${process.env.STELLAR_NETWORK || "testnet"}
  `);
});

module.exports = app;
