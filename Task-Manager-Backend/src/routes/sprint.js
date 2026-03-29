
const r = require("express").Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/sprint");

r.post("/", auth, c.create);
r.get("/:teamId", auth, c.list);
r.put("/:id", auth, c.update);
r.post("/:id/complete", auth, c.complete);

module.exports = r;
