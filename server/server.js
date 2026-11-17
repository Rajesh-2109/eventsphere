import "dotenv/config";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((x) => x.trim());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin(o, cb) {
      if (!o || origins.includes(o)) {
        return cb(null, true);
      }
      cb(new Error("Origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(morgan("dev"));

app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authLimiter);

app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")),
);

const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

attachSocket(io);
app.set("io", io);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventSphere API is running",
  });
});

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

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`EventSphere API listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
