import "dotenv/config"; // Must be first to ensure process.env is populated before router imports
import express from "express";
import cors from "cors";

// Import route modules
import adminUsersRouter from "./routes/admin-users";
import borderCheckRouter from "./routes/border-check";
import notificationsRouter from "./routes/notifications";
import phoneVerificationRouter from "./routes/phone-verification";
import aiChatRouter from "./routes/ai-chat";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middlewares - Production-Ready CORS for Vercel and Localhost
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ];

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      // Allow for preview deployments
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.options("*", cors()); // Enable preflight for all routes
app.use(express.json());

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "SL Immigration Backend API is running",
    frontendUrl: FRONTEND_URL,
    status: "online",
    endpoints: [
      "GET  /health",
      "POST /api/ai/chat",
      "POST /api/admin/invite-staff",
      "PATCH /api/admin/users/:userId",
      "POST /api/border/assess",
      "POST /api/border/finalize",
      "POST /api/notifications/visa-decision",
      "POST /api/notifications/payment-received",
      "POST /api/auth/send-phone-otp",
      "POST /api/auth/verify-phone-otp",
    ],
  });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register routers
app.use(adminUsersRouter);
app.use(borderCheckRouter);
app.use(notificationsRouter);
app.use(phoneVerificationRouter);
app.use(aiChatRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SL Immigration Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS allowed for: ${FRONTEND_URL}`);
});

export default app;
