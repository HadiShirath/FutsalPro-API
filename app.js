var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");

const authRouter = require("./app/auth/router");
const adminRouter = require("./app/admin/router");
const userRouter = require("./app/user/router");
const fieldRouter = require("./app/field/router");
const cartRouter = require("./app/cart/router");
const orderRouter = require("./app/order/router");
const paymentRouter = require("./app/payment/router");
const scheduleRouter = require("./app/schedule/router");

var app = express();
const URL = "/api/v1";
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// API
app.use(`${URL}/auth`, authRouter);
app.use(`${URL}/admin`, adminRouter);
app.use(`${URL}/user`, userRouter);
app.use(`${URL}/field`, fieldRouter);
app.use(`${URL}/cart`, cartRouter);
app.use(`${URL}/order`, orderRouter);
app.use(`${URL}/payment`, paymentRouter);
app.use(`${URL}/schedule`, scheduleRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
