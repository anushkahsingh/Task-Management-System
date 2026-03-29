
const jwt = require("jsonwebtoken");

exports.signAccess = (p)=>jwt.sign(p,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
exports.signRefresh = (p)=>jwt.sign(p,process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.JWT_REFRESH_EXPIRES_IN});
exports.verifyAccess = (t)=>jwt.verify(t,process.env.JWT_SECRET);
exports.verifyRefresh = (t)=>jwt.verify(t,process.env.JWT_REFRESH_SECRET);
