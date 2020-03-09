const express = require("express");
const xslx = require("xlsx");
const path = require("path");
const app = express();
const fileupload = require("express-fileupload");
const fs = require("fs");
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

            function getWords(word, row, callback){
                db.query("SELECT * FROM directory WHERE words LIKE '%"+word+"%'", (err,res_cek) => {
                    if(res_cek.length==0){
                        db.query("SELECT * FROM junk_word WHERE false_word LIKE '%"+word+"%'", (err, badword) => {
                            if(badword.length==0){
                                var split = ({id_project_temp: project[0].id_project_temp, rowinxls: row, splitwords: word, istrue_words: 2})
                                db.query("INSERT INTO split_words set ?", split,(err)=>{})
                                return callback(null, {id_project_temp: project[0].id_project_temp, rowinxls: word, splitwords: word, istrue_words: 2})
                            }else{
                                var split = ({id_project_temp: project[0].id_project_temp, rowinxls: row, splitwords: word, istrue_words: 0})
                                db.query("INSERT INTO split_words set ?", split,(err)=>{})
                                return callback(null, {id_project_temp: project[0].id_project_temp, rowinxls: word, splitwords: word, istrue_words: 0})
                            }
                        })
                    }else{
                        var split = ({id_project_temp: project[0].id_project_temp, rowinxls: row, splitwords: word, istrue_words: 1})
                        db.query("INSERT INTO split_words set ?", split,(err)=>{})
                        return callback(null, {id_project_temp: project[0].id_project_temp, rowinxls: row, splitwords: word, istrue_words: 1})
                    }
                })
            }

            for(var i=0;i<data.length;i++){
                // json.push({ID: data[i].ID, merek: data[i].merek, tipe_mobil: data[i].tipe_mobil});
                let data_temp = ({id_project: req.params.filexls,merek_mobil_temp: data[i].merek, tipe_mobil_temp: data[i].tipe_mobil});
                // db.query("INSERT INTO data_temp set ?", data_temp,(err) => {})
                var str = data[i].merek.split(" "); // pisah kata berdasarkan spasi
                for(var x=0;x<str.length;x++){
                    var no = i+1
                    var row = "B"+no
                    if(str[x]!=""){
                        var wordcheck = str[x];
                        if(/\s/.test(wordcheck)){
                            var theword = wordcheck.replace(/\s/, '');
                        }else{
                            var theword = wordcheck
                        }
                        getWords(theword, row, function(err, data){
                            console.log(data)
                        })
                        // db.query("SELECT * FROM directory WHERE words LIKE '%"+theword+"%'", (err,res_cek) => {
                        //     if(res_cek.length==0){
                        //         var split = ({id_project_temp: project[0].id_project_temp, rowinxls: i, splitwords: theword, istrue_words: 0})
                        //         fs.writeFile('cleaning.json', split,(err)=>{})
                        //         console.log(split)
                        //     }else{
                        //         var split = ({id_project_temp: project[0].id_project_temp, rowinxls: i, splitwords: str[x], istrue_words: 1})
                        //         fs.writeFile('cleaning.json', split,(err)=>{})
                        //         console.log(split)
                        //     }
                        // })
                    }
                }
            }

            // console.log(json)
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