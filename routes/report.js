const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router();

Router.get("/", reportController.getReport);

module.exports = Router