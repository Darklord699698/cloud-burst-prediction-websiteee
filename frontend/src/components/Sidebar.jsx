// Sidebar.jsx
import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // icons
import { assets } from "../assets/assets"; // Adjust path if needed

const Sidebar = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="fixed z-20 p-2 text-white rounded-md top-4 left-4 bg-cyan-500 hover:bg-cyan-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 w-64 h-full bg-cyan-300 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="flex flex-col h-full gap-8 p-4 mt-24 text-center">
          <li
            className="flex items-center mb-4 ml-10 cursor-pointer hover:opacity-80"
            onClick={() => onNavigate("home")}
          >
            <img src={assets.home} alt="Home" className="w-6 h-6 mr-2" />
            <span className="text-white">Home</span>
          </li>

          <li
            className="flex items-center mb-4 ml-10 cursor-pointer hover:opacity-80"
            onClick={() => onNavigate("forecast")}
          >
            <img src={assets.forecast} alt="Forecast" className="w-6 h-6 mr-2" />
            <span className="text-white">Forecast</span>
          </li>

          <li
            className="flex items-center mb-4 ml-10 cursor-pointer hover:opacity-80"
            onClick={() => onNavigate("location")}
          >
            <img src={assets.location} alt="Location" className="w-6 h-6 mr-2" />
            <span className="text-white">Location</span>
          </li>

          <li
            className="flex items-center mb-4 ml-10 cursor-pointer hover:opacity-80"
            onClick={() => onNavigate("analytics")}
          >
            <img src={assets.Analytics} alt="Analytics" className="w-6 h-6 mr-2" />
            <span className="text-white">Analytics</span>
          </li>

          <li
            className="flex items-center mb-4 ml-10 cursor-pointer hover:opacity-80"
            onClick={() => onNavigate("calendar")}
          >
            <img src={assets.calendar} alt="Calendar" className="w-6 h-6 mr-2" />
            <span className="text-white">Calendar</span>
          </li>

          <li
            className="flex items-center mb-4 ml-10 cursor-pointer hover:opacity-80"
            onClick={() => onNavigate("settings")}
          >
            <img src={assets.settings} alt="Settings" className="w-6 h-6 mr-2" />
            <span className="text-white">Settings</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
