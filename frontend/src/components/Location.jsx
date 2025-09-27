import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBookmark } from "react-icons/fa"; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const cities = [
  { name: "New York", country: "US" },
  { name: "Tokyo", country: "JP" },
  { name: "Paris", country: "FR" },
];

const OPENWEATHER_KEY = "7b3ffbfe64a1f83e9f112cb4896344ad";
const UNSPLASH_KEY = "3YqgeNBUUUQ2wMEY4zQUcwN-zyjxwxiv7HyOWcPXV48";

const Location = () => {
  const [locationsData, setLocationsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarkedCities")) || []
  );
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem("searchHistory")) || []
  );

  // Dynamic temperature unit state
  const [tempUnit, setTempUnit] = useState(() => {
    const savedUnit = localStorage.getItem("temperatureUnit");
    return savedUnit === "F" ? "F" : "C";
  });

  // Update tempUnit when localStorage changes (from Settings.jsx)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUnit = localStorage.getItem("temperatureUnit");
      setTempUnit(savedUnit === "F" ? "F" : "C");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    fetchMultipleCities(cities);
  }, []);

  const fetchMultipleCities = async (cityList) => {
    try {
      const results = await Promise.all(
        cityList.map(async (city) => {
          return await fetchCityData(city.name, city.country);
        })
      );
      setLocationsData(results.filter(Boolean));
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const fetchCityDescription = async (city) => {
    try {
      const wikiRes = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`
      );
      return wikiRes.data.extract || `${city} is a wonderful place with its unique culture and history.`;
    } catch (err) {
      return `${city} is a wonderful place with its unique culture and history.`;
    }
  };

  const fetchCityData = async (name, country = "") => {
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${name}${
          country ? `,${country}` : ""
        }&appid=${OPENWEATHER_KEY}&units=metric`
      );

      const imgRes = await axios.get(
        `https://api.unsplash.com/search/photos?query=${name}&client_id=${UNSPLASH_KEY}&per_page=1`
      );

      const description = await fetchCityDescription(name);

      return {
        name,
        country: country || weatherRes.data.sys.country,
        weather: weatherRes.data,
        image: imgRes.data.results[0]?.urls?.regular,
        description,
      };
    } catch (err) {
      return null;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const cityData = await fetchCityData(searchQuery.trim());
    if (cityData) {
      setLocationsData([cityData]);
      const updatedHistory = [cityData, ...searchHistory.filter(c => c.name !== cityData.name)];
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    }
    setSearchQuery("");
  };

  const toggleBookmark = (cityName) => {
    let updated;
    if (bookmarks.includes(cityName)) {
      updated = bookmarks.filter((b) => b !== cityName);
    } else {
      updated = [...bookmarks, cityName];
    }
    setBookmarks(updated);
    localStorage.setItem("bookmarkedCities", JSON.stringify(updated));
  };

  const bookmarkedCitiesData = searchHistory.filter(city => bookmarks.includes(city.name));

  // Detect dark mode
  const isDark = document.documentElement.classList.contains("dark");
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const chartColors = {
    temp: "#8884d8",
    humidity: "#82ca9d",
    wind: "#ffc658",
    axis: isDark ? "#E5E7EB" : "#1F2937",
    tooltipBg: isDark ? "#374151" : "#ffffff",
    tooltipText: isDark ? "#ffffff" : "#000000",
  };

  // helper to format temperature
  const formatTemp = (tempC) => (tempUnit === "F" ? Math.round(tempC * 9/5 + 32) : Math.round(tempC));

  return (
    <div className={`p-6 ${bgColor} ${textColor} min-h-screen transition-colors duration-300 rounded-3xl`}>

      <h1 className="mb-6 text-3xl font-bold">Locations</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 p-2 border rounded-lg ${isDark ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
        />
        <button
          type="submit"
          className="px-4 py-2 text-white rounded-lg bg-cyan-500 hover:bg-cyan-600"
        >
          Search
        </button>
      </form>

      {/* Display searched or default cities */}
      <div className="grid gap-6 md:grid-cols-3">
        {locationsData.map((loc, index) => (
          <div key={index} className={`relative overflow-hidden rounded-lg shadow-lg ${cardBg}`}>
            {loc.image && <img src={loc.image} alt={loc.name} className="object-cover w-full h-48" />}
            <button
              onClick={() => toggleBookmark(loc.name)}
              className={`absolute top-2 right-2 text-xl ${
                bookmarks.includes(loc.name) ? "text-yellow-400" : "text-gray-300"
              }`}
              title={bookmarks.includes(loc.name) ? "Remove Bookmark" : "Add Bookmark"}
            >
              <FaBookmark />
            </button>
            <div className="p-4">
              <h2 className="mb-2 text-xl font-semibold">{loc.name}, {loc.country}</h2>
              {loc.weather && (
                <div className={`flex flex-wrap gap-2 mb-2 text-sm ${isDark ? "text-gray-100" : "text-gray-700"}`}>
                  <span>🌡 {formatTemp(loc.weather.main.temp)}°{tempUnit}</span>
                  <span>💧 {loc.weather.main.humidity}% Humidity</span>
                  <span>💨 {loc.weather.wind.speed} m/s</span>
                </div>
              )}
              <p className={`${isDark ? "text-gray-200" : "text-gray-700"} mb-2`}>{loc.description}</p>
              <iframe
                width="100%"
                height="150"
                className="rounded-lg"
                src={`https://maps.google.com/maps?q=${loc.name}&output=embed`}
              ></iframe>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-city comparison chart */}
      {searchHistory.length > 1 && (
        <div className={`p-4 mt-6 rounded-lg shadow ${cardBg}`}>
          <h2 className="mb-4 text-2xl font-semibold">Past Searches Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={searchHistory.map(city => ({
                name: city.name,
                temp: formatTemp(city.weather?.main.temp),
                humidity: city.weather?.main.humidity,
                wind: city.weather?.wind.speed,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke={chartColors.axis} />
              <YAxis stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: 8 }}
                itemStyle={{ color: chartColors.tooltipText }}
                labelStyle={{ color: chartColors.tooltipText }}
              />
              <Legend wrapperStyle={{ color: chartColors.tooltipText }} />
              <Bar dataKey="temp" fill={chartColors.temp} name={`Temperature (°${tempUnit})`} />
              <Bar dataKey="humidity" fill={chartColors.humidity} name="Humidity (%)" />
              <Bar dataKey="wind" fill={chartColors.wind} name="Wind Speed (m/s)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bookmarked / Favorites Section */}
      {bookmarkedCitiesData.length > 0 && (
        <div className={`p-4 mt-6 rounded-lg shadow ${cardBg}`}>
          <h2 className="mb-4 text-2xl font-semibold">Favorites</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {bookmarkedCitiesData.map((loc, idx) => (
              <div key={idx} className={`relative p-2 border rounded ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                <h3 className="text-lg font-semibold">{loc.name}</h3>
                {loc.weather && (
                  <p>🌡 Temp: {formatTemp(loc.weather.main.temp)}°{tempUnit} | 💧 Humidity: {loc.weather.main.humidity}% | 💨 Wind: {loc.weather.wind.speed} m/s</p>
                )}
                <button
                  onClick={() => toggleBookmark(loc.name)}
                  className="absolute text-xl text-yellow-400 top-2 right-2"
                  title="Remove Bookmark"
                >
                  <FaBookmark />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Location;
