
const User = require("../models/User");

exports.list = async (req, res) => {
  const users = await User.find({}, "email role");
  res.json(users);
};

exports.findByEmail = async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
