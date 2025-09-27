import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CloudRain,
  Thermometer,
  Droplets,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const Forecast = () => {
  const [city, setCity] = useState(() => localStorage.getItem("city") || "");
  const [forecast, setForecast] = useState(
    () => JSON.parse(localStorage.getItem("forecast")) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState(() => {
    return localStorage.getItem("temperatureUnit") || "C";
  });
  
  const API_KEY = "7b3ffbfe64a1f83e9f112cb4896344ad";

  const fetchForecast = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      setForecast(data);

      // Save to localStorage
      localStorage.setItem("city", city);
      localStorage.setItem("forecast", JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If forecast is in localStorage, no need to fetch again
    if (forecast && city) return;
    if (city) fetchForecast();
  }, []); // runs once on mount

  const predictCloudburst = (list) => {
    let risk = 0;
    list.forEach((item) => {
      const rain = item.rain ? item.rain["3h"] || 0 : 0;
      const humidity = item.main.humidity;
      const pressure = item.main.pressure;

      if (rain > 60 && humidity > 75 && pressure < 1005) risk = Math.max(risk, 90);
      else if (rain > 35 && humidity > 70) risk = Math.max(risk, 60);
      else if (rain > 10 && humidity > 60) risk = Math.max(risk, 30);
    });
    return risk;
  };

  // Light/dark mode colors
  const isDark = document.documentElement.classList.contains("dark");
  const axisColor = isDark ? "#E5E7EB" : "#1F2937";
  const lineColor = "#3b82f6";
  const tooltipBg = isDark ? "rgba(55,65,81,0.9)" : "#ffffff";
  const tooltipText = isDark ? "#ffffff" : "#000000";

  return (
    <div className="min-h-screen p-6 text-gray-900 transition-colors duration-300 dark:text-gray-100 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl">
      <h1 className="mb-6 text-4xl font-extrabold text-center drop-shadow-lg">
        🌦️ Cloudburst Forecast
      </h1>

      {/* Search Box */}
      <div className="flex justify-center gap-2 mb-6">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          className="px-4 py-2 text-black shadow-md w-72 rounded-xl"
        />
        <button
          onClick={fetchForecast}
          className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-yellow-500 shadow-lg rounded-xl hover:bg-yellow-600"
        >
          <RefreshCw size={18} /> Search
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-center">⏳ Loading forecast...</p>}
      {error && <p className="text-center text-red-300">{error}</p>}

      {/* Forecast Display */}
      {forecast && (
        <motion.div
          className="max-w-3xl p-6 mx-auto text-black bg-white shadow-2xl rounded-2xl dark:bg-gray-900 dark:text-gray-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-2xl font-bold">
            📍 {forecast.city.name}, {forecast.city.country}
          </h2>

          {/* Risk Badge + Progress */}
          {(() => {
            const risk = predictCloudburst(forecast.list);
            return (
              <div className="mb-6">
                <p className="flex items-center gap-2 mb-2 text-lg">
                  🌧️ Cloudburst Risk:{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-white font-bold ${
                      risk >= 70
                        ? "bg-red-600"
                        : risk >= 40
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                  >
                    {risk}%
                  </span>
                </p>

                <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
                  <motion.div
                    className={`h-3 rounded-full ${
                      risk >= 70
                        ? "bg-red-600"
                        : risk >= 40
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${risk}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                {risk >= 70 && (
                  <div className="flex items-center gap-2 p-3 mt-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
                    <AlertTriangle /> High chance of cloudburst! Stay alert ⚠️
                  </div>
                )}
              </div>
            );
          })()}

          {/* Forecast Cards */}
<div className="grid gap-4 mb-8 md:grid-cols-2">
  {forecast.list.slice(0, 5).map((item, index) => (
    <div
      key={index}
      className="flex items-center justify-between p-4 bg-gray-100 shadow-md rounded-xl dark:bg-gray-800"
    >
      <p className="text-sm font-medium">
        {new Date(item.dt_txt).toLocaleString()}
      </p>
      <div className="flex gap-3 text-gray-700 dark:text-gray-200">
        <span className="flex items-center gap-1">
          <Thermometer size={18} />{" "}
          {temperatureUnit === "C"
            ? Math.round(item.main.temp)
            : Math.round(item.main.temp * 9 / 5 + 32)}°{temperatureUnit}
        </span>
        <span className="flex items-center gap-1">
          <Droplets size={18} /> {item.main.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <CloudRain size={18} /> {item.rain ? item.rain["3h"] || 0 : 0}mm
        </span>
      </div>
    </div>
  ))}
</div>

{/* Line Chart for Temperature */}
<div>
  <h3 className="mb-3 text-lg font-semibold">🌡️ Temperature Trend</h3>
  <div className="h-64 p-3 bg-gray-50 rounded-2xl dark:bg-gray-800">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={forecast.list.slice(0, 8).map((item) => ({
          time: new Date(item.dt_txt).getHours() + ":00",
          temp:
            temperatureUnit === "C"
              ? Math.round(item.main.temp)
              : Math.round(item.main.temp * 9 / 5 + 32),
        }))}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey="time"
          stroke={axisColor}
          tick={{ fill: axisColor }}
          tickLine={{ stroke: axisColor, strokeWidth: 1 }}
        />
        <YAxis
          stroke={axisColor}
          tick={{ fill: axisColor }}
          tickLine={{ stroke: axisColor, strokeWidth: 1 }}
          tickFormatter={(value) => value + `°${temperatureUnit}`} // dynamic unit
        />
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBg, borderRadius: 8 }}
          labelStyle={{ color: tooltipText }}
          itemStyle={{ color: tooltipText }}
          formatter={(value) => value + `°${temperatureUnit}`} // tooltip shows °C/°F
        />
        <Line
          type="monotone"
          dataKey="temp"
          stroke={lineColor}
          strokeWidth={3}
          dot={{ r: 5, stroke: lineColor, fill: lineColor }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

        </motion.div>
      )}
    </div>
  );
};

export default Forecast;
