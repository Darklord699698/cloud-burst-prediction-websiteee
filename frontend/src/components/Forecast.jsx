import React, { useState } from "react";
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
  Wind,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const Forecast = () => {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cloudburst Prediction Logic (Tweaked thresholds for more variation)
const predictCloudburst = (list) => {
    let risk = 0; // percentage
  
    list.forEach((item) => {
      const rain = item.rain ? item.rain["3h"] || 0 : 0;
      const humidity = item.main.humidity;
      const pressure = item.main.pressure;
  
      // Made conditions a bit more lenient so risks appear more often
      if (rain > 60 && humidity > 75 && pressure < 1005) {
        risk = Math.max(risk, 90); // High risk
      } else if (rain > 35 && humidity > 70) {
        risk = Math.max(risk, 60); // Medium risk
      } else if (rain > 10 && humidity > 60) {
        risk = Math.max(risk, 30); // Low risk
      }
    });
  
    return risk;
  };
  

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
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
          className="max-w-3xl p-6 mx-auto text-black bg-white shadow-2xl rounded-2xl"
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

                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full">
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

                {/* Alert Banner */}
                {risk >= 70 && (
                  <div className="flex items-center gap-2 p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
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
                className="flex items-center justify-between p-4 bg-gray-100 shadow-md rounded-xl"
              >
                <p className="text-sm font-medium">
                  {new Date(item.dt_txt).toLocaleString()}
                </p>
                <div className="flex gap-3 text-gray-700">
                  <span className="flex items-center gap-1">
                    <Thermometer size={18} /> {item.main.temp}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets size={18} /> {item.main.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudRain size={18} />{" "}
                    {item.rain ? item.rain["3h"] || 0 : 0}mm
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Line Chart for Temperature */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              🌡️ Temperature Trend
            </h3>
            <div className="h-64 p-3 bg-gray-50 rounded-xl">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecast.list.slice(0, 8).map((item) => ({
                    time: new Date(item.dt_txt).getHours() + ":00",
                    temp: item.main.temp,
                  }))}
                >
                  <XAxis dataKey="time" stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
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
