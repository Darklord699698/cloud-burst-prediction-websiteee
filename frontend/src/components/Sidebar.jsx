import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { assets } from "../assets/assets";

const Sidebar = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Listen for dark mode changes dynamically
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const menuItems = [
    { key: "home", label: "Home", icon: assets.home },
    { key: "forecast", label: "Forecast", icon: assets.forecast },
    { key: "location", label: "Location", icon: assets.location },
    { key: "analytics", label: "Analytics", icon: assets.Analytics },
    { key: "calendar", label: "Calendar", icon: assets.calendar },
    { key: "settings", label: "Settings", icon: assets.settings },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={`fixed z-20 p-2 rounded-md top-4 left-4 transition-colors duration-300 ${
          isDark
            ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
            : "bg-cyan-500 text-white hover:bg-cyan-600"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 w-64 h-full transform transition-transform duration-300 rounded-r-2xl shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-cyan-300 text-white"
        }`}
      >
        <ul className="flex flex-col h-full gap-6 p-6 mt-24 text-left">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300
                ${
                  isDark
                    ? "hover:bg-gray-700 hover:text-white"
                    : "hover:bg-cyan-400 hover:text-white"
                }`}
              onClick={() => onNavigate(item.key)}
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <span className="font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
