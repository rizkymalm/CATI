const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const randomstring = require("randomstring")
const ejs = require("ejs")
const fs = require("fs")
const sgmail = require("@sendgrid/mail");
const key = process.env.SG_KEY;
const sender = "Nissan x Kadence Indonesia <indonesia@kadence.com>";
const Cryptr = require('cryptr');
const cryptr = new Cryptr('nissan');

exports.changePass = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        res.render("changepass",{
            login: login
        })
    }
}

exports.reqToken = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../login")
    }else{
        sgmail.setApiKey(key);
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        var email = req.body.email
        if(email==login.emailses){
            var alert = ({type: "success", label: "Please check your email"});
            var token = randomstring.generate(50)
            var jsondata = ({token_pass: token, id_sales: login.idses, email_request: email, date_request: moment().format(), used_token: 0})
            db.query("INSERT INTO token_password set ?", [jsondata], (err,result)=>{})
            var template = fs.readFileSync(
                "./views/changepass_email.ejs",
                "utf-8"
            )
            var html = ejs.render(template, {
                token: token,
                login: login
            })
            let msg = {
                to: login.emailses,
                from: sender,
                subject: "Change Password Request",
                html: html
            };
            sgmail.sendMultiple(msg).then(success=>{
            }).catch()
            res.render("partials/actionajax", {
                login: login,
                alert: alert
            })
        }else{
            var alert = ({type: "success", label: "Please try again"});
            res.render("partials/actionajax", {
                login: login,
                alert: alert
            })
        }
        
    }
}

exports.formReset = (req,res) => {
    var token = req.params.token;
    db.query("SELECT * FROM token_password WHERE token_pass=? AND used_token=0", token , (err,result) => {
        if(result.length==0){
            res.redirect("../../login")
        }else{
            res.render("formreset",{
                data: result
            })
        }
    })
}

exports.saveNewPass = (req,res) => {
    var token = req.params.token
    var idsales = req.body.idsales;
    var email = req.body.email;
    var password = req.body.password
    const encryptpass = cryptr.encrypt(password);
    db.query("UPDATE sales SET sales_pass=? WHERE sales_email=? AND id_sales=?", [encryptpass, email, idsales], (err,result) => {
        if(err){
            console.log(err)
        }else{
            db.query("UPDATE token_password SET used_token=1 WHERE token_pass=?", token, (errupdtoken,restoken)=>{})
            req.session.destroy();
            res.redirect("../../login")
        }
    })
}