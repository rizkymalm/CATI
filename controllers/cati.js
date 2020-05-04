const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const randomstring = require("randomstring")
const ejs = require("ejs")
const fs = require("fs")

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
    if(panel=="CSI"){
        var table = "service"
        var field = "tgl_uploadsrv"
    }else if(panel=="SSI"){
        var table = "delivery"
        var field = "tgl_uploaddlv"
    }
    db.query("SELECT * FROM "+table+" WHERE "+field+" >= ? AND "+field+" <= ?", [datefrom,dateto], (err, result) => {
        res.render("downloadcati", {
            login: login,
            data: data,
            result: result
        })
    })
}