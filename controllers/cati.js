const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const randomstring = require("randomstring")
const ejs = require("ejs")
const xlsfile = require("node-xlsx");
const fs = require("fs");
const { resolve } = require("path")

exports.getCatiCtrl = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        res.render("catictrl", {
            login: login
        })
    }
}

function getDealerDetail(id){
    return new Promise(resolve =>{
        db.query("SELECT * FROM dealer WHERE id_dealer=?",id, function(err,result){
            var json = []
            if(err || result.length==0){
                json.push({id_dealer: id, brand_dealer: "", name_dealer: "", region_dealer: "", city_dealer: "", type_dealer: ""})
            }else{
                json.push({id_dealer: id, brand_dealer: result[0].brand_dealer, name_dealer: result[0].name_dealer, region_dealer: result[0].region_dealer, city_dealer: result[0].city_dealer, type_dealer: result[0].type_dealer})
            }
            resolve(json)
        })
    })
}

exports.downloadCatiFile = async function(req,res){
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
    var datefrom = req.body.date_from
    var dateto = req.body.date_to
    var panel = req.body.panel
    var data = ({date_from: datefrom, date_to: dateto, panel: panel})
    var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
    var newfilename = "CATI_"+panel+"_"+formatdate+".xlsx";
    if(panel=="CSI"){
        var table = "service"
        var field = "tgl_uploadsrv"
    }else if(panel=="SSI"){
        var table = "delivery"
        var field = "tgl_uploaddlv"
    }
    db.query("SELECT * FROM "+table+" WHERE "+field+" >= ? AND "+field+" <= ?", [datefrom,dateto], async function(err, result){
        if(panel=="CSI"){
            var header = [
                [
                    "Dateofsent",
                    "DealerName",
                    "DealerCity",
                    "DealerRegion",
                    "DealerCode",
                    "DealeryType",
                    "DealeryGroup",
                    "OwnerName",
                    "MainUserName",
                    "MobileNo",
                    "altMobileNo",
                    "Model",
                    "ChassisNo",
                    "permanentRegNo",
                    "Km",
                    "servicedate",
                    "SAName"
                ]
            ]
        }else{
            var header = [
                [
                    "Dateofsent",
                    "DealerName",
                    "DealerCity",
                    "DealerRegion",
                    "DealerCode",
                    "DealeryType",
                    "DealeryGroup",
                    "OwnerName",
                    "MainUserName",
                    "MobileNo",
                    "altMobileNo",
                    "Model",
                    "ChassisNo",
                    "DeliveryDate",
                    "SAName"
                ]
            ]
        }
        var isifile = []
        for (let i = 0; i < result.length; i++) {
            var detailDealer = await getDealerDetail(result[i].id_dealer)
            console.log(detailDealer)
            if(panel=="CSI"){
                isifile.push([
                    result[i].tgl_uploadsrv,
                    result[i].dealername_srv,
                    result[i].dealercity_srv,
                    result[i].dealerregion_srv,
                    result[i].id_dealer,
                    detailDealer[0].brand_dealer,
                    detailDealer[0].type_dealer,
                    result[i].nama_stnk,
                    result[i].user_name,
                    result[i].no_hp,
                    result[i].no_hpalt,
                    result[i].type_kendaraan,
                    result[i].no_rangka,
                    result[i].no_polisi,
                    result[i].km,
                    result[i].tgl_service,
                    result[i].name_sa
                ])
            }else{
                isifile.push([
                    result[i].tgl_uploaddlv,
                    result[i].dealername_dlv,
                    result[i].dealercity_dlv,
                    result[i].dealerregion_dlv,
                    result[i].id_dealer,
                    detailDealer[0].brand_dealer,
                    detailDealer[0].type_dealer,
                    result[i].nama_stnk,
                    result[i].user_name,
                    result[i].no_hp,
                    result[i].no_hpalt,
                    result[i].type_kendaraan,
                    result[i].no_rangka,
                    result[i].tgl_delivery,
                    result[i].sales_name
                ])
            }
        }
        var createfile = header.concat(isifile)
        const progress = xlsfile.build([{name: panel, data: createfile}])
        fs.writeFile("public/filexls/cati/"+newfilename, progress, (errwritefile) => {
            res.render("downloadcati", {
                login: login,
                data: data,
                result: result,
                newfilename: newfilename
            })
        })
    })
}