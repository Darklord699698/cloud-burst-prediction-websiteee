import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBookmark } from "react-icons/fa"; // Bookmark icon
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
      console.error(`Error fetching description for ${city}:`, err);
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
      console.error(`Error fetching data for ${name}:`, err);
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

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Locations</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
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
          <div key={index} className="relative overflow-hidden bg-white rounded-lg shadow-lg">
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
                <div className="flex flex-wrap gap-2 mb-2 text-sm">
                  <span>🌡 {loc.weather.main.temp}°C</span>
                  <span>💧 {loc.weather.main.humidity}% Humidity</span>
                  <span>💨 {loc.weather.wind.speed} m/s</span>
                </div>
              )}
              <p className="mb-2 text-gray-700">{loc.description}</p>
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
        <div className="p-4 mt-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-2xl font-semibold">Past Searches Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={searchHistory.map(city => ({
                name: city.name,
                temp: city.weather?.main.temp,
                humidity: city.weather?.main.humidity,
                wind: city.weather?.wind.speed,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="temp" fill="#8884d8" name="Temperature (°C)" />
              <Bar dataKey="humidity" fill="#82ca9d" name="Humidity (%)" />
              <Bar dataKey="wind" fill="#ffc658" name="Wind Speed (m/s)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bookmarked / Favorites Section */}
      {bookmarkedCitiesData.length > 0 && (
        <div className="p-4 mt-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-2xl font-semibold">Favorites</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {bookmarkedCitiesData.map((loc, idx) => (
              <div key={idx} className="relative p-2 border rounded">
                <h3 className="text-lg font-semibold">{loc.name}</h3>
                {loc.weather && (
                  <p>🌡 Temp: {loc.weather.main.temp}°C | 💧 Humidity: {loc.weather.main.humidity}% | 💨 Wind: {loc.weather.wind.speed} m/s</p>
                )}
                <button
                  onClick={() => toggleBookmark(loc.name)}
                  className={`absolute top-2 right-2 text-xl text-yellow-400`}
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
