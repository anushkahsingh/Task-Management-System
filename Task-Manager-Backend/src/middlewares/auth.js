
const redis = require("../config/redis");
const { verifyAccess } = require("../utils/jwt");

module.exports = async (req,res,next)=>{
  try{
    const token = req.headers.authorization?.split(" ")[1];
    const d = verifyAccess(token);
    const s = await redis.get(`session:${d.id}`);
    if(!s) return res.status(401).json({message:"Session expired"});
    req.user = d;
    next();
  }catch{
    res.status(401).json({message:"Unauthorized"});
  }
};
