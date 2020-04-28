const express = require("express");
const indexController = require("../controllers/index");
const deliveryController = require("../controllers/delivery");
const serviceController = require("../controllers/service");
const profileController = require("../controllers/profile")
const Router = express.Router();

Router.get("/", indexController.getIndex);
Router.get("/delivery", deliveryController.getDelivery);
Router.get("/delivery/page/:page", deliveryController.getPageDelivery);
Router.get("/delivery/upload", deliveryController.getUploadDelivery);
Router.post("/delivery/save", deliveryController.SaveDelivery);
Router.get("/delivery/savetemp/:idfiles/:filexlsx", deliveryController.getDatatempDelivery);
Router.get("/delivery/detail/:idfiles", deliveryController.getDetailFileDelivery);
Router.get("/delivery/detail/:idfiles/:iddelivery", deliveryController.getDetailDataFileDelivery);
Router.get("/delivery/edit/:idfiles/:iddelivery", deliveryController.getEditFileDelivery);
Router.post("/delivery/update/:idfiles/:iddelivery", deliveryController.saveEditFIleDelivery);
Router.post("/delivery/deletecheckdlv/:idfiles", deliveryController.deleteCheckDelivery);
Router.get("/delivery/savepermanent/:idfiles", deliveryController.SavePermanentDelivery);
Router.get("/delivery/remove/:idfiles", deliveryController.removeDelivery);

Router.get("/service", serviceController.getService);
Router.get("/service/page/:page", serviceController.getPageService);
Router.get("/service/upload/", serviceController.getUploadService);
Router.post("/service/save", serviceController.SaveService);
Router.get("/service/savetemp/:idfiles/:filexlsx", serviceController.getDatatempService);
Router.get("/service/detail/:idfiles", serviceController.getDetailFileService);
Router.get("/service/detail/:idfiles/:idservice", serviceController.getDetailDataFileService);
Router.get("/service/edit/:idfiles/:idservice", serviceController.getEditFileService);
Router.post("/service/update/:idfiles/:idservice", serviceController.saveEditFIleService);
Router.post("/service/deletechecksrv/:idfiles", serviceController.deleteCheckService);
Router.get("/service/cekfile/:idservice", serviceController.cekFileService);
Router.get("/service/savepermanent/:idfiles", serviceController.SavePermanentService);
Router.get("/service/remove/:idfiles", serviceController.removeService);

Router.get("/profile/changepass", profileController.changePass)
Router.post("/profile/reqtoken/", profileController.reqToken)
Router.get("/profile/formreset/:token", profileController.formReset)
Router.post("/profile/savenewpass/:token", profileController.saveNewPass)

module.exports = Router;