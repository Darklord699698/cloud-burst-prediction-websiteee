import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { assets } from '../assets/assets';
import './ImageSlider.css';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const images = [
  { src: 'https://media.tacdn.com/media/attractions-content--1x-1/10/47/5a/bf.jpg', name: 'Los Angeles, CA, USA' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1200px-New_york_times_square-terabass.jpg', name: 'New York, NY, USA' },
  { src: 'https://i.natgeofe.com/n/6c531f9e-081f-45cb-ae6c-42bed4c67f45/chicago-travel_4x3.jpg', name: 'Chicago, IL, USA' },
  // Add more images and names as needed
];

const Main = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = '7b3ffbfe64a1f83e9f112cb4896344ad';  // Replace with your actual API key

  const getWeather = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      setWeatherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data', error);
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather data for the default city when the component mounts
    getWeather('New York');
  }, []);  // Empty dependency array ensures this runs only once on mount

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const generateChartData = () => {
    if (!weatherData || !weatherData.weather) return {};

    // Create dummy data for chart (example purposes)
    const labels = ['12:00', '15:00', '18:00', '21:00'];
    const data = [10, 20, 30, 40];  // Replace with actual data if needed

    return {
      labels,
      datasets: [
        {
          label: 'Chance of Rain (%)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="p-4">
      <p>Current location</p>
      <h1 className="text-2xl font-bold">{images[currentIndex].name}</h1>
      <div className="flex flex-col mt-4 lg:flex-row">
        <div className="flex-1">
          <div className="relative">
            <img 
              src={images[currentIndex].src} 
              alt={images[currentIndex].name} 
              className="object-cover w-full rounded-md h-80 fade"
            />
            <div className="absolute inset-0 flex items-center justify-between px-4 py-2">
              <button 
                onClick={handlePrevious} 
                className="px-4 py-2 text-white bg-gray-500 rounded"
              >
                Previous
              </button>
              <button 
                onClick={handleNext} 
                className="px-4 py-2 text-white bg-gray-500 rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 mt-4 lg:mt-0 lg:ml-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Chances of Raining</h2>
            <div className="h-24 p-4 bg-blue-200 rounded-md">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <Bar data={generateChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">3-Day Forecast</h2>
            <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Day 1</h3>
                <p className="text-xs">20% chance of rain</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Day 2</h3>
                <p className="text-xs">10% chance of rain</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Day 3</h3>
                <p className="text-xs">30% chance of rain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Today's highlights</h2>
        <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-20 p-2 bg-blue-200 rounded-md">
            <h3 className="text-sm font-semibold">Precipitation</h3>
            <p className="text-xs">2%</p>
          </div>
          <div className="h-20 p-2 bg-blue-200 rounded-md">
            <h3 className="text-sm font-semibold">Humidity</h3>
            <p className="text-xs">87%</p>
          </div>
          <div className="h-20 p-2 bg-blue-200 rounded-md">
            <h3 className="text-sm font-semibold">Wind</h3>
            <p className="text-xs">0 km/hr</p>
          </div>
          <div className="h-20 p-2 bg-blue-200 rounded-md">
            <h3 className="text-sm font-semibold">Sunrise & Sunset</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <img src={assets.sunrise} className="w-4 h-4" alt="Sunrise" />
                <p className="text-xs">6:18am</p>
              </div>
              <div className="flex items-center space-x-1">
                <img src={assets.sunset} className="w-4 h-4" alt="Sunset" />
                <p className="text-xs">7:27pm</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-64 p-4 mt-8 bg-blue-300 rounded-md">
          <h3 className="text-xl font-semibold">Today Week</h3>
          <div className="flex items-center justify-center h-full">
            <p className="text-center">Image placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
