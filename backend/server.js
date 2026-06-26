import dns from "dns";
import express from "express";
import dotenv from "dotenv";

// Force Node.js to use Google DNS (bypass ISP DNS that blocks MongoDB SRV)
dns.setServers(["8.8.8.8", "8.8.4.4"]);
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

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/stats", statsRoutes);

// ES Modules __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production Static Assets Handler
if (process.env.NODE_ENV === "production") {
  const frontendBuildPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendBuildPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Personal Finance Tracker API is running...");
  });
}

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
