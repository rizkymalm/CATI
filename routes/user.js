const express = require("express");
const userController = require("../controllers/user");
const Router = express.Router();

Router.get("/", userController.getUser);
Router.get("/detail/:idsales", userController.getDetailUser);

module.exports = Router