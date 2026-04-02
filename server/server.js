import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import eventRoutes from "./routes/events.js";
import externalEventsRoutes from "./routes/externalEvents.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes(io));
app.use("/api/external-events", externalEventsRoutes);

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
