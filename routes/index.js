const express = require("express");
const indexController = require("../controllers/index");
const deliveryController = require("../controllers/delivery");
const serviceController = require("../controllers/service");
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.get("/delivery", deliveryController.getDelivery);
Router.get("/delivery/upload", deliveryController.getUploadDelivery);
Router.post("/delivery/save", deliveryController.SaveDelivery);
Router.get("/delivery/savetemp/:idfiles/:filexlsx", deliveryController.getDatatempDelivery);
Router.get("/delivery/detail/:idfiles", deliveryController.getDetailFileDelivery);
Router.get("/delivery/edit/:idfiles/:iddelivery", deliveryController.getEditFileDelivery);
Router.post("/delivery/update/:idfiles/:iddelivery", deliveryController.saveEditFIleDelivery);
Router.get("/delivery/savepermanent/:idfiles", deliveryController.SavePermanentDelivery);

Router.get("/service", serviceController.getService);
Router.get("/service/upload/", serviceController.getUploadService);
Router.post("/service/save", serviceController.SaveService);
Router.get("/service/savetemp/:idfiles/:filexlsx", serviceController.getDatatempService);
Router.get("/service/detail/:idfiles", serviceController.getDetailFileService);
Router.get("/service/edit/:idfiles/:idservice", serviceController.getEditFileService);
Router.post("/service/update/:idfiles/:idservice", serviceController.saveEditFIleService);
Router.get("/service/cekfile/:idservice", serviceController.cekFileService);
Router.get("/service/savepermanent/:idfiles", serviceController.SavePermanentService);

module.exports = Router;