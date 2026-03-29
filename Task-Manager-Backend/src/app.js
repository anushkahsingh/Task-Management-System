
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger/openapi");
const rateLimiter = require("./middlewares/rateLimiter");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/teams", require("./routes/team"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/users", require("./routes/user"));
app.use("/api/sprints", require("./routes/sprint"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
module.exports = app;
