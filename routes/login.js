const express = require("express");
const Router = express.Router();
const db = require("../models/db");

Router.get("/", (req,res) => {
    res.render("login")
})
Router.post("/auth", (req,res) => {
    var email = req.body.email;
    var pass = req.body.password;
    db.query("SELECT * FROM admin WHERE email_admin = ? AND pass_admin = ? ", [email,pass], function(err, result, fields) {
        if(result.length > 0){
            req.session.loggedin = true;
            req.session.email = result[0].email_admin;
            req.session.idadmin = result[0].id_admin;
        }else{
            res.redirect("/login")
        }
        res.end();
    })
})

module.exports = Router;