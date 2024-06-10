require("dotenv").config();
require("./models/connection");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var shopsRouter = require("./routes/shops");
var bikesRouter = require("./routes/bikes");
var brandsRouter = require("./routes/brands");
var bookingsRouter = require("./routes/bookings");
var usersRouter = require("./routes/users");

var app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/shops", shopsRouter);
app.use("/bikes", bikesRouter);
app.use("/brands", brandsRouter);
app.use("/bookings", bookingsRouter);
app.use("/users", usersRouter);

module.exports = app;
