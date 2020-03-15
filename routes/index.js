const express = require("express");
const indexController = require("../controllers/index");
const projectController = require("../controllers/project");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.get("/project", projectController.getProject);
Router.get("/project/upload", projectController.getUploadProject);
Router.post("/project/save", projectController.SaveProject);
Router.get("/project/read/:filexlsx", projectController.SaveProject);



module.exports = Router;