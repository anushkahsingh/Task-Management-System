
const r = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const c = require("../controllers/team");

r.post("/", auth, role("admin"), c.create);
r.get("/", auth, c.list);
r.get("/:id", auth, c.getById);
r.post("/add-member", auth, role("admin"), c.addMember);

module.exports = r;
