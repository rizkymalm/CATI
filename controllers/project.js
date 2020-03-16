const express = require("express");
const db = require("../models/db");
const xslx = require("xlsx");
const path = require("path");
const fileupload = require("express-fileupload");
const app = express();
app.use(fileupload());
exports.getProject = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        res.render("project");
    }
}

exports.getUploadProject = (req,res) => {
    // if(req.session.loggedin!=true){
    //     res.redirect("../login")
    // }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        res.render("uploadproject", {
            login: login
        });
    // }
}


exports.SaveProject = (req,res) => {
    let uploadPath;
    let getdate = new Date();
    var filename = req.files.filexls;
    var extension = path.extname(filename.name)
    if(extension==".xlsx" || extension=="xls"){
        var project = ({project_name_temp: req.body.project, file_name_temp: filename.name, upload_date_temp: getdate});
        db.query("INSERT INTO excel_project_temp set ?", project,(err,result) => {
            uploadPath = "public/filexls/temp/"+req.body.project+extension
            filename.mv(uploadPath, function(err){
                if(err){
                    throw err;
                }else{
                    db.query("SELECT * FROM excel_project_temp ORDER BY id_project_temp DESC LIMIT 1",(err1,project) => {
                        res.redirect("../project/read/"+project[0].id_project_temp)
                    })
                    // res.send("success")
                }
            })
        })  
    }else{
        res.send("failed")
    }
        // var filename = req.files.filexls;
        // var extension = path.extname(filename.name)
        // console.log(extension)
        // if(extension==".xlsx" || extension==".xls"){
        //     var project = ({project_name_temp: req.body.project, file_name_temp: filename.name, upload_date_temp: getdate});
        //     db.query("INSERT INTO excel_project_temp set ?", project,(err,result) => {
        //         uploadPath = "public/filexls/temp/"+filename.name
        //         filename.mv(uploadPath, function(err){
        //             if(err){
        //                 throw err;
        //             }else{
        //                 db.query("SELECT * FROM excel_project_temp ORDER BY id_project_temp DESC LIMIT 1",(err1,project) => {
        //                     res.redirect("../project/read/"+project[0].id_project_temp)
        //                 })
        //             }
        //         })
        //     })
        // }else{
        //     res.send("Sorry cannot upload file "+extension+" file must be .xls or .xlsx")
        // }
}


exports.getDataProject = (req,res) => {
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
            var data_temp = []

            for(var i=0;i<data.length;i++){
                // json.push({ID: data[i].ID, merek: data[i].merek, tipe_mobil: data[i].tipe_mobil});
                data_temp.push({id_delivery: data[i].no, id_dealer: data[i].dealer_name, id_sales: data[i].nama_sales, no_rangka: data[i].no_rangka, no_mesin:data[i].no_mesin, nama_stnk: data[i].nama_stnk, type_kendaraan: data[i].type_kendaraan, warna: data[i].warna, user_name: data[i].nama_user, no_hp: data[i].no_hp, tgl_delivery: data[i].tgl_delivery});
            }

            console.log(data_temp)

            // console.log(json)
            // res.render("excel", {
            //     data: data,
            //     jsonxls: json
            // })
        })
    })
}