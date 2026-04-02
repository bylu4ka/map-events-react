import express from "express";
import Event from "../models/Event.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function eventRoutes(io) {
  router.get("/", async (req, res) => {
    try {
      const { category } = req.query;

      const filter = {};
      if (category && category !== "all") {
        filter.category = category;
      }

      const events = await Event.find(filter).sort({ createdAt: -1 });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Помилка при отриманні подій" });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { title, description, category, lat, lng, eventDate } = req.body;

      if (!title || !description || !category || !lat || !lng || !eventDate) {
        return res.status(400).json({ message: "Заповніть усі поля" });
      }

      const newEvent = await Event.create({
        title,
        description,
        category,
        lat,
        lng,
        eventDate,
      });

      io.emit("new-event", newEvent);

      res.status(201).json(newEvent);
    } catch (error) {
      res.status(500).json({ message: "Помилка при створенні події" });
    }
  });

  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);

      if (!deletedEvent) {
        return res.status(404).json({ message: "Подію не знайдено" });
      }

      io.emit("delete-event", deletedEvent._id);

      res.json({ message: "Подію видалено", id: deletedEvent._id });
    } catch (error) {
      res.status(500).json({ message: "Помилка при видаленні події" });
    }
  });

  return router;
}
