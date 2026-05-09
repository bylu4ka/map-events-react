import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function EventMap({ events, onSelectLocation }) {
  return (
    <MapContainer center={[50.4501, 30.5234]} zoom={12} className="map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {onSelectLocation && (
        <MapClickHandler onSelectLocation={onSelectLocation} />
      )}

      {events.map((event) => (
        <Marker key={event._id} position={[event.lat, event.lng]}>
          <Popup>
            <strong>{event.title}</strong>
            <br />
            {event.description}
            <br />
            {event.eventDate}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
