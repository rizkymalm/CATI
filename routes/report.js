const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router();

Router.get("/", reportController.getReport);
Router.get("/list/", reportController.listReport);
Router.get("/import/", reportController.importReport);
Router.get("/update/:idfiles/:filename/:panel", reportController.updateReport);
Router.post("/save/", reportController.saveReport);
Router.get("/readfile/:idfiles/:filename/:panel", reportController.readFileReport);
Router.post("/saveupdate/:idfiles/:filename/:panel", reportController.saveUpdateReport);
Router.get("/readfileupdate/:idfiles/:filename/:panel", reportController.readFileUpdateReport);
Router.get("/download/:iddealer/:panel", reportController.downloadReport);
module.exports = Router