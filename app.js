const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const boolParser = require("express-query-boolean");
const { HttpCode } = require("./service/constants");


const usersRouter = require("./routes/api/users");

const app = express();


const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(helmet());
app.use(logger(formatsLogger));
app.get("env") !== "test" && app.use(logger(formatsLogger));
app.use(express.static("public"));

app.use(cors());
app.use(express.json({ limit: 10000 }));
app.use(boolParser());


app.use("/users", usersRouter);


app.use((req, res) => {
  res.status(HttpCode.NOT_FOUND).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const status = err.status || HttpCode.INTERNAL_SERVER_ERROR;
  res.status(status).json({
    status: status === HttpCode.INTERNAL_SERVER_ERROR ? "fail" : "error",
    code: status,
    message: err.message,
  });
});

module.exports = app;
