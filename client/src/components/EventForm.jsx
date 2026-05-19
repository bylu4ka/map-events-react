import React, { useEffect, useState } from "react";
import { createEvent, searchAddresses } from "../api/eventsApi";

export default function EventForm({ selectedLocation, onEventCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "concert",
    address: "",
    lat: "",
    lng: "",
    eventDate: "",
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isAddressSearchEnabled, setIsAddressSearchEnabled] = useState(true);

  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      }));
    }
  }, [selectedLocation]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const value = formData.address.trim();

    if (!isAddressSearchEnabled) {
      return;
    }

    if (value.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchAddresses(value, 5);
        setAddressSuggestions(data);
      } catch (error) {
        console.error("Помилка пошуку адреси", error);
        setAddressSuggestions([]);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.address, isAddressSearchEnabled]);

  const handleAddressChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      address: value,
    }));

    setIsAddressSearchEnabled(true);
  };

  const handleSelectAddress = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lon,
    }));

    setIsAddressSearchEnabled(false);
    setAddressSuggestions([]);
  };

  const findAddressCoordinates = async () => {
    if (!formData.address.trim()) return;

    try {
      const data = await searchAddresses(formData.address, 1);

      if (data.length === 0) {
        alert("Адресу не знайдено");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        lat: data[0].lat,
        lng: data[0].lon,
      }));
    } catch (error) {
      console.error("Помилка пошуку координат", error);
      alert("Не вдалося знайти координати");
    }
  };
  const [image, setImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // base64
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Вкажіть назву події");
      return;
    }

    if (!formData.description.trim()) {
      alert("Вкажіть опис події");
      return;
    }

    if (!formData.eventDate) {
      alert("Вкажіть дату події");
      return;
    }

    if (formData.lat === "" || formData.lng === "") {
      alert("Вкажіть координати або виберіть місце на карті");
      return;
    }

    try {
      const createdEvent = await createEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        eventDate: formData.eventDate,
        image, // 🔥 ДОДАЛИ
      });

      onEventCreated?.(createdEvent);

      setFormData({
        title: "",
        description: "",
        category: "concert",
        address: "",
        lat: "",
        lng: "",
        eventDate: "",
      });

      setImage(null); // 🔥 очистка
      setAddressSuggestions([]);
    } catch (error) {
      console.error("Помилка створення події", error);
      alert(error.response?.data?.message || "Не вдалося створити подію");
    }
  };

  return (
    <div className="panel">
      <h3>Додати подію</h3>

      <form className="form" onSubmit={handleSubmit}>
        <input
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

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="concert">Концерт</option>
          <option value="sport">Спорт</option>
          <option value="festival">Фестиваль</option>
          <option value="accident">ДТП</option>
          <option value="alert">Попередження</option>
          <option value="other">Інше</option>
        </select>

        <div className="address-field">
          <input
            name="address"
            placeholder="Почніть вводити адресу"
            value={formData.address}
            onChange={handleAddressChange}
          />

          {addressSuggestions.length > 0 && (
            <div className="address-suggestions">
              {addressSuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.place_id}
                  className="address-suggestion"
                  onClick={() => handleSelectAddress(suggestion)}
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={findAddressCoordinates}>
          Знайти координати за адресою
        </button>

        <input
          name="lat"
          placeholder="Широта"
          value={formData.lat}
          onChange={handleChange}
        />

        <input
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
        {/* <input type="file" onChange={handleImage} /> */}
        <button type="submit">Додати</button>
      </form>
    </div>
  );
}
