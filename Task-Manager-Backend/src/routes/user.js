
const r = require("express").Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/user");

r.get("/", auth, c.list);
r.get("/email/:email", auth, c.findByEmail);

module.exports = r;
