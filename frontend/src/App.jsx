import React from 'react';

import Main from './components/Main'
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="w-full ml-64">
          <Main/>
        </div>
      </div>
    </div>
  );
};

export default App;
