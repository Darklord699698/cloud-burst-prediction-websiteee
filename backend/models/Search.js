// models/Search.js
import mongoose from "mongoose";

const SearchSchema = new mongoose.Schema({
  city: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ force collection name to match Atlas collection
export default mongoose.model("UserData", SearchSchema, "UserData");
