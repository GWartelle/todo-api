const express = require("express");
const cookieParser = require("cookie-parser");
// const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

require("./models");

const logger = require("./middlewares/logger");
const verifyToken = require("./middlewares/verifyToken");
const indexRouter = require("./routes/index");
const typeRouter = require("./routes/type");
const taskRouter = require("./routes/task");
const legacyTaskRouter = require("./routes/legacy_task");
const authRouter = require("./routes/auth");

const app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/", indexRouter);
app.use("/types", verifyToken, typeRouter);
app.use("/tasks", verifyToken, taskRouter);
app.use("/auth", authRouter);
app.use("/legacy/tasks", legacyTaskRouter);

app.use((req, res) => {
  res.status(404).send("Not Found");
});

module.exports = app;
