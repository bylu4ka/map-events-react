import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function EventMap({ events }) {
  return (
    <div className="map-wrapper">
      <MapContainer center={[50.4501, 30.5234]} zoom={12} className="map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => (
          <Marker key={event._id} position={[event.lat, event.lng]}>
            <Popup>
              <div>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>
                  <strong>Категорія:</strong> {event.category}
                </p>
                <p>
                  <strong>Дата:</strong> {event.eventDate}
                </p>
                {event.venueName && (
                  <p>
                    <strong>Локація:</strong> {event.venueName}
                  </p>
                )}
                {event.url && (
                  <p>
                    <a href={event.url} target="_blank" rel="noreferrer">
                      Відкрити джерело
                    </a>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
