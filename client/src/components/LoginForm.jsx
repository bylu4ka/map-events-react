import React, { useState } from "react";
import { loginUser, setToken } from "../api/eventsApi";

export default function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const data = await loginUser(formData);
      setToken(data.token);
      onLogin(data.user);

      setFormData({
        email: "",
        password: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Помилка входу");
    }
  };

  return (
    <div className="panel">
      <h3>Вхід</h3>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">Увійти</button>
      </form>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
