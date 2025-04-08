import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from "chart.js";
import axios from "axios";
import "./ImageSlider.css";
import { assets } from "../assets/assets";

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const images = [
  { src: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/475000/475457-Los-Angeles.jpg", name: "Los Angeles", country: "US" },
  { src: "https://media.cntraveller.com/photos/64f4fc5f663208f83a21af16/3:2/w_3000,h_2000,c_limit/New%20York%20City_GettyImages-1347979016.jpg", name: "New York", country: "US" },
  { src: "https://cdn.choosechicago.com/uploads/2019/06/general-contact-1800x900.jpg", name: "Chicago", country: "US" },
  // Add more images and names as needed
];

const Main = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = "7b3ffbfe64a1f83e9f112cb4896344ad"; // Replace with your actual API key

  const getWeather = async (city, country) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${apiKey}&units=metric`;

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl),
      ]);
      setWeatherData(weatherResponse.data);
      setForecastData(forecastResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data", error);
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather data for the default city when the component mounts
    const { name, country } = images[currentIndex];
    getWeather(name, country);
  }, [currentIndex]); // Fetch data when currentIndex changes

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const generateBarChartData = () => {
    if (!forecastData || !forecastData.list) return {};

    const labels = forecastData.list.slice(0, 8).map((item) => item.dt_txt);
    const data = forecastData.list.slice(0, 8).map((item) => item.pop * 100);

    return {
      labels,
      datasets: [
        {
          label: "Chance of Rain (%)",
          data,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  const generateLineChartData = () => {
    if (!forecastData || !forecastData.list) return {};

    // Create data for temperature timeline (example: next 12 hours)
    const labels = forecastData.list
      .slice(0, 13)
      .map((item) => new Date(item.dt * 1000).getHours() + "h");
    const data = forecastData.list.slice(0, 13).map((item) => item.main.temp);

    return {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(75, 192, 192, 1)",
          pointBorderColor: "#fff",
        },
      ],
    };
  };

  const generate3DayForecast = () => {
    if (!forecastData || !forecastData.list) return [];

    // Process the forecast data for the next 3 days
    const forecast = forecastData.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 3);

    return forecast.map((day) => ({
      date: new Date(day.dt * 1000).toLocaleDateString(),
      temp: day.main.temp,
      weather: day.weather[0].description,
    }));
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
            return value + "%";
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ": " + tooltipItem.raw + "%";
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
        ticks: {
          callback: function (value) {
            return value + "°C";
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ": " + tooltipItem.raw + "°C";
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
              <div className="flex items-center p-2 bg-blue-200 rounded-md">
                <img
                  src={assets.thermometer}
                  alt="Temperature Icon"
                  className="w-6 h-6 mr-2"
                />
                <div>
                  <h3 className="text-sm font-semibold">Temperature</h3>
                  <p className="text-xs">{weatherData.main.temp}°C</p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-blue-200 rounded-md">
                <img
                  src={assets.humidity}
                  alt="Humidity Icon"
                  className="w-6 h-6 mr-2"
                />
                <div>
                  <h3 className="text-sm font-semibold">Humidity</h3>
                  <p className="text-xs">{weatherData.main.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-blue-200 rounded-md">
                <img src={assets.wind} alt="Wind Icon" className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold">Wind</h3>
                  <p className="text-xs">{weatherData.wind.speed} km/h</p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-blue-200 rounded-md">
                <img
                  src={assets.sunset}
                  alt="Sunrise Icon"
                  className="w-6 h-6 mr-2"
                />
                <div>
                  <h3 className="text-sm font-semibold">Sunset</h3>
                  <p className="text-xs">
                    {new Date(
                      weatherData.sys.sunrise * 1000
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-blue-200 rounded-md">
                <img
                  src={assets.sunrise}
                  alt="Sunset Icon"
                  className="w-6 h-6 mr-2"
                />
                <div>
                  <h3 className="text-sm font-semibold">Sunrise</h3>
                  <p className="text-xs">
                    {new Date(
                      weatherData.sys.sunset * 1000
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <h2 className="mt-4 text-xl font-bold">3-Day Forecast</h2>
          {forecastData && (
            <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
              {generate3DayForecast().map((day, index) => (
                <div key={index} className="p-2 bg-blue-200 rounded-md">
                  <h3 className="text-sm font-semibold">{day.date}</h3>
                  <p className="text-xs">Temp: {day.temp}°C</p>
                  <p className="text-xs">Weather: {day.weather}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 mt-4 lg:mt-0 lg:ml-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Chances of Raining</h2>
            <div className="h-48 p-4 bg-pink-200 rounded-md">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <Bar data={generateBarChartData()} options={chartOptions} />
              )}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Temperature Timeline</h2>
            <div className="h-64 p-4 bg-teal-300 rounded-md">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <Line
                  data={generateLineChartData()}
                  options={lineChartOptions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
