const express = require("express");
const db = require("../models/db");
// const CryptoJs = require("crypto-js");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('nissan');

function countrecord(sql){
    return new Promise(resolve => {
        db.query(sql, function(err,result){
            resolve(result)
        })
    })
}
function pageservice(limit,page,idsales){
    return new Promise(resolve => {
        if(page > 1){
            var start = page * limit - limit
        }else{
            var start = 0;
        }
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales WHERE excel_service.id_sales='"+idsales+"' LIMIT ?, ?", [start,limit], function(err,srv) {
                resolve(srv)
        })
    })
}
exports.getUser = async function(req,res){
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            if(!req.query.page){
                var page = 0;
            }else{
                var page = req.query.page
            }
            var limit = 20
            var sql = "SELECT COUNT(*) AS countrec FROM sales";
            var count = await countrecord(sql);
            var math = Math.ceil(count[0].countrec/limit);
            if(page > 1){
                var start = page * limit - limit
            }else{
                var start = 0;
            }
            var arrpage = []
            var pageint = parseInt(page)
            if(page>2){
                if(page>=math-2){
                    var startarr = page-5
                }else{
                    var startarr = page-3
                }
            }else{
                var startarr = 1
            }
            if(page<=3){
                var endarr = 7
            }else{
                var endarr = pageint+3
            }
            for(var i=startarr;i<=endarr;i++){
                if(i>0 && i<math){
                    arrpage.push(i)
                }
            }
            db.query("SELECT * FROM sales LIMIT ?,?", [start,limit], (err,sales) => {
                res.render("user",{
                    login: login,
                    sales: sales,
                    count: math,
                    page: page,
                    arrpage: arrpage
                })
            })
        }else{
            res.redirect("../")
        }
    }
}

function getDealer(id){
    return new Promise(resolve => {
        db.query("SELECT * FROM dealer WHERE id_dealer=?", id, function(err,result){
            resolve(result)
        })
    })
}

exports.getDetailUser = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM sales WHERE id_sales=?", [req.params.idsales], async function(err, result){
                if(result[0].id_dealer!=""){
                    var dataDealer = await getDealer(result[0].id_dealer)
                    var dealer = ({id_dealer: dataDealer[0].id_dealer, dealername: dataDealer[0].name_dealer, dealercity: dataDealer[0].city_dealer, dealerregion: dataDealer[0].region_dealer, dealergroup: dataDealer[0].brand_dealer, dealertype: dataDealer[0].type_dealer})
                    console.log(dealer)
                }else{
                    var dealer = ({id_dealer: "-", dealername: "-", dealercity: "-", dealerregion: "-", dealergroup: "-", dealertype: "-"})
                }
                res.render("userdetail", {
                    login: login,
                    sales: result,
                    dealer: dealer
                })
            })
        }else{
            res.redirect("../../")
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
                var group = []
                for (let i = 0; i < dealer.length; i++) {
                    if(group.includes(dealer[i].brand_dealer)==false){
                        group.push(dealer[i].brand_dealer)
                    }   
                }
                res.render("createuser", {
                    login: login,
                    result: dealer,
                    group: group
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
    var group = req.body.group;
    var initial;
    if(type=="sales"){
        initial = "SLS"
    }else if(type=="caller"){
        initial = "CLR"
    }else if(type=="admin"){
        initial = "ADM"
    }else if(type=="super"){
        initial = "SPR"
    }else if(type=="coordinator"){
        initial = "COO"
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
        var data = ({id_sales: newcode, id_dealer: dealer, group_dealer: group, sales_name: nama, sales_email: email, sales_pass: encryptpass, sales_active: "1", type_sales: type})
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