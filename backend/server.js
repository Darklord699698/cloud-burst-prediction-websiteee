import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import UserData from "./models/Search.js";

dotenv.config();

const app = express();

// ✅ CORS setup
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // other dev frontend
    "https://cloud-burst-prediction-web.onrender.com" // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ✅ Remove app.options("*", ...) to avoid PathError

app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Route: store search
app.post("/api/search", async (req, res) => {
  try {
    const { city, userId } = req.body;
    if (!city || !userId) return res.status(400).json({ message: "City and userId are required" });

    await UserData.create({ city, userId });
    res.json({ message: "Search saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
