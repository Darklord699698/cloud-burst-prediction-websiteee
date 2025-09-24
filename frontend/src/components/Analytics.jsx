// src/components/Analytics.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  RefreshCw,
  MapPin,
  AlertTriangle,
} from "lucide-react";

const OPENWEATHER_KEY = "7b3ffbfe64a1f83e9f112cb4896344ad";
const UNSPLASH_KEY = "3YqgeNBUUUQ2wMEY4zQUcwN-zyjxwxiv7HyOWcPXV48"; // Replace with your Unsplash API key

const Analytics = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(null); // current weather
  const [forecast, setForecast] = useState(null); // forecast.list
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bgImage, setBgImage] = useState(null); // Unsplash image

  // Helper: fetch weather + Unsplash image
  const fetchData = async (cityName) => {
    if (!cityName) return;
    if (!OPENWEATHER_KEY) {
      setError("OpenWeather API key not found. Put it in VITE_OPENWEATHER_KEY");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // current weather
      const curResp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          cityName
        )}&units=metric&appid=${OPENWEATHER_KEY}`
      );
      if (!curResp.ok) throw new Error("City not found (current).");
      const curJson = await curResp.json();

      // forecast (3-hourly, 5 day)
      const forResp = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          cityName
        )}&units=metric&appid=${OPENWEATHER_KEY}`
      );
      if (!forResp.ok) throw new Error("City not found (forecast).");
      const forJson = await forResp.json();

      setCurrent(curJson);
      setForecast(forJson);
      setLastUpdated(new Date().toLocaleString());

      // Fetch Unsplash image
      const imgResp = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          cityName
        )}&client_id=${UNSPLASH_KEY}&orientation=landscape`
      );
      if (imgResp.ok) {
        const imgData = await imgResp.json();
        setBgImage(imgData.urls.regular);
      } else {
        setBgImage(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch data");
      setCurrent(null);
      setForecast(null);
      setBgImage(null);
    } finally {
      setLoading(false);
    }
  };

  const computeCloudburstRisk = (list = []) => {
    if (!list.length) return 0;
    let score = 0;
    list.slice(0, 24).forEach((item) => {
      const rain = item.rain ? item.rain["3h"] || 0 : 0;
      const humidity = item.main.humidity;
      const pressure = item.main.pressure;

      if (rain >= 50) score = Math.max(score, 85);
      else if (rain >= 25) score = Math.max(score, 65);
      else if (rain >= 10) score = Math.max(score, 40);
      else if (rain > 0) score = Math.max(score, 15);

      if (humidity >= 85 && rain >= 10) score = Math.max(score, Math.min(95, score + 5));
      else if (humidity >= 75 && rain >= 5) score = Math.max(score, Math.min(85, score + 3));

      if (pressure && pressure < 1005 && rain >= 5) score = Math.max(score, Math.min(95, score + 5));
    });

    const jitter = Math.floor(Math.random() * 8) - 4;
    let final = Math.max(0, Math.min(100, score + jitter));
    if (final > 75) final = Math.max(final, 80);
    if (final > 50 && final <= 75) final = Math.max(final, 55);
    return final;
  };

  const buildInsights = (cur, fcastList) => {
    const insights = [];
    if (!cur || !fcastList) return insights;
    const avgPressure = Math.round(
      fcastList.slice(0, 8).reduce((s, it) => s + it.main.pressure, 0) / Math.min(8, fcastList.length)
    );
    if (cur.main && avgPressure && cur.main.pressure - avgPressure > 6) {
      insights.push("Pressure falling compared to near-term forecast — conditions might destabilize.");
    } else if (cur.main && avgPressure && avgPressure - cur.main.pressure > 6) {
      insights.push("Current pressure is significantly lower than near-term average — monitor rainfall closely.");
    }

    const avgHum = Math.round(
      fcastList.slice(0, 12).reduce((s, it) => s + it.main.humidity, 0) / Math.min(12, fcastList.length)
    );
    if (avgHum >= 80) insights.push("High humidity in the coming hours — raises cloudburst potential.");
    else if (avgHum < 50) insights.push("Low humidity — less immediate heavy rain risk.");

    const peakRain = Math.max(...fcastList.slice(0, 24).map((it) => (it.rain ? it.rain["3h"] || 0 : 0)));
    if (peakRain >= 30) {
      insights.push(`Significant short-term rainfall expected (peak ~${peakRain} mm per 3h).`);
    } else if (peakRain >= 10) {
      insights.push(`Moderate showers expected (peak ~${peakRain} mm per 3h).`);
    } else {
      insights.push("No heavy rainfall peaks in the near forecast window.");
    }

    return insights;
  };

  const prepareChartData = (list = [], points = 12) => {
    if (!list) return [];
    return list.slice(0, points).map((it) => ({
      time: new Date(it.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: Number(it.main.temp.toFixed(1)),
      rain: it.rain ? it.rain["3h"] || 0 : 0,
    }));
  };

  const riskPercent = computeCloudburstRisk(forecast?.list || []);
  const chartData = prepareChartData(forecast?.list || [], 16);
  const insights = buildInsights(current, forecast?.list || []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <div
        className="relative h-56 overflow-hidden shadow-md rounded-b-2xl"
        aria-hidden={false}
        style={{
            backgroundImage: current
              ? `linear-gradient(rgba(6,6,23,0.45), rgba(6,6,23,0.45)), url(${bgImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}          
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold text-white">
              <MapPin size={28} /> {current ? `${current.name}, ${current.sys.country}` : "Weather Analytics"}
            </h1>
            <p className="mt-1 text-sm text-white/90">{lastUpdated ? `Last updated: ${lastUpdated}` : "Enter a place below and press Search"}</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city (e.g. Tokyo)"
              className="w-64 px-4 py-2 text-black rounded-xl focus:outline-none"
            />
            <button
              onClick={() => fetchData(city)}
              className="flex items-center gap-2 px-4 py-2 text-black transition shadow bg-white/90 rounded-xl hover:scale-105"
            >
              <RefreshCw size={16} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl px-6 mx-auto mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Cards + gauge */}
          <div className="space-y-6">
            {/* Key stat cards */}
            <div className="grid grid-cols-2 gap-4">
  {/* Temperature */}
  <div className="flex flex-col p-4 bg-white shadow rounded-xl">
    <div className="flex items-center gap-3">
      <Thermometer className="text-red-500" size={28} />
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Temp</p>
        <p className="text-lg font-semibold">{current ? `${Math.round(current.main.temp)}°C` : "—"}</p>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-400">
      Feels like {current ? `${Math.round(current.main.feels_like)}°C` : "—"}
    </p>
  </div>

  {/* Humidity */}
  <div className="flex flex-col p-4 bg-white shadow rounded-xl">
    <div className="flex items-center gap-3">
      <Droplets className="text-blue-500" size={28} />
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Humidity</p>
        <p className="text-lg font-semibold">{current ? `${current.main.humidity}%` : "—"}</p>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-400">
      Pressure {current ? `${current.main.pressure} hPa` : "—"}
    </p>
  </div>

  {/* Wind */}
  <div className="flex flex-col p-4 bg-white shadow rounded-xl">
    <div className="flex items-center gap-3">
      <Wind className="text-yellow-500" size={28} />
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Wind</p>
        <p className="text-lg font-semibold">{current ? `${Math.round(current.wind.speed)} m/s` : "—"}</p>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-400">
      Direction {current ? `${Math.round(current.wind.deg)}°` : "—"}
    </p>
  </div>

  {/* Visibility */}
  <div className="flex flex-col p-4 bg-white shadow rounded-xl">
    <div className="flex items-center gap-3">
      <Eye className="text-gray-600" size={28} />
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Visibility</p>
        <p className="text-lg font-semibold">{current ? `${current.visibility / 1000} km` : "—"}</p>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-400">
      Time {current ? new Date(current.dt * 1000).toLocaleTimeString() : "—"}
    </p>
  </div>
