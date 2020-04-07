const express = require("express");
const db = require("../models/db");
// const CryptoJs = require("crypto-js");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('nissan');
exports.getUser = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM sales", (err,sales) => {
                res.render("user",{
                    login: login,
                    sales: sales
                })
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.getDetailUser = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM sales WHERE id_sales=?", [req.params.idsales],(err, result) => {
                res.render("userdetail", {
                    login: login,
                    sales: result
                })
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.createlUser = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM dealer", (err,dealer) => {
                res.render("createuser", {
                    login: login,
                    result: dealer
                })
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.saveUser = (req,res) => {
    var nama = req.body.nama;
    var email = req.body.email;
    var type = req.body.type_user;
    var dealer = req.body.dealer;
    var initial;
    if(type=="sales"){
        initial = "SLS"
    }else if(type=="caller"){
        initial = "CLR"
    }else if(type=="admin"){
        initial = "ADM"
    }else if(type=="super"){
        initial = "SPR"
    }
    var newpass = 'kadencexnissan'
    const encryptpass = cryptr.encrypt(newpass);
    db.query("SELECT * FROM sales WHERE type_sales=?", [type], (err,restype) => {
        if(restype.length==0){
            var newcode = initial+"10001"
        }else{
            var last = restype.length - 1
            var lastid = restype[last].id_sales.substring(3,8)
            var lastdigit = parseInt(lastid)
            var newdigit = lastdigit + 1
            var newcode = initial+newdigit
        }
        var data = ({id_sales: newcode, id_dealer: dealer, sales_name: nama, sales_email: email, sales_pass: encryptpass, sales_active: "1", type_sales: type})
        db.query("INSERT INTO sales SET ?", [data], (err1,result) => {
            if(err1){
                res.redirect("../user/create")
            }else{
                res.redirect("../user")
            }
        })
    })
}

exports.editUser = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM sales WHERE id_sales=?", [req.params.idsales],(err, result) => {
                res.render("edituser", {
                    login: login,
                    sales: result
                })
            })
        }else{
            res.redirect("../")
        }
    }
}