
const bcrypt = require("bcrypt");
const User = require("../models/User");
const redis = require("../config/redis");
const logger = require("../config/logger");
const { signAccess, signRefresh, verifyRefresh } = require("../utils/jwt");

exports.register = async (req,res)=>{
  const hash = await bcrypt.hash(req.body.password,10);
  const u = await User.create({email:req.body.email,password:hash,role:req.body.role||"member"});
  logger.info("REGISTER",{user:u.email});
  res.json({id:u._id});
};

exports.login = async (req,res)=>{
  const u = await User.findOne({email:req.body.email});
  const ok = u && await bcrypt.compare(req.body.password,u.password);
  if(!ok) return res.status(400).json({message:"Invalid"});
  const access = signAccess({id:u._id,role:u.role});
  const refresh = signRefresh({id:u._id});
  await redis.set(`session:${u._id}`,access);
  logger.info("LOGIN",{user:u.email});
  res.json({access,refresh});
};

exports.refresh = async (req,res)=>{
  const d = verifyRefresh(req.body.refreshToken);
  const access = signAccess({id:d.id});
  await redis.set(`session:${d.id}`,access);
  res.json({access});
};