</div>


            {/* Cloudburst gauge card */}
            <div className="flex items-center gap-6 p-6 bg-white shadow rounded-2xl">
              <div className="flex items-center justify-center w-36 h-36">
                {/* Progress ring (SVG) */}
                <svg viewBox="0 0 36 36" className="w-28 h-28">
                  <path d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="#eee" strokeWidth="2" />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: (riskPercent / 100) }}
                    transition={{ duration: 0.9 }}
                    d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
                    fill="none"
                    stroke={riskPercent >= 70 ? "#dc2626" : riskPercent >= 40 ? "#f59e0b" : "#10b981"}
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" textAnchor="middle" className="text-sm" fill="#111" fontSize="6">{`${riskPercent}%`}</text>
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-500">Cloudburst Risk (next 24h)</p>
                <h3 className="text-2xl font-bold">
                  {riskPercent >= 70 ? "High" : riskPercent >= 40 ? "Medium" : "Low"}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{current ? `Based on rainfall, humidity & pressure near ${current.name}` : "No data"}</p>

                {riskPercent >= 70 && (
                  <div className="flex items-center gap-2 p-2 mt-3 text-red-700 rounded bg-red-50">
                    <AlertTriangle /> Immediate attention recommended
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle column: chart + forecasts */}
          <div className="space-y-6 lg:col-span-2">
            <div className="p-4 bg-white shadow rounded-2xl">
              <h3 className="mb-3 text-lg font-semibold">Temperature & Precipitation (near-term)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" orientation="left" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" name="Temp °C" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="rain" stroke="#06b6d4" name="Rain mm (3h)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 bg-white shadow rounded-2xl">
              <h3 className="mb-3 text-lg font-semibold">Near-term Forecast (next points)</h3>
              <div className="grid gap-3">
                {forecast?.list?.slice(0, 6).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{new Date(it.dt_txt).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{it.weather?.[0]?.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{Math.round(it.main.temp)}°C</p>
                      <p className="text-sm text-gray-500">{it.rain ? `${it.rain["3h"] || 0} mm` : "0 mm"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white shadow rounded-2xl">
              <h3 className="mb-3 text-lg font-semibold">Insights</h3>
              {insights.length ? (
                <ul className="ml-5 space-y-2 text-sm text-gray-700 list-disc">
                  {insights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No insights available — search a city to generate insights.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer small note */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Data from OpenWeather. Images from Unsplash (via source.unsplash.com). This is a guide-based prediction — for official warnings rely on local authorities.</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
