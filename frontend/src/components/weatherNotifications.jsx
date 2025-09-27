import axios from "axios";

export const getWeatherNotification = async (city) => {
  try {
    // Check if notifications are enabled
    const notificationsEnabled = localStorage.getItem("notificationsEnabled");
    if (notificationsEnabled === "false") {
      return null; // do not generate new notifications
    }

    const apiKey = "7b3ffbfe64a1f83e9f112cb4896344ad";
    const res = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
    );

    const data = res.data;
    const temp = data.current.temp_c;
    const condition = data.current.condition.text;

    // Creative message based on weather
    let message = `Weather in ${city}: ${condition}, ${temp}°C.`;
    if (condition.toLowerCase().includes("rain")) message = `🌧️ Don't forget your umbrella in ${city}!`;
    if (condition.toLowerCase().includes("sun")) message = `🌞 It's a sunny day in ${city} — perfect for outdoors!`;
    if (condition.toLowerCase().includes("cloud")) message = `☁️ Cloudy vibes in ${city} today.`;

    return message;
  } catch (err) {
    console.error("Weather notification fetch error:", err);
    return null;
  }
};
