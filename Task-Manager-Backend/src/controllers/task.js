
const Task = require("../models/Task");

exports.create = async (req,res)=>{
  const t = await Task.create(req.body);
  res.json(t);
};

exports.list = async (req,res)=>{
  const { page=1, limit=100, status, sprint } = req.query;
  const q = { team:req.params.teamId };
  if(status) q.status = status;
  if(sprint) q.sprint = sprint;
  const t = await Task.find(q)
    .populate("assignee", "email role")
    .populate("reporter", "email role")
    .populate("sprint", "name status")
    .sort({ createdAt: -1 })
    .skip((page-1)*limit)
    .limit(+limit);
  res.json(t);
};

exports.update = async (req,res)=>{
  const t = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(t);
};

exports.remove = async (req,res)=>{
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
