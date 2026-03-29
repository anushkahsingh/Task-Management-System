
const mongoose = require("mongoose");
module.exports = mongoose.model("Sprint", new mongoose.Schema({
  name: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["planned", "active", "completed"], default: "planned" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }
}, { timestamps: true }));
