import React from 'react';
import { assets } from "../assets/assets.js";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 text-white bg-slate-200">
      <div className="flex-1"></div>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 pr-10 text-black bg-gray-300 rounded-full focus:outline-none"
        />
        <img
          src={assets.magnifyingglass}
          alt="Search"
          className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 right-3 top-1/2"
        />
      </div>
      <div className="flex items-center justify-end flex-1 space-x-4">
        <img src={assets.notificationbell} alt="Notifications" className="w-6 h-6 cursor-pointer" />
        <img src={assets.user} alt="Profile" className="w-6 h-6 cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;
