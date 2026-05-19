import express from "express";
import axios from "axios";

const router = express.Router();
const cache = new Map();
const pendingRequests = new Map();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_CACHE_TTL_MS = 60 * 1000;
const NOMINATIM_REQUEST_INTERVAL_MS = 1200;
const MIN_QUERY_LENGTH = 5;

let lastNominatimRequestAt = 0;
let nominatimQueue = Promise.resolve();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCachedData(cacheKey) {
  const cachedResult = cache.get(cacheKey);

  if (!cachedResult) {
    return undefined;
  }

  if (Date.now() - cachedResult.timestamp > cachedResult.ttl) {
    cache.delete(cacheKey);
    return undefined;
  }

  return cachedResult.data;
}

function setCachedData(cacheKey, data, ttl = CACHE_TTL_MS) {
  cache.set(cacheKey, {
    data,
    ttl,
    timestamp: Date.now(),
  });
}

async function runWithNominatimRateLimit(requestFn) {
  const run = async () => {
    const elapsed = Date.now() - lastNominatimRequestAt;
    const delay = Math.max(0, NOMINATIM_REQUEST_INTERVAL_MS - elapsed);

    if (delay > 0) {
      await wait(delay);
    }

    lastNominatimRequestAt = Date.now();
    return requestFn();
  };

  const resultPromise = nominatimQueue.then(run, run);
  nominatimQueue = resultPromise.catch(() => {});

  return resultPromise;
}

router.get("/", async (req, res) => {
  const query = String(req.query.q || "").trim();
  const limit = Math.min(Number(req.query.limit) || 5, 10);

  if (query.length < MIN_QUERY_LENGTH) {
    return res.json([]);
  }

  const cacheKey = `${query.toLowerCase()}:${limit}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData !== undefined) {
    return res.json(cachedData);
  }

  if (pendingRequests.has(cacheKey)) {
    const data = await pendingRequests.get(cacheKey);
    return res.json(data);
  }

  const requestPromise = runWithNominatimRateLimit(async () => {
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
          "User-Agent": "city-events-map/1.0 (contact: admin@example.com)",
          "Accept-Language": "uk,en",
        },
        timeout: 8000,
      },
    );

    return response.data;
  });

  pendingRequests.set(cacheKey, requestPromise);

  try {
    const data = await requestPromise;
    setCachedData(cacheKey, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;

    if (status === 429) {
      setCachedData(cacheKey, [], RATE_LIMIT_CACHE_TTL_MS);
      return res.json([]);
    }

    console.error("GEOCODE ERROR:", error.message);
    res.status(500).json({
      message: "Не вдалося знайти адресу",
    });
  } finally {
    pendingRequests.delete(cacheKey);
  }
});

export default router;
