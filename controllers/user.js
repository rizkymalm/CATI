const express = require("express");
const db = require("../models/db");

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

        }
    }
}