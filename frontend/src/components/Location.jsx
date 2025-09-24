// Location.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

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

      return {
        name,
        country: country || weatherRes.data.sys.country,
        weather: weatherRes.data,
        image: imgRes.data.results[0]?.urls?.regular,
        description: getCityDescription(name),
      };
    } catch (err) {
      console.error(`Error fetching data for ${name}:`, err);
      return null;
    }
  };

  const getCityDescription = (city) => {
    switch (city) {
      case "New York":
        return "New York City, known as 'The Big Apple', is a bustling hub for culture, finance, and architecture.";
      case "Tokyo":
        return "Tokyo, Japan’s capital, blends ultramodern skyscrapers with traditional temples and vibrant street life.";
      case "Paris":
        return "Paris, the capital of France, is famed for its romantic charm, art museums, and the iconic Eiffel Tower.";
      default:
        return `${city} is a wonderful place with its own unique culture, history, and charm.`;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cityData = await fetchCityData(searchQuery.trim());
    if (cityData) {
      setLocationsData([cityData]); // Replace with searched city
    }
    setSearchQuery("");
  };

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

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {locationsData.map((loc, index) => (
          <div
            key={index}
            className="overflow-hidden bg-white rounded-lg shadow-lg"
          >
            {loc.image && (
              <img
                src={loc.image}
                alt={loc.name}
                className="object-cover w-full h-48"
              />
            )}
            <div className="p-4">
              <h2 className="mb-2 text-xl font-semibold">
                {loc.name}, {loc.country}
              </h2>
              {loc.weather && (
                <p className="mb-2">
                  🌡 Temp: {loc.weather.main.temp}°C |{" "}
                  {loc.weather.weather[0].description}
                </p>
              )}
              <p className="text-gray-700">{loc.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Location;
