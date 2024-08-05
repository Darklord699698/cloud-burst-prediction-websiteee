import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Chart as ChartJS } from 'chart.js';
import axios from 'axios';
import { assets } from '../assets/assets';
import './ImageSlider.css';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const images = [
  { src: 'https://shorturl.at/55pvK', name: 'Los Angeles', country: 'US' },
  { src: 'https://shorturl.at/D8PGy', name: 'New York', country: 'US' },
  { src: 'https://shorturl.at/MX3Xr', name: 'Chicago', country: 'US' },
  // Add more images and names as needed
];

const Main = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = '7b3ffbfe64a1f83e9f112cb4896344ad';  // Replace with your actual API key

  const getWeather = async (city, country) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${apiKey}&units=metric`;

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);
      setWeatherData(weatherResponse.data);
      setForecastData(forecastResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data', error);
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather data for the default city when the component mounts
    const { name, country } = images[currentIndex];
    getWeather(name, country);
  }, [currentIndex]);  // Fetch data when currentIndex changes

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const generateChartData = () => {
    if (!forecastData || !forecastData.list) return {};

    const labels = forecastData.list.slice(0, 8).map(item => item.dt_txt);
    const data = forecastData.list.slice(0, 8).map(item => item.pop * 100);

    return {
      labels,
      datasets: [
        {
          label: 'Chance of Rain (%)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
        },
        ticks: {
          autoSkip: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
        ticks: {
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw + '%';
          },
        },
      },
    },
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
          <h2 className="mt-4 text-xl font-bold">Current Weather</h2>
          {weatherData && (
            <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Temperature</h3>
                <p className="text-xs">{weatherData.main.temp}°C</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Humidity</h3>
                <p className="text-xs">{weatherData.main.humidity}%</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Wind</h3>
                <p className="text-xs">{weatherData.wind.speed} km/h</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Sunrise</h3>
                <p className="text-xs">{new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-md">
                <h3 className="text-sm font-semibold">Sunset</h3>
                <p className="text-xs">{new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 mt-4 lg:mt-0 lg:ml-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Chances of Raining</h2>
            <div className="h-48 p-4 bg-blue-200 rounded-md">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <Bar data={generateChartData()} options={chartOptions} />
              )}
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold">3-Day Forecast</h2>
            {forecastData && (
              <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
                {forecastData.list.slice(0, 3).map((item, index) => (
                  <div key={index} className="p-2 bg-blue-200 rounded-md">
                    <h3 className="text-sm font-semibold">Day {index + 1}</h3>
                    <p className="text-xs">{item.pop * 100}% chance of rain</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
