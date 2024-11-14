const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

require("./models");

const indexRouter = require("./routes/index");
const typeRouter = require("./routes/type");
const taskRouter = require("./routes/task");
const legacyTaskRouter = require("./routes/legacy_task");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/", indexRouter);
app.use("/types", typeRouter);
app.use("/tasks", taskRouter);
app.use("/legacy/tasks", legacyTaskRouter);

module.exports = app;
