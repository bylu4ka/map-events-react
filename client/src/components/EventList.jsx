import React from "react";

export default function EventList({ events, onDelete }) {
  return (
    <div className="panel">
      <h3>Список подій</h3>

      {events.length === 0 ? (
        <p>Подій поки немає</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h4>{event.title}</h4>
              <p>{event.description}</p>
              <p>
                <strong>Категорія:</strong> {event.category}
              </p>
              <p>
                <strong>Дата:</strong> {event.eventDate}
              </p>
              {event.source === "ticketmaster" && (
                <p>
                  <strong>Джерело:</strong> Ticketmaster
                </p>
              )}

              {event.source !== "ticketmaster" && (
                <button
                  className="delete-btn"
                  onClick={() => onDelete(event._id)}
                >
                  Видалити
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
