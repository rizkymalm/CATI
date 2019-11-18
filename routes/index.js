const express = require("express");
const indexController = require("../controllers/index");
const Router = express.Router();

Router.get("/", indexController.getIndex);



module.exports = Router;