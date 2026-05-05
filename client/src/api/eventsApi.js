import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const getEvents = async (category = "all") => {
  const response = await api.get(`/events?category=${category}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const token = getToken();

  const response = await api.post("/events", eventData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteEvent = async (id) => {
  const token = getToken();

  const response = await api.delete(`/events/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getExternalEvents = async (params = {}) => {
  const response = await api.get("/external-events", { params });
  return response.data;
};

export const searchAddresses = async (query, limit = 5) => {
  const response = await api.get("/geocode", {
    params: {
      q: query,
      limit,
    },
  });

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getMe = async () => {
  const token = getToken();

  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const token = getToken();

  const response = await api.put(`/events/${id}`, eventData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
