const express = require("express");
const Router = express.Router();
const db = require("../models/db");
const CryptoJs = require("crypto-js");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('nissan');
const moment = require("moment")
Router.get("/", (req,res) => {
    res.render("login", {
        title: "Login"
    })
})
Router.post("/auth", (req,res) => {
    var email = req.body.email;
    var pass = req.body.password;
    db.query("SELECT * FROM sales WHERE sales_email = ? AND sales_active='1'", [email], function(err, result, fields) {
        var decryptpass = cryptr.decrypt(result[0].sales_pass)
        if(result.length > 0){
            if(decryptpass==pass){
                var jsonlog = ({id_sales: result[0].id_sales, session_login: moment().format()})
                db.query("SELECT * FROM log_session WHERE id_sales=?", result[0].id_sales, (err1,reslog) => {
                    if(reslog.length==0){
                        db.query("INSERT INTO log_session SET ?", jsonlog, (errlog) => {})
                    }else{
                        db.query("UPDATE log_session SET session_login='"+moment().format()+"' WHERE id_sales='"+result[0].id_sales+"'", (errlog) => {})
                    }
                })
                req.session.loggedin = true;
                req.session.email = result[0].sales_email;
                req.session.salesname = result[0].sales_name;
                req.session.idsales = result[0].id_sales;
                req.session.iddealer = result[0].id_dealer;
                req.session.groupdealer = result[0].group_dealer;
                req.session.type = result[0].type_sales;
                res.redirect("../")
            }else{
                res.redirect("../login")
            }
        }else{
            res.redirect("../login")
        }
        res.end();
    })
})

module.exports = Router;