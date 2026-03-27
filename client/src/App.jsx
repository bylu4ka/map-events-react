import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import EventMap from "./components/EventMap";
import EventForm from "./components/EventForm";
import FilterPanel from "./components/FilterPanel";
import EventList from "./components/EventList";
import ExternalEventsPanel from "./components/ExternalEventsPanel";
import { getEvents, deleteEvent, getExternalEvents } from "./api/eventsApi";
import "./App.css";

const socket = io("http://localhost:5000");

export default function App() {
  const [events, setEvents] = useState([]);
  const [externalEvents, setExternalEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadEvents = async () => {
    try {
      const data = await getEvents(selectedCategory);
      setEvents(data);
    } catch (error) {
      console.error("Помилка завантаження подій");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch (error) {
      console.error("Помилка видалення події");
    }
  };

  const handleLoadExternalEvents = async (params) => {
    try {
      const data = await getExternalEvents(params);
      setExternalEvents(data);
    } catch (error) {
      console.error("Помилка завантаження зовнішніх подій");
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  useEffect(() => {
    socket.on("new-event", (newEvent) => {
      if (
        selectedCategory === "all" ||
        selectedCategory === newEvent.category
      ) {
        setEvents((prev) => [newEvent, ...prev]);
      }
    });

    socket.on("delete-event", (deletedId) => {
      setEvents((prev) => prev.filter((event) => event._id !== deletedId));
    });

    return () => {
      socket.off("new-event");
      socket.off("delete-event");
    };
  }, [selectedCategory]);

  const filteredExternalEvents = useMemo(() => {
    if (selectedCategory === "all") return externalEvents;
    return externalEvents.filter(
      (event) => event.category === selectedCategory,
    );
  }, [externalEvents, selectedCategory]);

  const allEvents = useMemo(() => {
    return [...events, ...filteredExternalEvents];
  }, [events, filteredExternalEvents]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Карта подій міста</h1>

        <FilterPanel
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />

        <ExternalEventsPanel onLoad={handleLoadExternalEvents} />

        <EventForm />

        <EventList events={allEvents} onDelete={handleDelete} />
      </aside>

      <main className="content">
        <EventMap events={allEvents} />
      </main>
    </div>
  );
}
