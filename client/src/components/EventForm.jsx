import React from "react";
import { useState } from "react";
import { createEvent } from "../api/eventsApi";

export default function EventForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "concert",
    lat: "",
    lng: "",
    eventDate: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createEvent({
        ...formData,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      });

      setMessage("Подію успішно додано");

      setFormData({
        title: "",
        description: "",
        category: "concert",
        lat: "",
        lng: "",
        eventDate: "",
      });
    } catch (error) {
      setMessage("Не вдалося додати подію");
    }
  };

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h3>Додати подію</h3>

      <input
        type="text"
        name="title"
        placeholder="Назва події"
        value={formData.title}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Опис події"
        value={formData.description}
        onChange={handleChange}
      />

      <select name="category" value={formData.category} onChange={handleChange}>
        <option value="concert">Концерт</option>
        <option value="festival">Фестиваль</option>
        <option value="accident">ДТП</option>
        <option value="alert">Попередження</option>
        <option value="sport">Спорт</option>
        <option value="other">Інше</option>
      </select>

      <input
        type="number"
        step="any"
        name="lat"
        placeholder="Широта"
        value={formData.lat}
        onChange={handleChange}
      />

      <input
        type="number"
        step="any"
        name="lng"
        placeholder="Довгота"
        value={formData.lng}
        onChange={handleChange}
      />

      <input
        type="date"
        name="eventDate"
        value={formData.eventDate}
        onChange={handleChange}
      />

      <button type="submit">Додати</button>

      {message && <p className="message">{message}</p>}
    </form>
  );
}
