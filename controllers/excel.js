const express = require("express");
const xslx = require("xlsx");
const path = require("path");
const app = express();
const fileupload = require("express-fileupload");
const db = require("../models/db");

app.use(fileupload());

exports.getExcel = (req,res) => {
    db.query("SELECT * FROM excel_project_temp ORDER BY id_project_temp DESC LIMIT 1",(err1,project) => {
        var workbook  = xslx.readFile("public/filexls/temp/"+project[0].file_name_temp);
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
            var json = []

            function getWords(words, callback){
                db.query("SELECT * FROM directory WHERE words LIKE '"+words+"%'", (err,res_cek) => {
                    if(res_cek.length==0){
                        json.push({category: "merek", words: words, type: "bad"})
                        callback(null,json)
                    }else{
                        json.push({category: "merek", words: words, type: "good"})
                        callback(null,json)
                    }
                })
            }

            for(var i=0;i<data.length;i++){
                // json.push({ID: data[i].ID, merek: data[i].merek, tipe_mobil: data[i].tipe_mobil});
                let data_temp = ({id_project: req.params.filexls,merek_mobil_temp: data[i].merek, tipe_mobil_temp: data[i].tipe_mobil});
                // db.query("INSERT INTO data_temp set ?", data_temp,(err) => {})
                var str = data[i].merek.split(" ");
                for(var x=0;x<str.length;x++){
                    if(str[x]!=""){
                        // console.log(i+","+x+" ->"+str[x]);
                        var theword = str[x];
                        getWords(theword, function(err,data){
                            if(err)
                                console.log("error")
                            else
                                // console.log(data)
                                json.push(data)
                        })
                    }
                }
            }
            console.log(json)
            // res.render("excel", {
            //     data: data,
            //     jsonxls: json
            // })
        })
    })
}

exports.getDataExcel = (req,res) => {
    var filename = req.body.filexls;
    res.render("upload");
}

exports.saveExcel = (req,res) => {
    let uploadPath;
    let getdate = new Date();
    if (!req.files || Object.keys(req.files).length === 0) {
        res.send('no file uploaded');
    }else{
        var filename = req.files.filexls;
        var extension = path.extname(filename.name)
        if(extension==".xlsx" || extension==".xls"){
            var project = ({project_name_temp: req.body.project, file_name_temp: filename.name, upload_date_temp: getdate});
            db.query("INSERT INTO excel_project_temp set ?", project,(err,result) => {
                uploadPath = "public/filexls/temp/"+filename.name
                filename.mv(uploadPath, function(err){
                    if(err){
                        throw err;
                    }else{
                        db.query("SELECT * FROM excel_project_temp ORDER BY id_project_temp DESC LIMIT 1",(err1,project) => {
                            res.redirect("readfile/"+project[0].id_project_temp)
                        })
                    }
                })
            })
        }else{
            res.send("Sorry cannot upload file "+extension+" file must be .xls or .xlsx")
        }
    }
}