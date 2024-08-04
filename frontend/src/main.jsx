import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import './index.css'; // Ensure you have your global styles here

const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap your application with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
