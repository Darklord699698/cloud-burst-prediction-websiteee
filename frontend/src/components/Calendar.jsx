import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // basic styles
import { Plus, Trash2 } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({
    "2025-08-30": [{ title: "Trip to Bengaluru" }],
    "2025-08-31": [{ title: "Cloudburst Alert" }],
  });
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newEvent, setNewEvent] = useState("");
  const [showInput, setShowInput] = useState(false);

  const dateKey = date.toISOString().split("T")[0];

  const handleAddEvent = () => {
    setShowInput(true);
  };

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

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-4 text-2xl font-bold">Calendar</h1>

        <div className="p-4 bg-white shadow-md rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {date.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 px-4 py-2 text-black transition shadow bg-white/90 rounded-xl hover:scale-105"
            >
              <Plus size={16} /> Add Event
            </button>
          </div>

          <Calendar
            onChange={setDate}
            value={date}
            className="overflow-hidden rounded-xl"
            tileContent={({ date: d }) => {
              const key = d.toISOString().split("T")[0];
              if (events[key]) {
                return (
                  <div className="flex justify-center mt-1 space-x-1">
                    {events[key].map((e, i) => (
                      <span key={i} className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Input bar for new event */}
          {showInput && (
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                placeholder="Enter event title..."
                className="flex-1 px-4 py-2 border rounded-xl focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEvent();
                }}
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
                    className="flex items-center justify-between p-2 bg-gray-100 rounded"
                  >
                    <span>{ev.title}</span>
                    <button
                      onClick={() => confirmDelete(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No events</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="p-6 text-center bg-white rounded-lg shadow-lg w-80">
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
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
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
