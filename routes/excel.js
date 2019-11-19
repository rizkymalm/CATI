const express = require("express");
const excelController = require("../controllers/excel.js");
const fileupload = require("express-fileupload");
const Router = express.Router();
const app = express();

app.use(fileupload());
Router.get("/readfile/:filexls", excelController.getExcel);
Router.get("/upload", excelController.getDataExcel);
Router.post("/save", excelController.saveExcel);


module.exports = Router;