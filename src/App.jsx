import React from 'react';
import Sidebar from './components/Sidebar'; // Import the Sidebar component

const App = () => {
  return (
    <div className="flex">
      <Sidebar/>
      <div className="flex-1 p-4"> {/* Add padding to the content area */}
        {/* Your other components or content go here */}
        {/* Example: */}
        {/* <Home /> */}
      </div>
    </div>
  );
};

export default App;
