const express = require("express");
const db = require("../models/db");
const xslx = require("xlsx");
const xlsfile = require("node-xlsx");
const path = require("path");
const fileupload = require("express-fileupload");
const moment = require("moment")
const app = express();
const fs = require("fs");
app.use(fileupload());
exports.getService = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales WHERE excel_service.id_sales='"+login.idses+"'", (err,srv) => {
            res.render("services", {
                login: login,
                srv: srv,
                title: "Service List"
            });  
        })
    }
}

exports.getUploadService = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        res.render("uploadservice", {
            login: login,
            title: "Upload File Service"
        });
    }
}

exports.getDetailFileService = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales WHERE id_excelsrv='"+req.params.idfiles+"'", (err, files) => {
            if(files[0].type_excelsrv=="0"){
                var table = "service_temp"
                var type = "DRAFT"
                var additional = "_temp"
            }else{
                var table = "service"
                var type = "PERMANENT"
            }
            db.query("SELECT * FROM "+table+" WHERE id_excelsrv='"+req.params.idfiles+"'",(err,service)=>{
                res.render("detailservice", {
                    result: service,
                    login:login,
                    moment: moment,
                    files: files,
                    type: type,
                    adds : additional,
                    title: "Detail Service"
                })
            })
        })
    }
}

exports.SaveService = (req,res) => {
    let uploadPath;
    let getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
    var idsales = req.session.idsales;
    var iddealer = req.session.iddealer;
    var filename = req.files.filexls;
    var extension = path.extname(filename.name);
    var newfilename = "SRV_"+iddealer+"_"+formatdate+extension
    if(extension==".xlsx" || extension=="xls"){
        var service = ({id_dealer: iddealer, id_sales: idsales, filename_excelsrv: newfilename, upload_excelsrv: getdate, delete_excelsrv: "0", update_excelsrv: getdate, type_excelsrv: "0"});
        db.query("INSERT INTO excel_service set ?", service,(err,result) => {
            uploadPath = "public/filexls/temp/"+newfilename
            filename.mv(uploadPath, function(err){
                if(err){
                    throw err;
                }else{
                    db.query("SELECT * FROM excel_service WHERE filename_excelsrv=? AND id_sales= ?", [newfilename,idsales],(err1,service) => {
                        if(err1){
                            res.redirect("../service/upload/")
                        }else{
                            res.redirect("../service/savetemp/"+service[0].id_excelsrv +"/"+service[0].filename_excelsrv)
                        }
                    })
                }
            })
        })  
    }else{
        res.send("failed")
    }
}

exports.SavePermanentService = (req,res) => {
    var getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD");
    var formatdateinsert = moment().format("YYYY_MM_DD HH:mm:ss")
    
    db.query("SELECT * FROM excel_service WHERE id_excelsrv='"+req.params.idfiles+"'", (err, excelfile) => {
        var newfilename = "SRV_"+excelfile[0].id_dealer+"_"+formatdate+"_"+excelfile[0].id_excelsrv+".xlsx";
        db.query("SELECT * FROM service_temp WHERE id_excelsrv='"+req.params.idfiles+"'", (err,res1) => {
            var isifile = [
                ["no", "jenis_kelamin","no_rangka","type_kendaraan","nama_stnk","nama_user","no_hp","no_hp_2","no_polisi","tgl_service","km","bengkel","nama_sa"]
            ]
            for(var i=0;i<res1.length;i++){
                isifile.push([res1[i].id_service,res1[i].jk,res1[i].no_rangka,res1[i].type_kendaraan,res1[i].nama_stnk,res1[i].user_name,res1[i].no_hp,"-",res1[i].no_rangka,res1[i].tgl_service,res1[i].km,res1[i].id_dealer,res1[i].id_sales])
                var savepermanent = (
                    {
                        id_service: res1[i].id_service,
                        id_excelsrv: res1[i].id_excelsrv,
                        id_dealer: res1[i].id_dealer,
                        id_sales: res1[i].id_sales,
                        no_rangka: res1[i].no_rangka,
                        no_polisi: res1[i]. no_polisi,
                        type_kendaraan: res1[i].type_kendaraan,
                        km: res1[i].km,
                        nama_stnk: res1[i].nama_stnk,
                        user_name: res1[i].user_name,
                        jk: res1[i].jk,
                        no_hp: res1[i].no_hp,
                        tgl_service: res1[i].tgl_service,
                        flag_service: "1"
                    })
                    console.log(savepermanent)
                db.query("INSERT INTO service set ?", [savepermanent],(err1) => {
                    if(err1){
                        console.log(err1)
                    }
                })
            }
            const progress = xlsfile.build([{name: "demo_sheet", data: isifile}])
            fs.writeFile("public/filexls/fix/"+newfilename, progress, (err) => {
                if(err){
                    console.log(err)
                }else{
                    db.query("UPDATE excel_service SET type_excelsrv = '1', update_excelsrv='"+formatdateinsert+"', filename_excelsrv='"+newfilename+"'", (err2) => {
                        res.redirect("../detail/"+req.params.idfiles)
                    })
                }
            })
        })
    })
}

