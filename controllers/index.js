const express = require("express");
const xslx = require("xlsx");
const app = express();
const db = require("../models/db");
const moment = require("moment")


function countservice(iddata, table, field){
    return new Promise(resolve => {
        db.query("SELECT COUNT(*) AS datacount FROM "+table+" WHERE "+field+"=?", [iddata], function(errcount, rescountsrv){
            if(errcount){
                resolve(errcount)
            }else{
                resolve(rescountsrv[0].datacount)
            }
        })
    })
}
function getdatamonth(){
    return new Promise(resolve => {
        var jsondate = []
        for(var i=0;i<=5;i++){
            var getmonth = moment().subtract(i, 'months').format("M")
            var getyear = moment().subtract(i, 'months').format("YYYY")
            jsondate.push({bulan: getmonth, tahun: getyear})
        }
        resolve(jsondate)
    })
}
function jsonstat(month, year){
    return new Promise(resolve => {
        db.query("SELECT * FROM service_temp WHERE MONTH(tgl_service) = ? AND YEAR(tgl_service) = ?", [month,year], function(errmonth, resmon){
            resolve(resmon.length)
        })
    })
}
function getDealerByID(iddealer){
    return new Promise(resolve => {
        db.query("SELECT * FROM dealer WHERE id_dealer=?", [iddealer], function(err, result){
            resolve(result)
        })
    })
}
function updateSession(id){
    return new Promise(resolve => {
        db.query("UPDATE log_session SET session_login='"+moment().format()+"' WHERE id_sales='"+id+"'", (err,result) => {
            resolve(result)
        })
    })
}
exports.getIndex = async function (req,res){
    if(req.session.email==undefined){
        res.redirect("./login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        var getDealer = await getDealerByID(login.iddealerses)
        await updateSession(login.idses)
        db.query("SELECT * FROM excel_service WHERE id_sales=? ORDER BY update_excelsrv DESC LIMIT 5", [login.idses], async function(err,service) {
            var countsrv = 0;
            for(var s=0;s<service.length;s++){
                var getservicecountdata = await countservice(service[s].id_excelsrv, "service_temp", "id_excelsrv")
                countsrv = getservicecountdata+countsrv
            }
            db.query("SELECT * FROM excel_delivery WHERE id_sales=? ORDER BY update_exceldlv DESC LIMIT 5", [login.idses], async function(err,delivery){
                var countdlv = 0;
                for(var d=0;d<delivery.length;d++){
                    var getdeliverycountdata = await countservice(delivery[d].id_exceldlv, "delivery_temp", "id_exceldlv")
                    countdlv = getdeliverycountdata+countdlv
                }
                var getmonths = await getdatamonth()
                var servicechart = []
                for(var m = getmonths.length-1;m>=0;--m){
                    var convertmonth = getmonths[m].bulan
                    var convertyear = getmonths[m].tahun
                    var chart = await jsonstat(convertmonth, convertyear)
                    var n = chart.toString()
                    servicechart.push({value: n, label: convertmonth})
                }
                res.render("index", {
                    service: service,
                    delivery: delivery,
                    moment: moment,
                    login: login,
                    countsrv: countsrv,
                    countdlv: countdlv,
                    servicechart: servicechart,
                    getDealer: getDealer
                })
            })
        })
    }  
}

exports.getExcel = (req,res) => {
    res.render("excel");
}