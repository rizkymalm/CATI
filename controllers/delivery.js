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
exports.getDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM excel_delivery JOIN sales ON excel_delivery.id_sales=sales.id_sales WHERE excel_delivery.id_sales='"+req.session.idsales+"'", (err,delivery) => {
            res.render("delivery", {
                login: login,
                show: delivery,
                moment: moment
            });
        })
    }
}

exports.getUploadDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        res.render("uploaddelivery", {
            login: login
        });
    }
}


exports.SaveDelivery = (req,res) => {
    let uploadPath;
    let getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
    var idsales = req.session.idsales;
    var iddealer = req.session.iddealer;
    var filename = req.files.filexls;
    var extension = path.extname(filename.name);
    var newfilename = "DLV_"+iddealer+"_"+formatdate+extension
    if(extension==".xlsx" || extension=="xls"){
        var delivery = ({id_dealer: iddealer, id_sales: idsales, filename_exceldlv: newfilename, upload_exceldlv: getdate, delete_exceldlv: "0", type_exceldlv: "0"});
        db.query("INSERT INTO excel_delivery set ?", delivery,(err,result) => {
            uploadPath = "public/filexls/temp/"+newfilename
            filename.mv(uploadPath, function(errupload){
                if(err){
                    throw err;
                }else{
                    db.query("SELECT * FROM excel_delivery WHERE filename_exceldlv= ? AND id_sales= ?", [newfilename,idsales],(err1,delivery) => {
                        if(err1){
                            res.redirect("../delivery/upload/")
                        }else{
                            res.redirect("../delivery/savetemp/"+delivery[0].id_exceldlv +"/"+delivery[0].filename_exceldlv)
                        }
                    })
                }
            })
        })  
    }else{
        res.send("failed")
    }
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
function cekiddelivery(iddelivery){
    return new Promise(resolve => {
        db.query("SELECT * FROM delivery WHERE id_delivery=?", [iddelivery], function(err,result){
            if(result.length>0){
                resolve("0")
            }else{
                resolve("2")
            }
        })
    })
}
exports.getDatatempDelivery = async function(req,res) {
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
                var convertexceldate = (data[i].tanggal_delivery - (25567 + 1)) * 86400 * 1000
                var dateexcel = moment(convertexceldate).format("YYYY-MM-DD HH:mm:ss")
                var mydealer = req.session.iddealer;
                // cek error data
                let dealer = await cekdealer(data[i].dealer_name,mydealer);
                let norangka = await ceknorangka(data[i].no_rangka)
                let iddelivery_cek = await cekiddelivery(data[i].no)
                let flag = "2"
                if (dealer!=true || norangka=="0" || iddelivery_cek=="0"){
                    flag = "0"
                    if(dealer!=true){
                        var errordealer = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "id_dealer", error_word: data[i].dealer_name, error_msg: dealer, error_table: "delivery"})
                        db.query("INSERT INTO error_data set ?", [errordealer],(err) => {
                        })
                    }
                    if(norangka=="0"){
                        var errornorangka = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "no_rangka", error_word: data[i].no_rangka, error_msg: "No rangka tidak valid", error_table: "delivery"})
                        db.query("INSERT INTO error_data set ?", [errornorangka],(err) => {
                        })
                    }
                    if(iddelivery_cek=="0"){
                        var erroriddelivery = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "id_delivery", error_word: data[i].no, error_msg: "No Delivery sudah digunakan", error_table: "delivery"})
                        db.query("INSERT INTO error_data set ?", [erroriddelivery],(err) => {
                        })
                    }
                }
                // end cek error data
                var insert_temp = (
                {
                    id_delivery: data[i].no,
                    id_exceldlv: req.params.idfiles,
                    id_dealer: data[i].dealer_name,
                    id_sales: data[i].nama_sales,
                    no_rangka: data[i].no_rangka,
                    no_mesin:data[i].no_mesin,
                    nama_stnk: data[i].nama_stnk,
                    type_kendaraan: data[i].type_kendaraan,
                    warna: data[i].warna,
                    user_name: data[i].nama_user,
                    no_hp: data[i].no_hp,
                    jk: data[i].jenis_kelamin,
                    tgl_delivery: dateexcel,
                    flag_delivery: flag
                })
                db.query("INSERT INTO delivery_temp set ?", insert_temp,(err,savetemp) => {
                    if (err){
                        console.log(err)
                    }
                })
                console.log(insert_temp)
            }
            res.redirect("../../detail/"+req.params.idfiles)
        })
}


exports.getDetailFileDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM excel_delivery JOIN sales ON excel_delivery.id_sales=sales.id_sales WHERE id_exceldlv='"+req.params.idfiles+"'", (err, files) => {
            if(files[0].type_exceldlv=="0"){
                var table = "delivery_temp"
                var type = "DRAFT"
                var additional = "_temp"
            }else{
                var table = "delivery"
                var type = "FIX"
            }
            db.query("SELECT * FROM "+table+" WHERE id_exceldlv='"+req.params.idfiles+"'",(err,delivery)=>{
                res.render("detaildelivery", {
                    result: delivery,
                    login:login,
                    moment: moment,
                    files: files,
                    type: type,
                    adds : additional,
                    title: "Detail Delivery"
                })
            })
        })
    }
}


