import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import EventMap from "./components/EventMap";
import EventForm from "./components/EventForm";
import FilterPanel from "./components/FilterPanel";
import EventList from "./components/EventList";
import ExternalEventsPanel from "./components/ExternalEventsPanel";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import {
  getEvents,
  deleteEvent,
  getExternalEvents,
  getMe,
  removeToken,
  updateEvent,
  getToken,
} from "./api/eventsApi";
import "./App.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL);

export default function App() {
  const [events, setEvents] = useState([]);
  const [externalEvents, setExternalEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const loadEvents = async () => {
    try {
      const data = await getEvents(selectedCategory);
      setEvents(data);
    } catch (error) {
      console.error("Помилка завантаження подій");
    }
  };

  const loadCurrentUser = async () => {
    try {
      if (!getToken()) return;

      const data = await getMe();
      setCurrentUser(data.user);
    } catch (error) {
      removeToken();
      setCurrentUser(null);
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

  const syncEventForCurrentFilter = (incomingEvent) => {
    setEvents((prev) => {
      const shouldShowEvent =
        selectedCategory === "all" ||
        incomingEvent.category === selectedCategory;

      if (!shouldShowEvent) {
        return prev.filter((event) => event._id !== incomingEvent._id);
      }

      const hasEvent = prev.some((event) => event._id === incomingEvent._id);

      if (hasEvent) {
        return prev.map((event) =>
          event._id === incomingEvent._id ? incomingEvent : event,
        );
      }

      return [incomingEvent, ...prev];
    });
  };

  const handleLoadExternalEvents = async (params) => {
    try {
      const data = await getExternalEvents(params);
      setExternalEvents(data);
    } catch (error) {
      console.error("Помилка завантаження зовнішніх подій");
    }
  };

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const handleNewEvent = (newEvent) => {
      syncEventForCurrentFilter(newEvent);
    };

    const handleDeletedEvent = (deletedId) => {
      setEvents((prev) => prev.filter((event) => event._id !== deletedId));
    };

    const handleUpdatedEvent = (updatedEvent) => {
      syncEventForCurrentFilter(updatedEvent);
    };

    socket.on("new-event", handleNewEvent);
    socket.on("delete-event", handleDeletedEvent);
    socket.on("update-event", handleUpdatedEvent);

    return () => {
      socket.off("new-event", handleNewEvent);
      socket.off("delete-event", handleDeletedEvent);
      socket.off("update-event", handleUpdatedEvent);
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

  const handleUpdate = async (id, updatedData) => {
    try {
      const updatedEvent = await updateEvent(id, updatedData);

      syncEventForCurrentFilter(updatedEvent);

      return updatedEvent;
    } catch (error) {
      console.error("Помилка редагування події");
      alert(error.response?.data?.message || "Не вдалося редагувати подію");
    }
  };
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Карта подій міста</h1>

        {currentUser ? (
          <div className="panel">
            <p>
              <strong>Користувач:</strong> {currentUser.name}
            </p>
            <p>{currentUser.email}</p>
            <button onClick={handleLogout}>Вийти</button>
          </div>
        ) : (
          <>
            <RegisterForm />
            <LoginForm onLogin={setCurrentUser} />
          </>
        )}

        <FilterPanel
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />

        <ExternalEventsPanel onLoad={handleLoadExternalEvents} />

        {currentUser && (
          <EventForm
            selectedLocation={selectedLocation}
            onEventCreated={syncEventForCurrentFilter}
          />
        )}

        <EventList
          events={allEvents}
          currentUser={currentUser}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </aside>

      <main className="content">
        <EventMap
          events={allEvents}
          onSelectLocation={currentUser ? setSelectedLocation : null}
        />
      </main>
    </div>
  );
}
