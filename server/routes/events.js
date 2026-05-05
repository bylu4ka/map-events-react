import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadImage } from "../utils/uploadImage.js";

const router = express.Router();

const EVENT_CATEGORIES = [
  "concert",
  "festival",
  "accident",
  "alert",
  "sport",
  "other",
];

function isValidEventId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getOwnerId(event) {
  return event.createdBy?._id || event.createdBy;
}

function canManageEvent(event, user) {
  const ownerId = getOwnerId(event);
  const isOwner = ownerId && String(ownerId) === String(user.userId);

  return user.role === "admin" || Boolean(isOwner);
}

function parseCoordinate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export default function eventRoutes(io) {
  router.get("/", async (req, res) => {
    try {
      const { category } = req.query;

      const filter = {};
      if (category && category !== "all") {
        filter.category = category;
      }

      const events = await Event.find(filter)
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });

      res.json(events);
    } catch (error) {
      console.error("EVENTS GET ERROR:", error);
      res.status(500).json({ message: "Помилка при отриманні подій" });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { title, description, category, lat, lng, eventDate, image } =
        req.body;

      const parsedLat = parseCoordinate(lat);
      const parsedLng = parseCoordinate(lng);

      if (
        !title?.trim() ||
        !description?.trim() ||
        !eventDate ||
        !EVENT_CATEGORIES.includes(category) ||
        parsedLat === null ||
        parsedLng === null
      ) {
        return res.status(400).json({ message: "Заповніть усі поля коректно" });
      }

      let imageUrl = "";

      if (image) {
        imageUrl = await uploadImage(image);
      }

      const newEvent = await Event.create({
        title: title.trim(),
        description: description.trim(),
        category,
        lat: parsedLat,
        lng: parsedLng,
        eventDate,
        createdBy: req.user.userId,
        image: imageUrl,
      });

      const createdEvent = await newEvent.populate(
        "createdBy",
        "name email role",
      );

      io.emit("new-event", createdEvent);

      res.status(201).json(createdEvent);
    } catch (error) {
      console.error("EVENT CREATE ERROR:", error);
      res.status(500).json({ message: "Помилка створення події" });
    }
  });

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      if (!isValidEventId(req.params.id)) {
        return res.status(404).json({ message: "Подію не знайдено" });
      }

      const { title, description, category, lat, lng, eventDate } = req.body;

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Подію не знайдено" });
      }

      if (!canManageEvent(event, req.user)) {
        return res.status(403).json({
          message: "Ви можете редагувати тільки свої події",
        });
      }

      if (title !== undefined) {
        if (!title.trim()) {
          return res.status(400).json({ message: "Вкажіть назву події" });
        }

        event.title = title.trim();
      }

      if (description !== undefined) {
        if (!description.trim()) {
          return res.status(400).json({ message: "Вкажіть опис події" });
        }

        event.description = description.trim();
      }

      if (category !== undefined) {
        if (!EVENT_CATEGORIES.includes(category)) {
          return res.status(400).json({ message: "Некоректна категорія" });
        }

        event.category = category;
      }

      if (lat !== undefined) {
        const parsedLat = parseCoordinate(lat);

        if (parsedLat === null) {
          return res.status(400).json({ message: "Некоректна широта" });
        }

        event.lat = parsedLat;
      }

      if (lng !== undefined) {
        const parsedLng = parseCoordinate(lng);

        if (parsedLng === null) {
          return res.status(400).json({ message: "Некоректна довгота" });
        }

        event.lng = parsedLng;
      }

      if (eventDate !== undefined) {
        if (!eventDate) {
          return res.status(400).json({ message: "Вкажіть дату події" });
        }

        event.eventDate = eventDate;
      }

      await event.save();

      const updatedEvent = await event.populate("createdBy", "name email role");

      io.emit("update-event", updatedEvent);

      res.json(updatedEvent);
    } catch (error) {
      console.error("EVENT UPDATE ERROR:", error);
      res.status(500).json({ message: "Помилка при редагуванні події" });
    }
  });

  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      if (!isValidEventId(req.params.id)) {
        return res.status(404).json({ message: "Подію не знайдено" });
      }

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Подію не знайдено" });
      }

      if (!canManageEvent(event, req.user)) {
        return res.status(403).json({
          message: "Ви можете видаляти тільки свої події",
        });
      }

      await Event.findByIdAndDelete(req.params.id);

      io.emit("delete-event", req.params.id);

      res.json({
        message: "Подію видалено",
        id: req.params.id,
      });
    } catch (error) {
      console.error("EVENT DELETE ERROR:", error);
      res.status(500).json({ message: "Помилка при видаленні події" });
    }
  });

  return router;
}
