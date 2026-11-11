const express = require("express");
const cookieParser = require("cookie-parser");
// const logger = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
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

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TO-DO-API",
      version: "1.0.0",
      description: "To do app API, built for MyDigitalSchool course",
      contact: {
        name: "Gabriel Wartelle",
        email: "gabriel.wartelle@my-digital-school.fr",
      },
    },
  },
  apis: ["./routes/task.js", "./routes/index.js"],
};

const swaggerDoc = swaggerJsdoc(swaggerOptions);

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/types", verifyToken, typeRouter);
app.use("/tasks", verifyToken, taskRouter);
app.use("/legacy/tasks", legacyTaskRouter);

app.use((req, res) => {
  res.status(404).send("Not Found");
});

module.exports = app;
