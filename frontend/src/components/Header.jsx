import React, { useState } from "react";
import { assets } from "../assets/assets.js";
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/clerk-react";
import { User, Mail } from "lucide-react";
import Lottie from "lottie-react";
import searching_ani from "../assets/searching_ani.json";
import emailjs from "emailjs-com";
// ... imports remain same
import EmailAni from "../assets/Email.json"; // ✅ import your Email.json
import { useEffect } from "react";
import { getWeatherNotification } from "../components/weatherNotifications.jsx"; // we'll create this
import { useRef } from "react"; // already importing useEffect

const Header = ({ onSearch, isActivePage = true }) => { // default true if not passed
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSendingAnimation, setShowSendingAnimation] = useState(false);
  const [weatherNotifications, setWeatherNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const audioRef = useRef(null);
const prevNotifCount = useRef(weatherNotifications.length);


  // Play notification sound only when new notification arrives AND on active page
  useEffect(() => {
    if (weatherNotifications.length > prevNotifCount.current && audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio play error:", err));
    }
    prevNotifCount.current = weatherNotifications.length;
  }, [weatherNotifications]);
  


useEffect(() => {
  const weatherPhrases = [
    "is enjoying a bright day ☀️",
    "is cloudy with a chance of fun ☁️",
    "has a rainy mood, grab your umbrella 🌧️",
    "is windy, hold onto your hat 🌬️",
    "has a storm brewing, stay safe ⛈️",
    "is calm and clear tonight 🌙",
    "is glowing with sunshine 🌞",
    "is shivering with chills ❄️",
    "is sparkling under the stars ✨",
    "is feeling a bit foggy today 🌫️"
  ];

  const weatherTips = [
    "Don't forget your sunglasses 😎!",
    "Perfect day for a hot coffee ☕.",
    "Maybe go for a stroll 🚶‍♂️!",
    "Stay cozy indoors 🏠",
    "Great time to fly a kite 🪁!",
    "Ideal for stargazing 🌌"
  ];

  const fetchRandomCity = async () => {
    for (let i = 0; i < 10; i++) { // retry up to 10 times
      const lat = (Math.random() * 130 - 60).toFixed(4); // -60 to 70
      const lon = (Math.random() * 360 - 180).toFixed(4); // -180 to 180

      try {
        // First, get weather for these coordinates
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7b3ffbfe64a1f83e9f112cb4896344ad`
        );
        const weatherData = await weatherRes.json();

        if (weatherData && weatherData.name) {
          return `${weatherData.name}, ${weatherData.sys?.country}`;
        }

        // If city not found, use reverse geocoding
        const geoRes = await fetch(
          `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=7b3ffbfe64a1f83e9f112cb4896344ad`
        );
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          return `${geoData[0].name}, ${geoData[0].country}`;
        }
      } catch (err) {
        console.error("Error fetching city:", err);
      }
    }
    return "Some City"; // fallback
  };

  // 🔹 1. Restore saved notifications on mount
  const saved = JSON.parse(localStorage.getItem("weatherNotificationsList") || "[]");
  setWeatherNotifications(saved);

  const fetchAndAddNotification = async () => {
    const notificationsEnabled = localStorage.getItem("notificationsEnabled");
    if (notificationsEnabled === "false") return; // stop adding if disabled

    const randomCity = await fetchRandomCity();
    const randomPhrase = weatherPhrases[Math.floor(Math.random() * weatherPhrases.length)];
    const randomTip = weatherTips[Math.floor(Math.random() * weatherTips.length)];
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const msg = `🌟 Weather Update: ${randomCity} ${randomPhrase} — ${randomTip} (Checked at ${timeString} ⏰)`;

    // 🔹 2. Add to state AND persist
    setWeatherNotifications(prev => {
      const updated = [msg, ...prev];
      localStorage.setItem("weatherNotificationsList", JSON.stringify(updated));
      return updated;
    });
  };

  // 🔹 3. Fetch one immediately if enabled
  if (localStorage.getItem("notificationsEnabled") !== "false") {
    fetchAndAddNotification();
  }

  // 🔹 4. Start periodic updates
  const interval = setInterval(fetchAndAddNotification, 5000);

  return () => clearInterval(interval);
}, []);













  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const { user } = useUser();
  const cities = ["Los Angeles", "Chicago", "New York"];
  // Determine backend URL based on environment
const BASE_URL =
import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://cloud-burst-prediction-websiteee-backend.onrender.com";

const handleSearch = async (e) => {
e.preventDefault();
const city = searchInput.trim();
if (!city) return;

if (user) {
  try {
    const res = await fetch(`${BASE_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, userId: user.id }),
    });

    if (!res.ok) {
      // Handle non-200 responses
      console.error("Failed to save search. Status:", res.status);
      return;
    }

    const data = await res.json();
    if (data.message === "Search saved successfully") {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  } catch (err) {
    console.error("Error saving search:", err);
  }
}

onSearch(city);
setShowDropdown(false);
};



  const handleSelectCity = (city) => {
    setSearchInput(city);
    setShowDropdown(false);
    onSearch(city);
  };

  const sendFeedback = (e) => {
    e.preventDefault();
    setShowSendingAnimation(true); // show animation

    emailjs
      .send(
        "service_zvmr552",    // replace
        "template_a0e8jr6",   // replace
        formData,
        "ioSkVppjYlMHPdJKn"  // replace
      )
      .then(() => {
        // remove alert, just keep animation
        setFormData({ name: "", email: "", message: "" });
        setShowFeedback(false);
        // hide animation after 4-5 seconds
        setTimeout(() => setShowSendingAnimation(false), 4500);
      })
      .catch((err) => {
        setShowSendingAnimation(false);
        console.error("Email send error:", err.text);
      });
  };

  return (
    <header 
      className={`relative z-10 flex items-center justify-between p-4 transition-colors duration-300 rounded-b-2xl ${
        document.documentElement.classList.contains("dark")
          ? "bg-gray-800 text-gray-100"
          : "bg-slate-200 text-gray-900"
      }`}
    >
      <div className="flex-1" />
  
      {/* Search box */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md mx-auto">
        <div className="flex">
          <input
            type="text"
            placeholder="Search any city (e.g., Tokyo, Mumbai, Paris...)"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className={`w-full px-4 py-2 rounded-l-md focus:outline-none ${
              document.documentElement.classList.contains("dark")
                ? "bg-gray-700 text-gray-100 placeholder-gray-300"
                : "bg-gray-300 text-black placeholder-gray-600"
            }`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-r-md transition-all ${
              document.documentElement.classList.contains("dark")
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Search
          </button>
        </div>
  
        {showDropdown && (
          <ul
            className={`absolute left-0 z-20 w-full mt-1 border rounded-md shadow-md ${
              document.documentElement.classList.contains("dark")
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-black"
            }`}
          >
            {cities
              .filter((city) =>
                city.toLowerCase().includes(searchInput.trim().toLowerCase())
              )
              .map((city) => (
                <li
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`px-4 py-2 cursor-pointer hover:${
                    document.documentElement.classList.contains("dark")
                      ? "bg-gray-600"
                      : "bg-gray-100"
                  }`}
                >
                  {city}
                </li>
              ))}
          </ul>
        )}
  
        {/* Saved animation */}
        {saved && (
          <div className="absolute w-20 h-20 mt-1 transform -translate-x-1/2 left-1/2">
            <Lottie animationData={searching_ani} loop={false} />
          </div>
        )}
      </form>
  
      {/* Right-side icons */}
      <div className="relative flex items-center justify-end flex-1 space-x-4">
  
        {/* Notification Bell with dropdown */}
<div className="relative">
  <img
    src={assets.notificationbell}
    alt="Notifications"
    className="w-6 h-6 cursor-pointer"
    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
  />
   {/* Audio element for notification sound */}
   <audio ref={audioRef} src={assets.notificationSound} />
  {/* Badge showing number of notifications */}
{weatherNotifications.length > 0 && (
  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
    {weatherNotifications.length > 5 ? "5+" : weatherNotifications.length}
  </span>
)}


  {/* Dropdown */}
  {showNotifDropdown && (
    <div className="absolute right-0 z-20 w-64 p-2 mt-2 bg-white rounded shadow-lg dark:bg-gray-700">
      {weatherNotifications.length > 0 && (
        <button
          onClick={() => setWeatherNotifications([])}
          className="mb-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear All
        </button>
      )}

      {weatherNotifications.length === 0 && (
        <p className="text-gray-500 dark:text-gray-300">No notifications</p>
      )}

      {weatherNotifications.map((note, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 mb-1 text-sm border-b border-gray-200 rounded last:border-b-0 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <span>{note}</span>
          <button
            onClick={() =>
              setWeatherNotifications((prev) =>
                prev.filter((_, i) => i !== idx)
              )
            }
            className="text-xs text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

  
        {/* Feedback button */}
        <button
          onClick={() => setShowFeedback(true)}
          className={`p-2 rounded-full hover:${
            document.documentElement.classList.contains("dark")
              ? "bg-gray-700"
              : "bg-gray-300"
          }`}
          title="Send Feedback"
        >
          <Mail
            className={`w-6 h-6 ${
              document.documentElement.classList.contains("dark")
                ? "text-gray-100"
                : "text-black"
            }`}
          />
        </button>
  
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className={`p-2 rounded-full hover:${
                document.documentElement.classList.contains("dark")
                  ? "bg-gray-700"
                  : "bg-gray-300"
              }`}
            >
              <User
                className={`w-6 h-6 ${
                  document.documentElement.classList.contains("dark")
                    ? "text-gray-100"
                    : "text-black"
                }`}
              />
            </button>
          </SignInButton>
        </SignedOut>
  
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
  
      {/* Feedback popup */}
      {showFeedback && !showSendingAnimation && (
        <div
          className={`absolute z-30 p-4 rounded shadow-lg top-20 right-4 w-72 transition-colors duration-300 ${
            document.documentElement.classList.contains("dark")
              ? "bg-gray-800 text-gray-100"
              : "bg-white text-black"
          }`}
        >
          <h3 className="mb-2 text-lg font-semibold">Send Feedback</h3>
          <form onSubmit={sendFeedback}>
            <input
              className={`w-full p-2 mb-2 rounded border focus:outline-none ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                  : "bg-white border-gray-300 text-black placeholder-gray-600"
              }`}
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              className={`w-full p-2 mb-2 rounded border focus:outline-none ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                  : "bg-white border-gray-300 text-black placeholder-gray-600"
              }`}
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <textarea
              className={`w-full p-2 mb-2 rounded border focus:outline-none ${
                document.documentElement.classList.contains("dark")
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                  : "bg-white border-gray-300 text-black placeholder-gray-600"
              }`}
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className={`px-3 py-1 text-sm rounded hover:${
                  document.documentElement.classList.contains("dark")
                    ? "bg-gray-700"
                    : "bg-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
  
      {/* Sending feedback animation overlay */}
      {showSendingAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-40 h-40">
            <Lottie animationData={EmailAni} loop={true} />
          </div>
        </div>
      )}
    </header>
  );
  
};

export default Header;