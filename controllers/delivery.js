const express = require("express");
const db = require("../models/db");
const xslx = require("xlsx");
const path = require("path");
const fileupload = require("express-fileupload");
const moment = require("moment")
const app = express();
app.use(fileupload());
exports.getDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        res.render("delivery");
    }
}

exports.getUploadDelivery = (req,res) => {
    // if(req.session.loggedin!=true){
    //     res.redirect("../login")
    // }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        res.render("uploaddelivery", {
            login: login
        });
    // }
}


exports.SaveDelivery = (req,res) => {
    let uploadPath;
    let getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
    var idsales = req.session.idsales;
    var iddealer = req.session.iddealer;
    var filename = req.files.filexls;
    var extension = path.extname(filename.name);
    var newfilename = iddealer+"_"+formatdate+extension
    if(extension==".xlsx" || extension=="xls"){
        var delivery = ({id_dealer: iddealer, id_sales: idsales, filename_exceldlv_temp: newfilename, upload_exceldlv_temp: getdate, delete_exceldlv_temp: "0"});
        db.query("INSERT INTO excel_delivery_temp set ?", delivery,(err,result) => {
            uploadPath = "public/filexls/temp/"+newfilename
            filename.mv(uploadPath, function(err){
                if(err){
                    throw err;
                }else{
                    db.query("SELECT * FROM excel_delivery_temp WHERE filename_exceldlv_temp= ? AND id_sales= ?", [newfilename,idsales],(err1,delivery) => {
                        res.redirect("../delivery/savetemp/"+delivery[0].id_exceldlv_temp)
                    })
                }
            })
        })  
    }else{
        res.send("failed")
    }
}


exports.getDatatempDelivery = (req,res) => {
    db.query("SELECT * FROM excel_delivery_temp ORDER BY id_exceldlv_temp DESC LIMIT 1",(err1,project) => {
        var workbook  = xslx.readFile("public/filexls/temp/"+project[0].filename_exceldlv_temp);
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

            function savetemp(datatemp, loop, callback){
                db.query("INSERT INTO delivery_temp set ?", datatemp,(err,savetemp) => {
                    return callback(null, loop)
                })
            }

            function cekdealer(iddealer, callback){
                db.query("SELECT * FROM dealer WHERE id_dealer='"+iddealer+"'", (err,dealer) => {
                    var check
                    if(dealer!=0){
                        check = "2"
                        return callback(null, check)
                    }else{
                        check = "0"
                        return callback(null, check)
                    }
                })
            }
            for(var i=0;i<data.length;i++){
                // module.exports.datadeal = (iddealer, cb) => {
                //     db.query("SELECT * FROM dealer WHERE id_dealer='"+iddealer+"'", (err,dealer) => {
                //         if(dealer!=0){
                //             var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: "2"})
                //             return cb(insert_temp)
                //         }else{
                //             var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: "0"})
                //             return cb(insert_temp)
                //         }
                //     })
                // }
                data_temp.push({id_delivery: data[i].no, id_dealer: data[i].dealer_name, id_sales: data[i].nama_sales, no_rangka: data[i].no_rangka, no_mesin:data[i].no_mesin, nama_stnk: data[i].nama_stnk, type_kendaraan: data[i].type_kendaraan, warna: data[i].warna, user_name: data[i].nama_user, no_hp: data[i].no_hp, tgl_delivery: data[i].tanggal_delivery});
                // module.exports.datadeal(data[i].dealer_name, (resulta) => {
                //     console.log(resulta)
                // })
                // cekdealer(data[i].dealer_name, function(err,data){
                //     var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: data})
                    
                //     console.log(insert_temp)
                // })
                // console.log(cek)
                // db.query("SELECT * FROM dealer WHERE id_dealer='"+data[i].dealer_name+"'", (err,cekdealer) => {
                    // if (cekdealer.length!=0){
                        
                    // }else{
                        // var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: '0'})
                    // }
                    
                // })
            }

            // console.log(data_temp.length)
            for(var x=0;x<data_temp.length;x++){
                var insert_temp = ({id_delivery_temp: data[x].no, id_dealer_temp: data[x].dealer_name, id_sales_temp: data[x].nama_sales, no_rangka_temp: data[x].no_rangka, no_mesin_temp:data[x].no_mesin, nama_stnk_temp: data[x].nama_stnk, type_kendaraan_temp: data[x].type_kendaraan, warna_temp: data[x].warna, user_name_temp: data[x].nama_user, no_hp_temp: data[x].no_hp, tgl_delivery_temp: data[x].tanggal_delivery, flag_delivery_temp: '2'})
                db.query("INSERT INTO delivery_temp set ?", insert_temp,(err,savetemp) => {
                
                })
            }
            


            // console.log(json)
            // res.render("excel", {
            //     data: data,
            //     jsonxls: json
            // })
        })
    })
}

exports.getExcel = (req,res) => {
    db.query("SELECT * FROM excel_delivery_temp ORDER BY id_exceldlv_temp DESC LIMIT 1",(err1,delivery) => {
        var workbook  = xslx.readFile("public/filexls/temp/"+delivery[0].file_name_temp);
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