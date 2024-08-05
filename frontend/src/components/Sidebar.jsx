import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';  // Adjust the path as needed

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 z-10 w-64 h-full bg-cyan-300">
      <ul className="flex flex-col h-full gap-8 p-4 mt-24 text-center">
        <li className="flex items-center mb-4 ml-10">
          <img src={assets.home} alt="Home" className="w-6 h-6 mr-2" />  {/* Adjust the icon size as needed */}
          <Link to="/" className="text-white">Home</Link>
        </li>
        <li className="flex items-center mb-4 ml-10">
          <img src={assets.forecast} alt="Forecast" className="w-6 h-6 mr-2" />
          <Link to="/Forecast" className="text-white">Forecast</Link>
        </li>
        <li className="flex items-center mb-4 ml-10">
          <img src={assets.location} alt="Location" className="w-6 h-6 mr-2" />
          <Link to="/Location" className="text-white">Location</Link>
        </li>
        <li className="flex items-center mb-4 ml-10">
          <img src={assets.Analytics} alt="Analytics" className="w-6 h-6 mr-2" />
          <Link to="/Analytics" className="text-white">Analytics</Link>
        </li>
        <li className="flex items-center mb-4 ml-10">
          <img src={assets.calendar} alt="Calendar" className="w-6 h-6 mr-2" />
          <Link to="/Calendar" className="text-white">Calendar</Link>
        </li>
        <li className="flex items-center mb-4 ml-10">
          <img src={assets.settings} alt="Settings" className="w-6 h-6 mr-2" />
          <Link to="/Settings" className="text-white">Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
