const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router();

Router.get("/", reportController.getReport);
Router.get("/import/", reportController.importReport);
Router.post("/save/", reportController.saveReport);
Router.get("/readfile/:filename", reportController.readFileReport);

module.exports = Router