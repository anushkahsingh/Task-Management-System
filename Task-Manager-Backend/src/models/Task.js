
const mongoose = require("mongoose");
module.exports = mongoose.model("Task", new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, default: "todo" }, // todo, in-progress, done, backlog
  priority: { type: String, enum: ["lowest", "low", "medium", "high", "highest"], default: "medium" },
  type: { type: String, enum: ["task", "bug", "story", "epic"], default: "task" },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: "Sprint" },
  labels: [String],
  estimate: { type: Number, default: 0 },
  dueDate: Date
}, { timestamps: true }));
