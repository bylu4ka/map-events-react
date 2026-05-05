import express from "express";
import axios from "axios";

const router = express.Router();
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

router.get("/", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit) || 5, 10);

    if (query.length < 3) {
      return res.json([]);
    }

    const cacheKey = `${query.toLowerCase()}:${limit}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL_MS) {
      return res.json(cachedResult.data);
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          format: "json",
          addressdetails: 1,
          limit,
          q: query,
        },
        headers: {
          "User-Agent": "city-events-map/1.0",
          "Accept-Language": "uk,en",
        },
      },
    );

    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;

    res.status(status).json({
      message:
        status === 429
          ? "Забагато запитів до сервісу адрес. Спробуйте ще раз трохи пізніше."
          : "Не вдалося знайти адресу",
    });
  }
});

export default router;
