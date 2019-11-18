const express = require("express");
const excelController = require("../controllers/excel.js");
const Router = express.Router();

Router.get("/", excelController.getExcel);
Router.get("/upload", excelController.getDataExcel);
Router.post("/save", function(req,res) {
    res.redirect("/excel/")
});

module.exports = Router;