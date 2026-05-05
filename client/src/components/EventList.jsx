import React, { useState } from "react";

const emptyEditForm = {
  title: "",
  description: "",
  category: "concert",
  lat: "",
  lng: "",
  eventDate: "",
};

export default function EventList({ events, currentUser, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const getCanManageEvent = (event) => {
    const isExternalEvent =
      event.source === "ticketmaster" || event._id?.startsWith("tm-");

    const currentUserId = currentUser?.id || currentUser?._id;
    const eventOwnerId = event.createdBy?._id || event.createdBy;

    const isOwner =
      currentUserId && String(eventOwnerId) === String(currentUserId);

    return (
      !isExternalEvent && (currentUser?.role === "admin" || Boolean(isOwner))
    );
  };

  const startEdit = (event) => {
    setEditingId(event._id);

    setEditForm({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "concert",
      lat: event.lat ?? "",
      lng: event.lng ?? "",
      eventDate: event.eventDate || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEditForm);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();

    if (!editForm.title.trim()) {
      alert("Вкажіть назву події");
      return;
    }

    if (!editForm.description.trim()) {
      alert("Вкажіть опис події");
      return;
    }

    if (!editForm.eventDate) {
      alert("Вкажіть дату події");
      return;
    }

    if (editForm.lat === "" || editForm.lng === "") {
      alert("Вкажіть координати події");
      return;
    }

    const updatedEvent = await onUpdate(id, {
      ...editForm,
      lat: Number(editForm.lat),
      lng: Number(editForm.lng),
    });

    if (updatedEvent) {
      cancelEdit();
    }
  };

  return (
    <div className="panel">
      <h3>Список подій</h3>

      {events.length === 0 ? (
        <p>Подій поки немає</p>
      ) : (
        <div className="event-list">
          {events.map((event) => {
            const canManage = getCanManageEvent(event);
            const isEditing = editingId === event._id;

            return (
              <div key={event._id} className="event-card">
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="event-card-image"
                  />
                )}

                {isEditing ? (
                  <form
                    className="form"
                    onSubmit={(e) => handleEditSubmit(e, event._id)}
                  >
                    <input
                      name="title"
                      placeholder="Назва події"
                      value={editForm.title}
                      onChange={handleEditChange}
                    />

                    <textarea
                      name="description"
                      placeholder="Опис події"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />

                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                    >
                      <option value="accident">ДТП</option>
                      <option value="alert">Попередження</option>
                      <option value="concert">Концерт</option>
                      <option value="sport">Спорт</option>
                      <option value="festival">Фестиваль</option>
                      <option value="other">Інше</option>
                    </select>

                    <input
                      name="lat"
                      placeholder="Широта"
                      value={editForm.lat}
                      onChange={handleEditChange}
                    />

                    <input
                      name="lng"
                      placeholder="Довгота"
                      value={editForm.lng}
                      onChange={handleEditChange}
                    />

                    <input
                      type="date"
                      name="eventDate"
                      value={editForm.eventDate}
                      onChange={handleEditChange}
                    />

                    <button type="submit">Зберегти</button>

                    <button type="button" onClick={cancelEdit}>
                      Скасувати
                    </button>
                  </form>
                ) : (
                  <>
                    <h4>{event.title}</h4>

                    <p>{event.description}</p>

                    <p>
                      <strong>Категорія:</strong> {event.category}
                    </p>

                    <p>
                      <strong>Дата:</strong> {event.eventDate}
                    </p>

                    {event.createdBy?.name && (
                      <p>
                        <strong>Автор:</strong> {event.createdBy.name}
                      </p>
                    )}

                    {event.source === "ticketmaster" && (
                      <p>
                        <strong>Джерело:</strong> Ticketmaster
                      </p>
                    )}

                    {event.url && (
                      <a href={event.url} target="_blank" rel="noreferrer">
                        Детальніше
                      </a>
                    )}

                    {canManage && (
                      <div className="event-actions">
                        <button type="button" onClick={() => startEdit(event)}>
                          Редагувати
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(event._id)}
                        >
                          Видалити
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
