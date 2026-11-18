import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { attachSocket } from "./config/socket.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";

const isVercel = Boolean(process.env.VERCEL);

const app = express();

// Vercel sits behind a proxy; needed for rate limiting and correct client IPs
app.set("trust proxy", 1);

const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((x) => x.trim().replace(/\/$/, ""));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin(o, cb) {
      if (!o || origins.includes(o)) return cb(null, true);
      const err = new Error("Origin not allowed");
      err.statusCode = 403;
      cb(err);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(morgan(isVercel ? "tiny" : "dev"));

// Real-time: Socket.io needs a long-running server, which Vercel does not provide.
// On Vercel we plug in a no-op so controllers calling io.to(...).emit(...) keep working.
const noopIo = { to: () => ({ emit() {} }), emit() {} };

let server = null;
if (isVercel) {
  app.set("io", noopIo);
} else {
  server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: origins, methods: ["GET", "POST"], credentials: true },
  });
  attachSocket(io);
  app.set("io", io);
}

app.get("/", (req, res) => {
  res.json({ success: true, message: "EventSphere API is running" });
});

// Make sure the DB is connected before any /api request (serverless-safe)
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    res
      .status(503)
      .json({ success: false, message: "Database unavailable" });
  }
});

app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", profileRoutes);

app.use(
  "/api/v1",
  eventRoutes,
  bookingRoutes,
  checkinRoutes,
  notificationRoutes,
  adminRoutes,
  organizerRoutes,
);

app.use(notFound);
app.use(errorHandler);

// Local development only
if (!isVercel) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() =>
      server.listen(PORT, () =>
        console.log(`EventSphere API listening on ${PORT}`),
      ),
    )
    .catch((error) => {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    });
}

export default app;
