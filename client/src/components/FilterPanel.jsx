import React from "react";

export default function FilterPanel({ selectedCategory, onChangeCategory }) {
  return (
    <div className="panel">
      <h3>Фільтр подій</h3>

      <select
        value={selectedCategory}
        onChange={(e) => onChangeCategory(e.target.value)}
      >
        <option value="all">Усі події</option>
        <option value="concert">Концерти</option>
        <option value="festival">Фестивалі</option>
        <option value="accident">ДТП</option>
        <option value="alert">Попередження</option>
        <option value="sport">Спорт</option>
        <option value="other">Інше</option>
      </select>
    </div>
  );
}
