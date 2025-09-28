import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { assets } from "../assets/assets";
import { useUser } from "@clerk/clerk-react"; // <-- Import Clerk hook

const Sidebar = ({ onNavigate, selectedCity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const [pollutants, setPollutants] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [locationName, setLocationName] = useState(selectedCity || "Bengaluru, IN");

  const { user, isSignedIn } = useUser(); // <-- Get user info from Clerk

  const OPENWEATHER_API_KEY = "7b3ffbfe64a1f83e9f112cb4896344ad";

  // Dark mode observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch AQI whenever selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchAQIByCity = async () => {
      try {
        // Get lat/lon from city name
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=1&appid=${OPENWEATHER_API_KEY}`
        );
        const geoData = await geoRes.json();
        if (!geoData?.[0]) return;

        const { lat, lon, name, state, country } = geoData[0];
        setLocationName(`${name}${state ? ", " + state : ""}, ${country}`);

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
        );
        const data = await res.json();

        if (data?.list?.[0]?.components) {
          setPollutants({
            pm25: data.list[0].components.pm2_5.toFixed(1),
            pm10: data.list[0].components.pm10.toFixed(1),
            so2: data.list[0].components.so2.toFixed(1),
            no2: data.list[0].components.no2.toFixed(1),
            o3: data.list[0].components.o3.toFixed(1),
            co: data.list[0].components.co.toFixed(1),
          });
        }
      } catch (err) {
        console.error("Error fetching AQI:", err);
      }
    };

    fetchAQIByCity();
  }, [selectedCity]);

  const getAQIInfo = (pm25) => {
    if (pm25 <= 55)
      return { label: "Good 😄🌿", color: "#00e400", message: "Air quality is good. A perfect day for a walk." };
    if (pm25 <= 150)
      return { label: "Moderate 🙂🌤️", color: "#ffff00", message: "Air quality is moderate. Be cautious if sensitive." };
    if (pm25 <= 250)
      return { label: "Unhealthy 😷🏭", color: "#ff7e00", message: "Air quality is unhealthy. Limit outdoor activities." };
    return { label: "Hazardous ☠️🔥", color: "#ff0000", message: "Air quality is hazardous. Stay indoors!" };
  };

  const menuItems = [
    { key: "home", label: "Home", icon: assets.home },
    { key: "forecast", label: "Forecast", icon: assets.forecast },
    { key: "location", label: "Location", icon: assets.location },
    { key: "analytics", label: "Analytics", icon: assets.Analytics },
    { key: "calendar", label: "Calendar", icon: assets.calendar },
    { key: "settings", label: "Settings", icon: assets.settings },
  ];

  const aqiInfo = pollutants ? getAQIInfo(pollutants.pm25) : null;

  // Display user’s full name if signed in
  const displayName = isSignedIn && user?.fullName ? user.fullName : "User!";

  return (
    <>
      {/* Inline Styles for Animations */}
      <style>
        {`
          @keyframes bubble {
            0% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
            100% { transform: translateY(-40px) scale(1); opacity: 0.3; }
          }
          .animate-bubble { animation: bubble 6s ease-in-out infinite; }
  
          @keyframes stroke {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
          .animate-stroke { animation: stroke 1.5s ease-out forwards; }
  
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
          .delay-200 { animation-delay: 0.2s; }
        `}
      </style>
  
      {/* Hamburger Button */}
      <button
        className={`fixed z-20 p-2 rounded-md top-4 left-4 transition-colors duration-300 ${
          isDark ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-cyan-500 text-white hover:bg-cyan-600"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
  
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 w-64 h-full transform transition-transform duration-300 rounded-r-2xl shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDark ? "bg-gray-900 text-gray-100" : "bg-cyan-300 text-white"}`}
      >
        <ul className="flex flex-col h-full gap-6 p-6 mt-24 text-left">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                isDark ? "hover:bg-gray-700 hover:text-white" : "hover:bg-cyan-400 hover:text-white"
              }`}
              onClick={() => onNavigate(item.key)}
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <span className="font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
  
      {/* Greeting + AQI when sidebar is hidden */}
      {!isOpen && pollutants && (
        <div
          className={`fixed top-24 left-0 z-0 w-64 h-full flex flex-col items-center justify-start gap-4 p-6 transition-all duration-500 rounded-r-2xl shadow-lg ${
            isDark ? "bg-gray-900 text-gray-100" : "bg-white text-black"
          }`}
        >
          {/* Greeting */}
          <div className="text-2xl font-bold">{greeting}, {displayName}</div>
  
          {/* AQI Card */}
          <div className="relative flex flex-col items-center w-full p-4 overflow-hidden shadow-lg rounded-2xl bg-opacity-90 backdrop-blur-md">
            
            {/* Floating bubbles */}
            <div className="absolute inset-0 z-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`absolute rounded-full opacity-30 animate-bubble ${
                    i % 2 === 0 ? "bg-green-400" : "bg-yellow-400"
                  }`}
                  style={{
                    width: `${10 + Math.random() * 20}px`,
                    height: `${10 + Math.random() * 20}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                ></span>
              ))}
            </div>
  
            <div className="relative z-10 flex flex-col items-center w-full -mt-4">
  <div className="mb-3 text-xl font-semibold text-center">{locationName}</div>
  
              {/* AQI Circle */}
              <div className="relative w-24 h-30">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
                    stroke={isDark ? "#444" : "#ddd"}
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
                    stroke={aqiInfo.color}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${Math.min(pollutants.pm25, 250) / 2.5 * 100}, 100`}
                    strokeDashoffset="100"
                    className="animate-stroke"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="1em"
                    fontWeight="bold"
                    fill={aqiInfo.color}
                  >
                    {pollutants.pm25}
                  </text>
                </svg>
              </div>
  
              {/* AQI Label */}
              <div className={`mt-3 px-3 py-1 rounded-full font-semibold text-xl ${
                aqiInfo.color === "#00e400"
                  ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                  : aqiInfo.color === "#ffff00"
                  ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200"
                  : aqiInfo.color === "#ff7e00"
                  ? "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                  : "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
              }`}>
                {aqiInfo.label}
              </div>
  
              {/* AQI Message */}
<div className="mt-2 text-sm font-medium leading-snug text-center opacity-0 md:text-base animate-fadeIn">
  {aqiInfo.message}
</div>

  
              {/* Pollutants */}
              <div className="w-full mt-1 space-y-0.5 text-sm text-center delay-200 opacity-0 md:text-base animate-fadeIn">
                <div>PM2.5: {pollutants.pm25} µg/m³</div>
                <div>PM10: {pollutants.pm10} µg/m³</div>
                <div>SO₂: {pollutants.so2} µg/m³</div>
                <div>NO₂: {pollutants.no2} µg/m³</div>
                <div>O₃: {pollutants.o3} µg/m³</div>
                <div>CO: {pollutants.co} µg/m³</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
};

export default Sidebar;
