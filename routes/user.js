const express = require("express");
const userController = require("../controllers/user");
const Router = express.Router();

Router.get("/", userController.getUser);
Router.get("/detail/:idsales", userController.getDetailUser);
Router.get("/create", userController.createlUser);
Router.post("/save", userController.saveUser);
Router.get("/edit/:idsales", userController.editUser);

module.exports = Router