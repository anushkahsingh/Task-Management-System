
const Team = require("../models/Team");
const User = require("../models/User");

exports.create = async (req, res) => {
  const t = await Team.create({ name: req.body.name, members: [req.user.id] });
  res.json(t);
};

exports.list = async (req, res) => {
  const teams = await Team.find({ members: req.user.id }).populate("members", "email role");
  res.json(teams);
};

exports.addMember = async (req, res) => {
  const { teamId, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const team = await Team.findById(teamId);
  if (!team.members.includes(user._id)) {
    team.members.push(user._id);
    await team.save();
  }
  res.json(team);
};

exports.getById = async (req, res) => {
  const team = await Team.findById(req.params.id).populate("members", "email role");
  res.json(team);
};
