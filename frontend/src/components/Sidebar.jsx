import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 z-10 w-64 h-full bg-blue-950">
      <ul className="flex flex-col h-full p-4 mt-24 text-center">
        <li className="mb-4 ml-2">
          <Link to="/" className="text-white">Home</Link>
        </li>
        <li className="mb-4 ml-2">
          <Link to="/about" className="text-white">Forecast</Link>
        </li>
        <li className="mb-4 ml-2">
          <Link to="/contact" className="text-white">Location</Link>
        </li>
        <li className="mb-4 ml-2">
          <Link to="/" className="text-white">Analytics</Link>
        </li>
        <li className="mb-4 ml-2">
          <Link to="/about" className="text-white">Calendar</Link>
        </li>
        <li className="mb-4 ml-2">
          <Link to="/contact" className="text-white">Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
