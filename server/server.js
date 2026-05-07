import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import eventRoutes from "./routes/events.js";
import externalEventsRoutes from "./routes/externalEvents.js";
import authRoutes from "./routes/auth.js";
import geocodeRoutes from "./routes/geocode.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

function parseOrigins(value) {
  return value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
}

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.CLIENT_URLS),
  "http://localhost:5173",
  "http://localhost:5174",
].filter(
  (origin, index, origins) => origin && origins.indexOf(origin) === index,
);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  const allowVercelPreviews =
    process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === "true";

  return (
    allowVercelPreviews &&
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
  );
}

const corsOptions = {
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes(io));
app.use("/api/external-events", externalEventsRoutes);
app.use("/api/geocode", geocodeRoutes);

io.on("connection", (socket) => {
  console.log("Користувач підключився:", socket.id);

  socket.on("disconnect", () => {
    console.log("Користувач відключився:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB підключено");
    server.listen(PORT, () => {
      console.log(`Сервер запущено на порту ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Помилка підключення до MongoDB:", error.message);
  });
