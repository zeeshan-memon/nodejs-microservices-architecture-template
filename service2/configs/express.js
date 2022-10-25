const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const methodOverride = require('method-override');

module.exports = (app) => {
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
      limit: "500mb",
    })
  );

  app.use(morgan("dev"));
  app.disable("x-powered-by");
  app.use(methodOverride());
  app.use(cors());
  app.use(compression({ threshold: 0 }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type,multipart/form-data"
    );
    next();
  });
};
