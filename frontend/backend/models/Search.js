import mongoose from "mongoose";

const searchSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  city:   { type: String, required: true },
  searchedAt: { type: Date, default: Date.now },
}, { collection: "UserData" });   // ✅ use your collection name

export default mongoose.model("UserData", searchSchema);
