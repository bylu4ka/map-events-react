import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getEvents = async (category = "all") => {
  const response = await api.get(`/events?category=${category}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post("/events", eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

export const getExternalEvents = async (params = {}) => {
  const response = await api.get("/external-events", { params });
  return response.data;
};
