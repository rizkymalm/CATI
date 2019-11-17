const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const xslx = require("xlsx");
var workbook  = xslx.readFile("./public/test.xlsx");
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
    console.log(data);
})

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use("/", (err,res) => {
    res.render("index");
})

app.listen(3000, (err) => {
    if(err) throw err;
    console.log("connect")
})