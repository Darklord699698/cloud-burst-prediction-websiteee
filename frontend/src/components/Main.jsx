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
  {src: "https://t3.ftcdn.net/jpg/04/86/28/58/360_F_486285886_6gNLgFgckusuTuDPtSMwSrTu9hualPMU.jpg",name:"Bangalore",country:"IN"},
  { src: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/475000/475457-Los-Angeles.jpg", name: "Los Angeles", country: "US" },
  { src: "https://media.cntraveller.com/photos/64f4fc5f663208f83a21af16/3:2/w_3000,h_2000,c_limit/New%20York%20City_GettyImages-1347979016.jpg", name: "New York", country: "US" },
  { src: "https://cdn.choosechicago.com/uploads/2019/06/general-contact-1800x900.jpg", name: "Chicago", country: "US" },
];

const Main = ({ searchedCity }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState("C"); // default
  const convertTemp = (temp) => {
    return temperatureUnit === "C" ? Math.round(temp) : Math.round(temp * 9 / 5 + 32);
  };
  
  

  const apiKey = "7b3ffbfe64a1f83e9f112cb4896344ad";
  const unsplashAccessKey = "3YqgeNBUUUQ2wMEY4zQUcwN-zyjxwxiv7HyOWcPXV48"; // <-- Replace with your Unsplash access key
const [dynamicImage, setDynamicImage] = useState(null);
useEffect(() => {
  const savedUnit = localStorage.getItem("temperatureUnit");
  if (savedUnit === "F") setTemperatureUnit("F");
  else setTemperatureUnit("C");
}, []);


useEffect(() => {
  const fetchCityImage = async () => {
    if (searchedCity) {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos`,
          {
            params: {
              query: searchedCity + " city",
              orientation: "landscape",
              per_page: 1,
            },
            headers: {
              Authorization: `Client-ID ${unsplashAccessKey}`,
            },
          }
        );

        if (response.data.results.length > 0) {
          setDynamicImage({
            src: response.data.results[0].urls.regular,
            name: searchedCity,
            country: "", // country is not required for display
          });
        } else {
          setDynamicImage(null);
        }
      } catch (err) {
        console.error("Failed to fetch image from Unsplash:", err);
        setDynamicImage(null);
      }
    }
  };

  fetchCityImage();
}, [searchedCity]);


const displayImage = searchedCity
? dynamicImage || images.find((img) => img.name.toLowerCase() === searchedCity.toLowerCase()) || images[currentIndex]
: images[currentIndex];

  useEffect(() => {
    if (searchedCity) {
      const index = images.findIndex(
        (img) => img.name.toLowerCase() === searchedCity.toLowerCase()
      );
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [searchedCity]);
  



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
    if (displayImage) {
      getWeather(displayImage.name, displayImage.country);
    }
  }, [currentIndex, searchedCity]);

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
  
    const labels = forecastData.list
      .slice(0, 13)
      .map((item) => new Date(item.dt * 1000).getHours() + "h");
  
    const data = forecastData.list.slice(0, 13).map((item) => item.main.temp);
  
    return {
      labels,
      datasets: [
        {
          label: `Temperature (°${temperatureUnit})`, // ✅ Make this dynamic
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

    return forecastData.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 3)
      .map((day) => ({
        date: new Date(day.dt * 1000).toLocaleDateString(),
        temp: day.main.temp,
        weather: day.weather[0].description,
      }));
  };

  const isDarkMode = document.documentElement.classList.contains("dark");

  // Get user's preferred temperature unit


// Helper to format rain or temperature values
const formatValue = (value, type = "temp") => {
  if (type === "temp") return `${temperatureUnit === "C" ? Math.round(value) : Math.round(value * 9 / 5 + 32)}°${temperatureUnit}`;
  if (type === "rain") return `${value}%`;
  return value;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { 
        display: true, 
        color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.1)' 
      },
      ticks: { 
        autoSkip: false,
        color: isDarkMode ? '#E5E7EB' : '#1F2937'
      },
    },
    y: {
      grid: { 
        display: true, 
        color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.1)' 
      },
      ticks: { 
        color: isDarkMode ? '#E5E7EB' : '#1F2937', 
        callback: (value) => formatValue(value, "rain") // Rain chances
      },
    },
  },
  plugins: {
    legend: { 
      display: true, 
      position: "top",
      labels: {
        color: isDarkMode ? '#E5E7EB' : '#1F2937'
      }
    },
    tooltip: {
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(243, 244, 246, 0.95)',
      callbacks: {
        label: (tooltipItem) => `${tooltipItem.label}: ${formatValue(tooltipItem.raw, "rain")}`,
      },
    },
  },
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      ticks: { color: isDarkMode ? '#E5E7EB' : '#1F2937' }
    },
    y: {
      grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      ticks: { 
        color: isDarkMode ? '#E5E7EB' : '#1F2937', 
        callback: (value) => formatValue(value, "temp")
      }
    },
  },
  plugins: {
    legend: { labels: { color: isDarkMode ? '#E5E7EB' : '#1F2937' } },
    tooltip: {
      titleColor: isDarkMode ? '#ffffff' : '#111827',
      bodyColor: isDarkMode ? '#ffffff' : '#111827',
      backgroundColor: isDarkMode ? 'rgba(55,65,81,0.9)' : 'rgba(243,244,246,0.95)',
      callbacks: {
        label: (tooltipItem) => `${tooltipItem.label}: ${formatValue(tooltipItem.raw, "temp")}`,
      },
    },
  },
};

  

  return (
    <div className="relative w-full min-h-screen p-6 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 rounded-xl">


      <p>Current location</p>
      
      <h1 className="text-2xl font-bold">{displayImage?.name}</h1>
      <div className="flex flex-col mt-4 lg:flex-row">
        <div className="flex-1">
          <div className="relative">
            <img
              src={displayImage?.src}
              alt={displayImage?.name}
              className="object-cover w-full rounded-md h-80 fade"
            />
            {!searchedCity && (
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
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold">Current Weather</h2>
          {weatherData && (
            <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
              <div className="flex items-center p-2 transition-colors duration-300 bg-blue-200 rounded-md dark:bg-blue-800">
                <img src={assets.thermometer} className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold">Temperature</h3>
                  <p className="text-xs">
                  {convertTemp(weatherData.main.temp)}°{temperatureUnit}

  </p>
                </div>
              </div>
              <div className="flex items-center p-2 transition-colors duration-300 bg-blue-200 rounded-md dark:bg-blue-800">
                <img src={assets.humidity} className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold">Humidity</h3>
                  <p className="text-xs">{weatherData.main.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center p-2 transition-colors duration-300 bg-blue-200 rounded-md dark:bg-blue-800">
                <img src={assets.wind} className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold">Wind</h3>
                  <p className="text-xs">{weatherData.wind.speed} km/h</p>
                </div>
              </div>
              <div className="flex items-center p-2 transition-colors duration-300 bg-blue-200 rounded-md dark:bg-blue-800">
                <img src={assets.sunrise} className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold">Sunrise</h3>
                  <p className="text-xs">
                    {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-2 transition-colors duration-300 bg-blue-200 rounded-md dark:bg-blue-800">
                <img src={assets.sunset} className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold">Sunset</h3>
                  <p className="text-xs">
                    {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

<h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
  3-Day Forecast
</h2>
{forecastData && (
  <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-3">
    {generate3DayForecast().map((day, index) => (
      <div
        key={index}
        className="p-2 transition-colors duration-300 bg-blue-200 rounded-md dark:bg-blue-800"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {day.date}
        </h3>
        <p className="text-xs text-gray-800 dark:text-gray-200">
  Temp: {convertTemp(weatherData.main.temp)}°{temperatureUnit}

</p>

        <p className="text-xs text-gray-800 dark:text-gray-200">
          Weather: {day.weather}
        </p>
      </div>
    ))}
  </div>
)}

        </div>

        <div className="flex-1 mt-4 lg:mt-0 lg:ml-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Chances of Raining</h2>
            <div className="h-48 p-4 transition-colors duration-300 bg-pink-200 rounded-md dark:bg-pink-900">
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
            <div className="h-64 p-4 transition-colors duration-300 bg-teal-300 rounded-md dark:bg-teal-900">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <Line data={generateLineChartData()} options={lineChartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;