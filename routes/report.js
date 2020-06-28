const express = require("express");
const reportController = require("../controllers/report");
const Router = express.Router();

Router.get("/", reportController.getReport);
Router.get("/list/", reportController.listReport);
Router.get("/import/", reportController.importReport);
Router.get("/update/:idfiles/:filename/:panel", reportController.updateReport);
Router.post("/save/", reportController.saveReport);
Router.get("/readfile/:idfiles/:filename/:panel/:week", reportController.readFileReport);
Router.post("/saveupdate/:idfiles/:filename/:panel", reportController.saveUpdateReport);
Router.get("/readfileupdate/:idfiles/:filename/:panel", reportController.readFileUpdateReport);
Router.get("/download/dealer/:iddealer/:panel/:week/:month", reportController.downloadReportDealer);
Router.get("/download/cust/:iddealer/:panel/:week/:month", reportController.downloadReportCust);
Router.get("/pdf/download/", reportController.getPdfReport);
Router.get("/pdf/import/", reportController.getPdfImport);
Router.post("/pdf/save/", reportController.savePdfReport);
Router.get("/topline/download/", reportController.getToplineReport);
Router.get("/topline/import/", reportController.getToplineImport);
Router.post("/topline/save/", reportController.saveToplineReport);

Router.get("/ppt/download/", reportController.getPPTReport);
Router.get("/ppt/import/", reportController.getPPTImport);
Router.post("/ppt/save/", reportController.savePPTReport);
module.exports = Router
