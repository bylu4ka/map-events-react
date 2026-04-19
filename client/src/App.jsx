import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import EventMap from "./components/EventMap";
import EventForm from "./components/EventForm";
import FilterPanel from "./components/FilterPanel";
import EventList from "./components/EventList";
import ExternalEventsPanel from "./components/ExternalEventsPanel";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import VerifySuccess from "./components/VerifySuccess";
import VerifyError from "./components/VerifyError";
import {
  getEvents,
  deleteEvent,
  getExternalEvents,
  getMe,
  removeToken,
  getToken,
} from "./api/eventsApi";
import "./App.css";

const socket = io("http://localhost:5000");

export default function App() {
  const [events, setEvents] = useState([]);
  const [externalEvents, setExternalEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  const path = window.location.pathname;

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

  if (path === "/verify-success") {
    return <VerifySuccess />;
  }

  if (path === "/verify-error") {
    return <VerifyError />;
  }

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

        {currentUser && <EventForm />}

        <EventList
          events={allEvents}
          onDelete={currentUser ? handleDelete : null}
        />
      </aside>

      <main className="content">
        <EventMap events={allEvents} />
      </main>
    </div>
  );
}
