import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Plus, Trash2 } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showInput, setShowInput] = useState(false);
  const [newEvent, setNewEvent] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dateKey = date.toISOString().split("T")[0];

  useEffect(() => {
    setMounted(true);
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      const defaultEvents = {
        "2025-08-30": [{ title: "Trip to Bengaluru" }],
        "2025-08-31": [{ title: "Cloudburst Alert" }],
      };
      setEvents(defaultEvents);
      localStorage.setItem("calendarEvents", JSON.stringify(defaultEvents));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    }
  }, [events, mounted]);

  const handleSaveEvent = () => {
    if (!newEvent.trim()) return;
    setEvents((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey] ? [...prev[dateKey], { title: newEvent }] : [{ title: newEvent }],
    }));
    setNewEvent("");
    setShowInput(false);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const deleteEvent = () => {
    setEvents((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, idx) => idx !== deleteIndex),
    }));
    setShowConfirm(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteIndex(null);
  };

  if (!mounted) return null;

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div
  className={`min-h-screen p-6 rounded-2xl overflow-hidden ${
    isDark ? "bg-gray-900 text-gray-100" : "bg-slate-50 text-gray-900"
  }`}
>

      <div className="max-w-4xl mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Calendar</h1>

        <div className={`p-4 shadow-md rounded-2xl ${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {date.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => setShowInput(true)}
              className={`flex items-center gap-2 px-4 py-2 transition shadow rounded-xl hover:scale-105 ${
                isDark ? "bg-gray-700 text-gray-100" : "bg-white text-black"
              }`}
            >
              <Plus size={16} /> Add Event
            </button>
          </div>

          <Calendar
            onChange={setDate}
            value={date}
            className={`overflow-hidden rounded-xl ${isDark ? "bg-gray-700 text-gray-100" : ""}`}
            tileContent={({ date: d }) => {
              const key = d.toISOString().split("T")[0];
              if (events[key]) {
                return (
                  <div className="flex justify-center mt-1 space-x-1">
                    {events[key].map((_, i) => (
                      <span key={i} className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />

          {showInput && (
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                placeholder="Enter event title..."
                className={`flex-1 px-4 py-2 border rounded-xl focus:outline-none ${
                  isDark ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-gray-900"
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEvent()}
              />
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 text-white bg-blue-500 rounded-xl hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          )}

          <div className="mt-4">
            <h3 className="mb-2 text-lg font-semibold">Events on {date.toDateString()}:</h3>
            {events[dateKey]?.length ? (
              <ul className="space-y-2">
                {events[dateKey].map((ev, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded ${
                      isDark ? "bg-gray-700 text-gray-100" : "bg-gray-100"
                    }`}
                  >
                    <span>{ev.title}</span>
                    <button
                      onClick={() => confirmDelete(idx)}
                      className={`hover:text-red-700 ${isDark ? "text-red-400" : "text-red-500"}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>No events</p>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className={`p-6 text-center shadow-lg w-80 rounded-lg ${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
            <p className="mb-4">Are you sure you want to delete this event?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={deleteEvent}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                YES
              </button>
              <button
                onClick={cancelDelete}
                className={`px-4 py-2 rounded-lg hover:bg-gray-400 ${isDark ? "bg-gray-700 text-gray-100" : "bg-gray-300"}`}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
