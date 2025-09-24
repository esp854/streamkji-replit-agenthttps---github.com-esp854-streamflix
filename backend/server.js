import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.js";
import notificationsRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";
import tmdbRoutes from "./routes/tmdb.js";
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

// Simple CSRF token endpoint for client
app.get("/api/csrf-token", (req, res) => {
  // In real world use proper CSRF protection. Here we just return a static token for demo.
  res.json({ csrfToken: "static-demo-token" });
});

app.use("/api", paymentRoutes);
app.use("/api", notificationsRoutes);
app.use("/api", adminRoutes);
app.use("/api", tmdbRoutes);
app.use("/api", authRoutes);

// Use PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur backend en écoute sur le port ${PORT}`);
  console.log(`TMDB API Key configured: ${!!process.env.TMDB_API_KEY}`);
});