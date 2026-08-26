import dns from "dns";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/accounts.js";
import categoryRoutes from "./routes/categories.js";
import transactionRoutes from "./routes/transactions.js";
import statsRoutes from "./routes/stats.js";
import captureRoutes from "./routes/capture.js";

dotenv.config();

// Bypass ISP DNS for MongoDB SRV in local dev only
if (process.env.NODE_ENV !== "production") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    // Ignore in restricted environments
  }
}

// Initial connection
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes
app.use("/api/users", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/capture", captureRoutes);

// Root / Health check route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SALDO Finance Tracker API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// ES Modules __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Only listen locally (Vercel Serverless manages execution via export default app)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
}

export default app;
