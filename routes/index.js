const express = require("express");
const indexController = require("../controllers/index");
const deliveryController = require("../controllers/delivery");
const serviceController = require("../controllers/service");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.get("/delivery", deliveryController.getDelivery);
Router.get("/delivery/upload", deliveryController.getUploadDelivery);
Router.post("/delivery/save", deliveryController.SaveDelivery);
Router.get("/delivery/savetemp/:filexlsx", deliveryController.getDatatempDelivery);

Router.get("/service", serviceController.getService);
Router.get("/service/upload/", serviceController.getUploadService);
Router.post("/service/save", serviceController.SaveService);
Router.get("/service/savetemp/:idfiles/:filexlsx", serviceController.getDatatempService);
Router.get("/service/detail/:idfiles", serviceController.getDetailFileService);
Router.get("/service/cekfile/:idservice", serviceController.cekFileService);
Router.get("/service/savepermanent/:idfiles", serviceController.SavePermanentService);

module.exports = Router;