exports.getEditFileDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales})
        db.query("SELECT * FROM delivery_temp WHERE id_exceldlv=? AND no_delivery=?", [req.params.idfiles,req.params.iddelivery],(err,delivery) => {
            var iddelivery = delivery[0].id_delivery;
            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_rangka' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,iddelivery],(err2,norangka_err) => {
                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_dealer' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,iddelivery],(err2,iddealer_err) => {
                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_delivery' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,iddelivery],(err2,iddelivery_err) => {
                        if(err){
                            console.log(err)
                        }else{
                            res.render("editdelivery", {
                                login: login,
                                delivery: delivery,
                                moment: moment,
                                norangka_err: norangka_err,
                                iddealer_err: iddealer_err,
                                iddelivery_err: iddelivery_err
                            })
                        }
                    })
                })
            })
        })
    }
}

exports.saveEditFIleDelivery = async function(req,res) {
    var id_exceldlv = req.params.idfiles;
    var id_delivery = req.params.iddelivery
    var deliveryinput = req.body.id_delivery;
    var no_rangka = req.body.no_rangka;
    var no_mesin = req.body.no_mesin;
    var type_kendaraan = req.body.type_kendaraan
    var warna = req.body.warna
    var jk = req.body.jk;
    var nama_stnk = req.body.nama_stnk
    var user_name = req.body.user_name
    var no_hp = req.body.no_hp
    var tgl_delivery = req.body.tgl_delivery
    var id_dealer = req.body.id_dealer
    var id_sales = req.body.id_sales
    var mydealer = req.session.iddealer
    // cek error data
    let dealer = await cekdealer(id_dealer,mydealer);
    let norangka = await ceknorangka(no_rangka)
    let iddelivery_cek = await cekiddelivery(deliveryinput)
    let flag = "2"
    if (dealer!=true || norangka=="0"){
        flag = "0"
        if(dealer!=true){
            var errordealer = ({id_exceldata: id_exceldlv, id_data:id_delivery, error_field: "id_dealer", error_word: id_dealer, error_table: 'delivery', error_msg: dealer})
            db.query("INSERT INTO error_data set ?", [errordealer],(errdealer) => {
            })
        }
        if(norangka=="0"){
            var errornorangka = ({id_exceldata: id_exceldlv, id_data:id_delivery, error_field: "no_rangka", error_word: no_rangka, error_table: 'delivery', error_msg: "No rangka tidak valid"})
            db.query("INSERT INTO error_data set ?", [errornorangka],(errorrangka) => {
            })
        }
    }
    if(dealer==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='id_dealer' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    if(norangka!="0"){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='no_rangka' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    if(iddelivery_cek!="0"){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='id_delivery' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    // end cek error data
    var updatefile = ({id_delivery: deliveryinput,id_dealer: id_dealer, id_sales: id_sales, no_rangka: no_rangka, no_mesin: no_mesin, nama_stnk: nama_stnk, type_kendaraan: type_kendaraan, warna: warna, user_name: user_name, no_hp: no_hp, jk: jk, tgl_delivery: tgl_delivery, flag_delivery: flag})
    console.log(updatefile)
    db.query("UPDATE delivery_temp SET ? WHERE id_exceldlv=? AND no_delivery=?", [updatefile,id_exceldlv,id_delivery], (err, updatefile) => {
        if(err){
            console.log(err)
        }else{
            res.redirect("../../detail/"+id_exceldlv)
        }
    })
}

exports.SavePermanentDelivery = (req,res) => {
    var getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD");
    var formatdateinsert = moment().format("YYYY_MM_DD HH:mm:ss")
    
    db.query("SELECT * FROM excel_delivery WHERE id_exceldlv='"+req.params.idfiles+"'", (err, excelfile) => {
        var newfilename = "DLV_"+excelfile[0].id_dealer+"_"+formatdate+"_"+excelfile[0].id_exceldlv+".xlsx";
        db.query("SELECT * FROM delivery_temp WHERE id_exceldlv='"+req.params.idfiles+"'", (err,res1) => {
            var isifile = [
                ["no", "tanggal_delivery","no_rangka","no_mesin","type_kendaraan","warna","nama_sa","jenis_kelamin","nama_user","nama_stnk","no_hp","delaer_name"]
            ]
            for(var i=0;i<res1.length;i++){
                isifile.push([res1[i].id_delivery,res1[i].tgl_delivery,res1[i].no_rangka,res1[i].no_mesin,res1[i].type_kendaraan,res1[i].warna,res1[i].id_sales,res1[i].jk,res1[i].user_name,res1[i].nama_stnk,res1[i].no_hp,res1[i].id_dealer])
                var savepermanent = (
                    {
                        id_delivery: res1[i].id_delivery,
                        id_exceldlv: res1[i].id_exceldlv,
                        id_dealer: res1[i].id_dealer,
                        id_sales: res1[i].id_sales,
                        no_rangka: res1[i].no_rangka,
                        no_mesin: res1[i]. no_mesin,
                        nama_stnk: res1[i].nama_stnk,
                        type_kendaraan: res1[i].type_kendaraan,
                        warna: res1[i].warna,
                        user_name: res1[i].user_name,
                        no_hp: res1[i].no_hp,
                        jk: res1[i].jk,
                        tgl_delivery: res1[i].tgl_delivery,
                        flag_delivery: "1"
                    })
                db.query("INSERT INTO delivery set ?", [savepermanent],(err1) => {
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
                    db.query("UPDATE excel_delivery SET type_exceldlv = '1', update_exceldlv='"+formatdateinsert+"', filename_exceldlv='"+newfilename+"'", (err2) => {
                        res.redirect("../detail/"+req.params.idfiles)
                    })
                }
            })
        })
    })
}