const express = require("express");
const xslx = require("xlsx");
const app = express();

exports.getIndex = (req,res) => {
    if(req.session.email==undefined){
        res.redirect("./login")
    }else{
        var workbook  = xslx.readFile("public/test.xlsx");
        var sheetname_list = workbook.SheetNames;
        sheetname_list.forEach(function(y){
            var worksheet = workbook.Sheets[y];
            var headers = {};
            var data = [];
            for(z in worksheet){
                if(z[0] === '|')continue;
                var tt = 0;
                for (let i = 0; i < z.length; i++) {
                    if(!isNaN(z[i])){
                        tt = i;
                        break;
                    }
                };
                var col = z.substring(0,tt)
                var row = parseInt(z.substring(tt));
                var value = worksheet[z].v;
    
                //store header names
                if(row == 1 && value) {
                    headers[col] = value;
                    continue;
                }
    
                if(!data[row]) data[row]={};
                data[row][headers[col]] = value;
            }
            data.shift();
            data.shift();
            // var email = req.session.email
            var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, iddealer: req.session.iddealer})
            res.render("index", {
                data: data,
                login: login,
                title: "Dashboard"
            })
        })
    }  
}

exports.getExcel = (req,res) => {
    res.render("excel");
}