
const r = require("express").Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/task");

r.post("/", auth, c.create);
r.get("/:teamId", auth, c.list);
r.put("/:id", auth, c.update);
r.delete("/:id", auth, c.remove);

module.exports = r;