function cekdealer(iddealer){
    return new Promise (resolve => {
        var query = "SELECT * FROM dealer WHERE id_dealer = ?";
        db.query(query, [iddealer], function(err, dealer, fields){
            if(err){
                console.log(err)
            }else{
                if(dealer!=0){
                    resolve("2")
                }else{
                    resolve("0")
                }
            }
        })
    })
}
function ceknorangka(norangka){
    return new Promise(resolve => {
        var count = norangka.length
        if(count != 17){
            resolve("0")
        }else{
            resolve("2")
        }
    })
}
exports.getDatatempService = async function(req,res) {
    
    var workbook  = xslx.readFile("public/filexls/temp/"+req.params.filexlsx);
    var sheetname_list = workbook.SheetNames;
    sheetname_list.forEach(async function(y){
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
            var convertexceldate = (data[i].tgl_service - (25567 + 1)) * 86400 * 1000
            var dateexcel = moment(convertexceldate).format("YYYY-MM-DD HH:mm:ss")
            // cek error data
            let dealer = await cekdealer(data[i].bengkel);
            let norangka = await ceknorangka(data[i].no_rangka)
            let flag = "2"
            if (dealer=="0" || norangka=="0"){
                flag = "0"
                if(dealer=="0"){
                    var errordealer = ({id_excelsrv: req.params.idfiles, id_service:data[i].no, error_field: "id_dealer", error_word: data[i].bengkel, error_msg: "Kode dealer tidak ditemukan", error_table: "service"})
                    db.query("INSERT INTO error_data set ?", [errordealer],(errdealer) => {
                    })
                }
                if(norangka=="0"){
                    var errornorangka = ({id_excelsrv: req.params.idfiles, id_service:data[i].no, error_field: "no_rangka", error_word: data[i].no_rangka, error_msg: "No rangka tidak valid", error_table: "service"})
                    db.query("INSERT INTO error_data set ?", [errornorangka],(errorrangka) => {
                    })
                }
            }
            // end cek error data
            var insert_temp = (
            {
                id_service: data[i].no,
                id_excelsrv: req.params.idfiles,
                id_dealer: data[i].bengkel,
                id_sales: data[i].nama_sa,
                no_rangka: data[i].no_rangka,
                no_polisi: data[i].no_polisi,
                type_kendaraan: data[i].type_kendaraan,
                km: data[i].km,
                nama_stnk: data[i].nama_stnk,
                user_name: data[i].nama_user,
                jk: data[i].jenis_kelamin,
                no_hp: data[i].no_hp,
                tgl_service: dateexcel,
                flag_service: flag
            })
            db.query("INSERT INTO service_temp set ?", insert_temp,(err,savetemp) => {
                if (err){
                    console.log(err)
                }
            })
        }
        res.redirect("../../detail/"+req.params.idfiles)
    })
    // db.query("SELECT * FROM excel_service_temp WHERE id_excelsrv_temp='"+req.params.filexlsx+"'",(err1,project) => {
    //     var workbook  = xslx.readFile("public/filexls/temp/"+project[0].filename_excelsrv_temp);
    //     var sheetname_list = workbook.SheetNames;
    //     sheetname_list.forEach(function(y){
    //         var worksheet = workbook.Sheets[y];
    //         var headers = {};
    //         var data = [];
    //         for(z in worksheet){
    //             if(z[0] === '|')continue;
    //             var tt = 0;
    //             for (let i = 0; i < z.length; i++) {
    //                 if(!isNaN(z[i])){
    //                     tt = i;
    //                     break;
    //                 }
    //             };
    //             var col = z.substring(0,tt)
    //             var row = parseInt(z.substring(tt));
    //             var value = worksheet[z].v;
    //             //store header names
    //             if(row == 1 && value) {
    //                 headers[col] = value;
    //                 continue;
    //             }
    //             if(!data[row]) data[row]={};
    //             data[row][headers[col]] = value;
    //         }
    //         data.shift();
    //         data.shift();
    //         var json = []
    //         var data_temp = []

    //         function savetemp(datatemp, loop, callback){
    //             db.query("INSERT INTO service_temp set ?", datatemp,(err,savetemp) => {
    //                 return callback(null, loop)
    //             })
    //         }

    //         function cekdealer(iddealer, callback){
    //             db.query("SELECT * FROM dealer WHERE id_dealer='"+iddealer+"'", (err,dealer) => {
    //                 var check
    //                 if(dealer!=0){
    //                     check = "2"
    //                     return callback(null, check)
    //                 }else{
    //                     check = "0"
    //                     return callback(null, check)
    //                 }
    //             })
    //         }
    //         for(var i=0;i<data.length;i++){
    //             // module.exports.datadeal = (iddealer, cb) => {
    //             //     db.query("SELECT * FROM dealer WHERE id_dealer='"+iddealer+"'", (err,dealer) => {
    //             //         if(dealer!=0){
    //             //             var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: "2"})
    //             //             return cb(insert_temp)
    //             //         }else{
    //             //             var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: "0"})
    //             //             return cb(insert_temp)
    //             //         }
    //             //     })
    //             // }
    //             var dateexcel = moment(data[i].tgl_service).format("YYYY-MM-DD HH:mm:ss")
    //             var insert_temp = (
    //                 {
    //                     id_service_temp: data[i].no,
    //                     id_dealer: data[i].bengkel,
    //                     id_sales: data[i].nama_sa,
    //                     no_rangka_temp: data[i].no_rangka,
    //                     no_polisi_temp: data[i].no_polisi,
    //                     type_kendaraan_temp: data[i].type_kendaraan,
    //                     km_temp: data[i].km,
    //                     nama_stnk_temp: data[i].nama_stnk,
    //                     user_name_temp: data[i].nama_user,
    //                     jk_temp: data[i].jenis_kelamin,
    //                     no_hp_temp: data[i].no_hp,
    //                     tgl_service_temp: dateexcel,
    //                     flag_service_temp: '2'
    //                 })
    //             let log = await cekdealer(data[i].dealer_name)
    //             console.log(log)
    //             data_temp.push({id_delivery: data[i].no, id_dealer: data[i].dealer_name, id_sales: data[i].nama_sales, no_rangka: data[i].no_rangka, no_mesin:data[i].no_mesin, nama_stnk: data[i].nama_stnk, type_kendaraan: data[i].type_kendaraan, warna: data[i].warna, user_name: data[i].nama_user, no_hp: data[i].no_hp, tgl_delivery: data[i].tanggal_delivery});
    //             // db.query("INSERT INTO service_temp set ?", insert_temp,(err,savetemp) => {
    //             //     res.redirect("service/cekfile/"+req.params.filexlsx)
    //             // })
    //             // console.log(i)
    //             // module.exports.datadeal(data[i].dealer_name, (resulta) => {
    //             //     console.log(resulta)
    //             // })
    //             // cekdealer(data[i].dealer_name, function(err,data){
    //             //     var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: data})
                    
    //             //     console.log(insert_temp)
    //             // })
    //             // console.log(cek)
    //             // db.query("SELECT * FROM dealer WHERE id_dealer='"+data[i].dealer_name+"'", (err,cekdealer) => {
    //                 // if (cekdealer.length!=0){
                        
    //                 // }else{
    //                     // var insert_temp = ({id_delivery_temp: data[i].no, id_dealer_temp: data[i].dealer_name, id_sales_temp: data[i].nama_sales, no_rangka_temp: data[i].no_rangka, no_mesin_temp:data[i].no_mesin, nama_stnk_temp: data[i].nama_stnk, type_kendaraan_temp: data[i].type_kendaraan, warna_temp: data[i].warna, user_name_temp: data[i].nama_user, no_hp_temp: data[i].no_hp, tgl_delivery_temp: data[i].tanggal_delivery, flag_delivery_temp: '0'})
    //                 // }
                    
    //             // })
    //         }
            


    //         // console.log(json)
    //         // res.render("excel", {
    //         //     data: data,
    //         //     jsonxls: json
    //         // })
    //     })
    // })
}

