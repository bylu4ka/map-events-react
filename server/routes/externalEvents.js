import express from "express";
import axios from "axios";

const router = express.Router();

function mapTicketmasterEvent(tmEvent) {
  const venue = tmEvent?._embedded?.venues?.[0];
  const latitude = venue?.location?.latitude;
  const longitude = venue?.location?.longitude;

  if (!latitude || !longitude) {
    return null;
  }

  return {
    _id: `tm-${tmEvent.id}`,
    source: "ticketmaster",
    externalId: tmEvent.id,
    title: tmEvent.name || "Без назви",
    description:
      tmEvent.info ||
      tmEvent.pleaseNote ||
      venue?.name ||
      "Зовнішня подія з Ticketmaster",
    category: normalizeCategory(tmEvent),
    lat: Number(latitude),
    lng: Number(longitude),
    eventDate:
      tmEvent?.dates?.start?.localDate ||
      tmEvent?.dates?.start?.dateTime?.slice(0, 10) ||
      "",
    venueName: venue?.name || "",
    city: venue?.city?.name || "",
    address: venue?.address?.line1 || "",
    url: tmEvent?.url || "",
  };
}

function normalizeCategory(tmEvent) {
  const classification =
    tmEvent?.classifications?.[0]?.segment?.name?.toLowerCase() || "";

  if (classification.includes("music")) return "concert";
  if (classification.includes("sports")) return "sport";
  if (classification.includes("arts")) return "festival";
  if (classification.includes("film")) return "other";
  return "other";
}

router.get("/", async (req, res) => {
  try {
    const {
      keyword = "events",
      city,
      countryCode,
      size = 20,
      classificationName,
      startDateTime,
      radius = 25,
      unit = "km",
    } = req.query;

    const apiKey = process.env.TICKETMASTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Не задано TICKETMASTER_API_KEY у .env",
      });
    }

    const params = {
      apikey: apiKey,
      keyword,
      size,
      radius,
      unit,
      sort: "date,asc",
      locale: "*",
    };

    if (city) params.city = city;
    if (countryCode) params.countryCode = countryCode;
    if (classificationName) params.classificationName = classificationName;
    if (startDateTime) params.startDateTime = startDateTime;

    const response = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      { params },
    );

    const rawEvents = response.data?._embedded?.events || [];
    const mappedEvents = rawEvents.map(mapTicketmasterEvent).filter(Boolean);

    res.json(mappedEvents);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.fault?.faultstring ||
      "Помилка при завантаженні зовнішніх подій";

    res.status(status).json({ message });
  }
});

export default router;
