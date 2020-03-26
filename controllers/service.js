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
                moment: moment,
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
                    db.query("UPDATE excel_service SET type_excelsrv = '1', update_excelsrv='"+formatdateinsert+"', filename_excelsrv='"+newfilename+"' WHERE id_excelsrv='"+req.params.idfiles+"'", (err2) => {
                        res.redirect("../detail/"+req.params.idfiles)
                    })
                }
            })
        })
    })
}

function cekdealer(iddealer,yourdealer){
    return new Promise (resolve => {
        var query = "SELECT * FROM dealer WHERE id_dealer = ?";
        db.query(query, [iddealer], function(err, dealer, fields){
            if(err){
                console.log(err)
            }else{
                if(dealer!=0){
                    if(iddealer==yourdealer){
                        resolve(true)
                    }else{
                        resolve("Kode dealer tidak sesuai dengan dealer anda")
                    }
                }else{
                    resolve("Kode dealer tidak ditemukan")
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
function cekidservice(idservice){
    return new Promise(resolve => {
        db.query("SELECT * FROM service WHERE id_service=?", [idservice], function(err,result){
            db.query("SELECT * FROM service_temp WHERE id_service=?", [idservice], function(err,result_temp){
                if(result.length>0){
                    resolve("No Service sudah digunakan")
                }else if(result_temp.length>0){
                    resolve("No Service sudah digunakan di data temporary")
                }else{
                    resolve(true)
                }
            })
        })
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
            var mydealer = req.session.iddealer;
            // cek error data
            let dealer = await cekdealer(data[i].bengkel,mydealer);
            let norangka = await ceknorangka(data[i].no_rangka)
            let idservice_cek = await cekidservice(data[i].no)
            console.log(idservice_cek)
            let flag = "2"
            if (dealer!=true || norangka=="0" || idservice_cek!=true){
                flag = "0"
                if(dealer!=true){
                    var errordealer = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "id_dealer", error_word: data[i].bengkel, error_msg: dealer, error_table: "service"})
                    db.query("INSERT INTO error_data set ?", [errordealer],(err) => {
                    })
                }
                if(norangka=="0"){
                    var errornorangka = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "no_rangka", error_word: data[i].no_rangka, error_msg: "No rangka tidak valid", error_table: "service"})
                    db.query("INSERT INTO error_data set ?", [errornorangka],(err) => {
                    })
                }
                if(idservice_cek!=true){
                    var erroridservice = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "id_service", error_word: data[i].no, error_msg: idservice_cek, error_table: "service"})
                    db.query("INSERT INTO error_data set ?", [erroridservice],(err) => {
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

exports.getEditFileService = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM service_temp WHERE id_excelsrv=? AND id_service=?", [req.params.idfiles,req.params.idservice],(err,service) => {
            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_rangka' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err1,norangka_err) => {
                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_dealer' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err2,iddealer_err) => {
                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_service' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err3,idservice_err) => {
                        if(err){
                            console.log(err)
                        }else{
                            res.render("editservice", {
                                login: login,
                                service: service,
                                moment: moment,
                                norangka_err: norangka_err,
                                iddealer_err: iddealer_err,
                                idservice_err: idservice_err
                            })
                        }
                    })
                })
            })
        })
    }
}

exports.saveEditFIleService = async function(req,res) {
    var no_rangka = req.body.no_rangka;
    var type_kendaraan = req.body.type_kendaraan
    var id_service = req.body.id_service
    var km = req.body.km
    var no_polisi = req.body.no_polisi
    var nama_stnk = req.body.nama_stnk
    var user_name = req.body.user_name
    var no_hp = req.body.no_hp
    var tgl_service = req.body.tgl_service
    var id_dealer = req.body.id_dealer
    var id_sales = req.body.id_sales
    var mydealer = req.session.iddealer;
    // cek error data
    let dealer = await cekdealer(id_dealer,mydealer);
    let norangka = await ceknorangka(no_rangka)
    let idservice_cek = await cekidservice(id_service)
    let flag = "2"
    if (dealer!=true || norangka=="0" || idservice_cek!=true){
        flag = "0"
        if(dealer!=true){
            var errordealer = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: "id_dealer", error_word: id_dealer, error_table: 'service', error_msg: dealer})
            db.query("INSERT INTO error_data set ?", [errordealer],(errdealer) => {
            })
        }
        if(norangka=="0"){
            var errornorangka = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: "no_rangka", error_word: no_rangka, error_table: 'service', error_msg: "No rangka tidak valid"})
            db.query("INSERT INTO error_data set ?", [errornorangka],(errorrangka) => {
            })
        }
        if(idservice_cek!=true){
            var errornorangka = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: "id_service", error_word: id_service, error_msg: idservice_cek, error_table: "service"})
            db.query("INSERT INTO error_data set ?", [errornorangka],(err) => {
            })
        }
    }
    if(dealer==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='id_dealer' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    if(norangka!="0"){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='no_rangka' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    if(idservice_cek==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='id_service' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    // end cek error data
    var updatefile = ({id_service: id_service, id_dealer: id_dealer, id_sales: id_sales, no_rangka: no_rangka, no_polisi: no_polisi, type_kendaraan: type_kendaraan, km: km, nama_stnk: nama_stnk, user_name: user_name, no_hp: no_hp, tgl_service: tgl_service, flag_service: flag})
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