exports.getEditFileService = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM service_temp WHERE id_excelsrv=? AND id_service=?", [req.params.idfiles,req.params.idservice],(err,service) => {
            db.query("SELECT * FROM error_data WHERE id_excelsrv=? AND id_service=? AND error_field='no_rangka' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err2,norangka_err) => {
                db.query("SELECT * FROM error_data WHERE id_excelsrv=? AND id_service=? AND error_field='id_dealer' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err2,iddealer_err) => {
                    if(err){
                        console.log(err)
                    }else{
                        res.render("editservice", {
                            login: login,
                            service: service,
                            moment: moment,
                            norangka_err: norangka_err,
                            iddealer_err: iddealer_err
                        })
                    }
                })
            })
        })
    }
}

exports.saveEditFIleService = async function(req,res) {
    var no_rangka = req.body.no_rangka;
    var type_kendaraan = req.body.type_kendaraan
    var km = req.body.km
    var no_polisi = req.body.no_polisi
    var nama_stnk = req.body.nama_stnk
    var user_name = req.body.user_name
    var no_hp = req.body.no_hp
    var tgl_service = req.body.tgl_service
    var id_dealer = req.body.id_dealer
    var id_sales = req.body.id_sales
    // cek error data
    let dealer = await cekdealer(id_dealer);
    let norangka = await ceknorangka(no_rangka)
    let flag = "2"
    if (dealer=="0" || norangka=="0"){
        flag = "0"
        if(dealer=="0"){
            var errordealer = ({id_excelsrv: req.params.idfiles, id_service:req.params.idservice, error_field: "id_dealer", error_word: id_dealer, error_msg: "Kode dealer tidak ditemukan"})
            db.query("INSERT INTO error_data set ?", [errordealer],(errdealer) => {
            })
        }
        if(norangka=="0"){
            var errornorangka = ({id_excelsrv: req.params.idfiles, id_service:req.params.idservice, error_field: "no_rangka", error_word: no_rangka, error_msg: "No rangka tidak valid"})
            db.query("INSERT INTO error_data set ?", [errornorangka],(errorrangka) => {
            })
        }
    }
    if(dealer!="0"){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_excelsrv = ? AND error_field='id_dealer' AND id_service=?", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    if(norangka!="0"){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_excelsrv = ? AND error_field='no_rangka' AND id_service=?", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    // end cek error data
    var updatefile = ({id_dealer: id_dealer, id_sales: id_sales, no_rangka: no_rangka, no_polisi: no_polisi, type_kendaraan: type_kendaraan, km: km, nama_stnk: nama_stnk, user_name: user_name, no_hp: no_hp, tgl_service: tgl_service, flag_service: flag})
    db.query("UPDATE service_temp SET ? WHERE id_excelsrv=? AND id_service=?", [updatefile,req.params.idfiles,req.params.idservice], (err, updatefile) => {
        if(err){
            console.log(err)
        }else{
            res.redirect("../../detail/"+req.params.idfiles)
        }
    })
}


exports.cekFileService = (req,res) => {
    res.send("cekfile")
}


