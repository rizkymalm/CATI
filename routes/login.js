const express = require("express");
const Router = express.Router();
const db = require("../models/db");

Router.get("/", (req,res) => {
    res.render("login", {
        title: "Login"
    })
})
Router.post("/auth", (req,res) => {
    var email = req.body.email;
    var pass = req.body.password;
    db.query("SELECT * FROM sales WHERE sales_email = ? AND sales_pass = ? AND sales_active='1'", [email,pass], function(err, result, fields) {
        if(result.length > 0){
            req.session.loggedin = true;
            req.session.email = result[0].sales_email;
            req.session.salesname = result[0].sales_name;
            req.session.idsales = result[0].id_sales;
            req.session.iddealer = result[0].id_dealer;
            res.redirect("../")
        }else{
            res.redirect("../login")
        }
        res.end();
    })
})

module.exports = Router;