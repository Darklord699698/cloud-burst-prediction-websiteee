import React, { useState } from 'react';
import Main from './components/Main';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Location from './components/Location';
import Forecast from './components/Forecast';
import Analytics from './components/Analytics';
import CalendarPage from './components/Calendar';
import SettingsPage from './components/Settings';

const App = () => {
  const [searchedCity, setSearchedCity] = useState(null);
  const [activePage, setActivePage] = useState('home');

  return (
    <div>
      {/* Show Header only on the home page */}
      {activePage === 'home' && <Header onSearch={setSearchedCity} />}

      <div className="flex">
      <Sidebar
  onNavigate={setActivePage}
  selectedCity={searchedCity || "Bengaluru, IN"} // default if null
/>

        <div className="w-full p-6 ml-64">
          {activePage === 'home' && <Main searchedCity={searchedCity} />}
          {activePage === 'location' && <Location />}
          {activePage === 'forecast' && <Forecast searchedCity={searchedCity} />}
          {activePage === 'analytics' && <Analytics searchedCity={searchedCity} />}
          {activePage === 'calendar' && <CalendarPage />}
          {activePage === 'settings' && <SettingsPage />}
        </div>
      </div>
    </div>
  );
};

export default App;
