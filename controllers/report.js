const express = require("express")
const db = require("../models/db")

exports.getReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            res.render("report",{
                login: login
            })
        }else{
            res.redirect("../")
        }
    }
}