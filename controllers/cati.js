const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const randomstring = require("randomstring")
const ejs = require("ejs")
const xlsfile = require("node-xlsx");
const fs = require("fs");

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


exports.downloadCatiFile = (req,res) => {
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
    db.query("SELECT * FROM "+table+" WHERE "+field+" >= ? AND "+field+" <= ?", [datefrom,dateto], (err, result) => {
        var header = [
            [
                "Dateofsent",
                "DealerName",
                "DealerCity",
                "DealerRegion",
                "DealerCode",
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
        var isifile = []
        for (let i = 0; i < result.length; i++) {
            if(panel=="CSI"){
                isifile.push([
                    result[i].tgl_uploadsrv,
                    result[i].dealername_srv,
                    result[i].dealercity_srv,
                    result[i].dealerregion_srv,
                    result[i].id_dealer,
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
                    result[i].id_dealer,
                    result[i].dealername_dlv,
                    result[i].dealercity_dlv,
                    result[i].dealerregion_dlv,
                    result[i].no_rangka,
                    result[i].user_name,
                    result[i].no_hp,
                    result[i].type_kendaraan,
                    result[i].tgl_service,
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