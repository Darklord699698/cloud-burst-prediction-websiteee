// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { Sun, Moon, Thermometer, Bell, RefreshCw } from "lucide-react";
import { useTheme } from "../components/ThemeContext";

const SettingsPage = () => {
  const { darkMode, setDarkMode } = useTheme();

  // Load temperature unit from localStorage or default to Celsius
  const [celsius, setCelsius] = useState(() => {
    const savedUnit = localStorage.getItem("temperatureUnit");
    return savedUnit !== "F"; // default to Celsius
  });

  // Load notifications setting from localStorage
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notificationsEnabled") === "false" ? false : true
  );

  // Update localStorage when notifications toggle changes
  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    localStorage.setItem("notificationsEnabled", !notifications);
  };

  // Update localStorage when temperature unit changes
  const handleUnitChange = (e) => {
    const isCelsius = e.target.value === "C";
    setCelsius(isCelsius);
    localStorage.setItem("temperatureUnit", isCelsius ? "C" : "F");
  };

  // Ensure select reflects localStorage if changed elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUnit = localStorage.getItem("temperatureUnit");
      setCelsius(savedUnit !== "F");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen p-6 overflow-hidden text-gray-900 transition-colors duration-300 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 rounded-2xl">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Theme */}
        <div className="flex items-center justify-between p-4 transition-colors duration-300 shadow bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="text-gray-200" /> : <Sun className="text-yellow-400" />}
            <p className="font-medium">Dark Mode</p>
          </div>
          <label className="inline-flex items-center cursor-pointer" aria-label="Toggle dark mode">
            <input
              type="checkbox"
              className="sr-only"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={darkMode}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>

        {/* Temperature Unit */}
        <div className="flex items-center justify-between p-4 transition-colors duration-300 shadow bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Thermometer className="text-red-500" />
            <p className="font-medium">Temperature Unit</p>
          </div>
          <select
            value={celsius ? "C" : "F"}
            onChange={handleUnitChange}
            className="px-2 py-1 text-gray-900 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="C">°C</option>
            <option value="F">°F</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 transition-colors duration-300 shadow bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell className="text-blue-500" />
            <p className="font-medium">Notifications</p>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={handleNotificationsToggle}
            className="w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reset Data */}
        <div className="flex items-center justify-between p-4 transition-colors duration-300 shadow bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <RefreshCw className="text-gray-700 dark:text-gray-200" />
            <p className="font-medium">Reset App Data</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              alert("Data cleared! (localStorage cleared)");
            }}
            className="px-4 py-2 text-white transition bg-red-500 rounded-xl hover:bg-red-600"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-300">
          App version: 1.0.0 <br />
          Data from OpenWeather. Images from Unsplash.
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
