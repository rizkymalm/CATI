const express = require("express");
const excelController = require("../controllers/excel.js");
const Router = express.Router();
const app = express();


Router.get("/readfile/:filexls", excelController.getExcel);
Router.get("/upload", excelController.getDataExcel);


module.exports = Router;