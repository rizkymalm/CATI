const express = require("express");
const indexController = require("../controllers/index");
const deliveryController = require("../controllers/delivery");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.get("/delivery", deliveryController.getDelivery);
Router.get("/delivery/upload", deliveryController.getUploadDelivery);
Router.post("/delivery/save", deliveryController.SaveDelivery);
Router.get("/delivery/savetemp/:filexlsx", deliveryController.getDatatempDelivery);



module.exports = Router;