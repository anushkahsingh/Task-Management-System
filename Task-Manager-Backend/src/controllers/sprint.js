
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");

exports.create = async (req, res) => {
  const s = await Sprint.create(req.body);
  res.json(s);
};

exports.list = async (req, res) => {
  const s = await Sprint.find({ team: req.params.teamId }).sort({ createdAt: -1 });
  res.json(s);
};

exports.update = async (req, res) => {
  const s = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
};

exports.complete = async (req, res) => {
  const sprintId = req.params.id;
  const sprint = await Sprint.findByIdAndUpdate(sprintId, { status: "completed" }, { new: true });
  
  // In a real Jira, you might move incomplete tasks to the next sprint or backlog.
  // Here we just mark the sprint as completed.
  // Optional: Move tasks without 'done' status to backlog (null sprint)
  await Task.updateMany(
    { sprint: sprintId, status: { $ne: "done" } },
    { sprint: null }
  );

  res.json(sprint);
};
