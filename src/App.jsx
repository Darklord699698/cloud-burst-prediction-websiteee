import React from 'react';


import Sidebar from './components/Sidebar';
import Main from './components/Main';

const App = () => {
  return (
    <div className="flex">
      <Sidebar/>
      <div className="w-full ml-64">
        <Main />
      </div>
    </div>
  );
};

export default App;
