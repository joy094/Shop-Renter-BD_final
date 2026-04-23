import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { seedIfEmpty } from "./lib/seed.js";
import authRoutes from "./routes/auth.js";
import tenantRoutes from "./routes/tenants.js";
import shopRoutes from "./routes/shops.js";
import paymentRoutes from "./routes/payments.js";
import dashboardRoutes from "./routes/dashboard.js";
import reportRoutes from "./routes/reports.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = parseInt(process.env.PORT || "8080", 10);

(async () => {
  await connectDB();
  await seedIfEmpty();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server listening on :${PORT}`);
  });
})();
