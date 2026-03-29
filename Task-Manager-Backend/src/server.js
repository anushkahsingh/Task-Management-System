
require("dotenv").config();
const app = require("./app");
require("./config/db")();
app.listen(process.env.PORT,()=>console.log("Server started"));
