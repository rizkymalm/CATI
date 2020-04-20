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

function countrecord(sql){
    return new Promise(resolve => {
        db.query(sql, function(err,result){
            resolve(result)
        })
    })
}
function pageservice(limit,page,idsales){
    return new Promise(resolve => {
        if(page > 1){
            var start = page * limit - limit
        }else{
            var start = 0;
        }
        db.query("SELECT * FROM excel_delivery JOIN sales ON excel_delivery.id_sales=sales.id_sales WHERE excel_delivery.id_sales='"+idsales+"' LIMIT ?, ?", [start,limit], function(err,srv) {
                resolve(srv)
        })
    })
}
exports.getDelivery = async function(req,res) {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        var sql = "SELECT COUNT(*) AS countrec FROM excel_delivery WHERE id_sales='"+login.idses+"'"
        var count = await countrecord(sql)
        var math = Math.ceil(count[0].countrec/2)
        db.query("SELECT * FROM excel_delivery JOIN sales ON excel_delivery.id_sales=sales.id_sales WHERE excel_delivery.id_sales='"+req.session.idsales+"' LIMIT 2", (err,delivery) => {
            res.render("delivery", {
                login: login,
                show: delivery,
                moment: moment,
                count: math
            });
        })
    }
}
exports.getPageDelivery = async function(req,res){
    if(req.session.loggedin!=true){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        var page = req.params.page;
        if(!req.params.page){
            var page = 0;
        }else{
            var page = req.query.page
        }
        var sql = "SELECT COUNT(*) AS countrec FROM excel_delivery WHERE id_sales='"+login.idses+"'"
        var count = await countrecord(sql)
        var math = Math.ceil(count[0].countrec/2)
        var show = await pageservice(2,page,login.idses)
        res.render("pageservice", {
            srv: show,
            login: login,
            moment: moment,
            count: math,
            page: page
        })
    }
}
exports.getUploadDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
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
        var delivery = ({id_dealer: iddealer, id_sales: idsales, filename_exceldlv: newfilename, upload_exceldlv: getdate, update_exceldlv: getdate, delete_exceldlv: "0", type_exceldlv: "0"});
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

function cekdealer(iddealer){
    return new Promise (resolve => {
        var query = "SELECT * FROM dealer WHERE id_dealer = ?";
        db.query(query, [iddealer], function(err, dealer, fields){
            if(err){
                console.log(err)
            }else{
                if(dealer!=0){
                   resolve(true)
                }else{
                    resolve("Kode dealer tidak ditemukan")
                }
            }
        })
    })
}
function getdetaildealer(iddealer){
    return new Promise(resolve => {
        db.query("SELECT * FROM dealer WHERE id_dealer=?", [iddealer], function(err,detail){
            if(detail.length==0){
                var datadealer = ({dealername: "", region: "", city: "", type: "", group: ""})    
            }else{
                var datadealer = ({dealername: detail[0].name_dealer, region: detail[0].region_dealer, city: detail[0].city_dealer, type: detail[0].type_dealer, group: detail[0].brand_dealer})
            }
            resolve(datadealer)
        })
    })
}
function ceknorangka(norangka){
    return new Promise(resolve => {
        var count = norangka.length
        if(count != 17){
            resolve(false)
        }else{
            resolve(true)
        }
    })
}

function cektype(type){
    return new Promise(resolve => {
        db.query("SELECT * FROM type_unit WHERE unit=?", [type], function(err,result){
            if(result!=0){
                resolve(true)
            }else{
                resolve("Model not found")
            }
        })
    })
}
function ceknulldata(data, field){
    return new Promise(resolve => {
        if(data=="" || data==undefined || data==" "){
            var jsondata = ({check: false, type: field, data: data})
        }else{
            var jsondata = ({check: true, type: field, data: data})
        }
        resolve(jsondata)
    })
}
function cekinteger(int, field){
    return new Promise(resolve => {
        var parse = parseInt(int)
        var check = Number.isInteger(parse)
        var getfirst = int.toString().substring(0,2)
        if(field=="no_hp"){
            if(check==true){
                if(getfirst!=62){
                    var result = ({msg: "Invalid phone number", field: field, check: false})
                }else{
                    var result = ({check: true})
                }
            }else{
                var result = ({msg: "Harap isi dengan angka", field: field, check: false})
            }
        }else{
            if(check==true){
                var result = ({check: true})
            }else{
                var result = ({msg: "Harap isi dengan angka", field: field, check: false})
            }
        }
        resolve(result)
    })
}
function formatdate(dateinput){
    return new Promise(resolve =>{
        var convertexceldate = (dateinput - (25567 + 1)) * 86400 * 1000
        var dateexcel = moment(convertexceldate).format("YYYY-MM-DD HH:mm:ss")
        resolve(dateexcel);
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
            var uploaddate_covert = await formatdate(data[i]["Date of sent"])
            var dlvdate_convert = await formatdate(data[i]["Delivery Date"])
            var mydealer = req.session.iddealer;
            let flag = "2"
            // check is null
            var no = await ceknulldata(data[i]["No"], "id_delivery")
            var uploaddate = await ceknulldata(data[i]["Date of sent"], "tgl_uploaddlv")
            var iddealer = await ceknulldata(data[i]["Purchase Dealer Code"], "id_dealer")
            var no_rangka = await ceknulldata(data[i]["ChassisNo"], "id_delivery")
            var nama_stnk = await ceknulldata(data[i]["Owner Name"], "nama_stnk")
            var type_kendaraan = await ceknulldata(data[i]["Model"], "type_kendaraan")
            var warna = await ceknulldata(data[i]["Warna Kendaraan"], "warna")
            var user_name = await ceknulldata(data[i]["USER NAME"], "user_name")
            var no_hp = await ceknulldata(data[i]["MobileNo"], "no_hp")
            var no_hpalt = await ceknulldata(data[i]["Alt Contact No"], "no_hpalt")
            var tgl_delivery = await ceknulldata(data[i]["Delivery Date"], "tgl_delivery")
            var sales_name = await ceknulldata(data[i]["Salesperson Name"], "sales_name")
            //
            let type = await cektype(data[i]["Model"]);
            if(no.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no.type, error_word: no.data, error_msg: "No Delivery tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(uploaddate.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: uploaddate.type, error_word: uploaddate.data, error_msg: "Tanggal Upload tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(iddealer.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: iddealer.type, error_word: iddealer.data, error_msg: "Kode Dealer tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(no_rangka.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no_rangka.type, error_word: no_rangka.data, error_msg: "No Rangka tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(nama_stnk.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: nama_stnk.type, error_word: nama_stnk.data, error_msg: "Nama tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(type_kendaraan.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: type_kendaraan.type, error_word: type_kendaraan.data, error_msg: "Type kendaraan tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }else{
                if(type!=true){
                    flag = "0"
                    var errortype = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: "type_kendaraan", error_word: data[i]["Model"], error_msg: type, error_table: "delivery"})
                    db.query("INSERT INTO error_data set ?", [errortype],(err) => {
                    })
                }
            }
            if(warna.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: warna.type, error_word: warna.data, error_msg: "Warna boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(user_name.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: user_name.type, error_word: user_name.data, error_msg: "Nama tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(no_hp.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no_hp.type, error_word: no_hp.data, error_msg: "No Hp tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(tgl_delivery.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: tgl_delivery.type, error_word: tgl_delivery.data, error_msg: "Tanggal Delivery tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            if(sales_name.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: sales_name.type, error_word: sales_name.data, error_msg: "Nama tidak boleh kosong", error_table: "delivery"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                })
            }
            // cek error data
            let dealer = await cekdealer(data[i]["Purchase Dealer Code"]);
            let detaildealer = await getdetaildealer(data[i]["Purchase Dealer Code"])
            let dealername = detaildealer.dealername;
            let dealerregion = detaildealer.region;
            let dealercity = detaildealer.city;
            let dealertype = detaildealer.type;
            let dealergroup = detaildealer.group;
            let norangka = await ceknorangka(data[i]["ChassisNo"])
            let nohpcek = await cekinteger(data[i]["MobileNo"], "no_hp")
            if (dealer!=true || norangka==false || type!=true || nohpcek.check!=true){
                flag = "0"
                if(dealer!=true){
                    var errordealer = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "id_dealer", error_word: data[i].dealer_name, error_msg: dealer, error_table: "delivery"})
                    db.query("INSERT INTO error_data set ?", [errordealer],(err) => {
                    })
                }
                
                if(norangka==false){
                    var errornorangka = ({id_exceldata: req.params.idfiles, id_data:data[i].no, error_field: "no_rangka", error_word: data[i].no_rangka, error_msg: "Invalid Chassis No", error_table: "delivery"})
                    db.query("INSERT INTO error_data set ?", [errornorangka],(err) => {
                    })
                }
                if(nohpcek.check!=true){
                    var errorhp = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: nohpcek.field, error_word: data[i]["MobileNo"], error_msg: nohpcek.msg, error_table: "delivery"})
                    db.query("INSERT INTO error_data set ?", [errorhp],(err) => {
                    })
                }
            }
            // end cek error data
            var insert_temp = (
            {
                id_delivery: no.data,
                tgl_uploaddlv: uploaddate_covert,
                id_exceldlv: req.params.idfiles,
                id_dealer: iddealer.data,
                dealername_dlv: dealername,
                dealercity_dlv: dealerregion,
                dealerregion_dlv: dealercity,
                dealergroup_dlv: dealergroup,
                dealertype_dlv: dealertype,
                no_rangka: no_rangka.data,
                nama_stnk: nama_stnk.data,
                type_kendaraan: type_kendaraan.data,
                warna: warna.data,
                user_name: user_name.data,
                no_hp: no_hp.data,
                no_hpalt: no_hpalt.data,
                tgl_delivery: dlvdate_convert,
                sales_name: sales_name.data,
                flag_delivery: flag
            })
            db.query("INSERT INTO delivery_temp set ?", insert_temp,(err,savetemp) => {
                if (err){
                    console.log(err)
                }
            })
            // console.log(insert_temp)
        }
        res.redirect("../../detail/"+req.params.idfiles)
    })
}


exports.getDetailFileDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        db.query("SELECT * FROM excel_delivery JOIN sales ON excel_delivery.id_sales=sales.id_sales WHERE id_exceldlv=?", [req.params.idfiles],async function(err, files) {
            if(files.length==0){
                res.redirect("../")
            }else{
                if(files[0].type_exceldlv=="0"){
                    var table = "delivery_temp"
                    var type = "DRAFT"
                    var additional = "_temp"
                }else{
                    var table = "delivery"
                    var type = "PERMANENT"
                }
                if(!req.query.page){
                    var page = 0;
                }else{
                    var page = req.query.page
                }
                if(!req.query.show){
                    var limit = 20;
                }else{
                    var limit = req.query.show;
                }
                var sql = "SELECT COUNT(*) AS countrec FROM "+table+" WHERE id_exceldlv='"+req.params.idfiles+"'"
                var count = await countrecord(sql)
                var math = Math.ceil(count[0].countrec/limit)
                if(page > 1){
                    var start = page * limit - limit
                }else{
                    var start = 0;
                }
                var arrpage = []
                var pageint = parseInt(page)
                if(page>2){
                    if(page>=math-2){
                        var startarr = page-5
                    }else{
                        var startarr = page-3
                    }
                }else{
                    var startarr = 1
                }
                if(page<=3){
                    var endarr = 7
                }else{
                    var endarr = pageint+3
                }
                for(var i=startarr;i<=endarr;i++){
                    if(i>0 && i<math){
                        arrpage.push(i)
                    }
                }
                db.query("SELECT * FROM "+table+" WHERE id_exceldlv='"+req.params.idfiles+"' LIMIT ?,?",[start,limit],(err,delivery)=>{
                    res.render("detaildelivery", {
                        result: delivery,
                        login:login,
                        moment: moment,
                        files: files,
                        type: type,
                        adds : additional,
                        count: math,
                        page: page,
                        arrpage: arrpage
                    })
                })   
            }
        })
    }
}

exports.getDetailDataFileDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        db.query("SELECT * FROM excel_delivery JOIN sales ON excel_delivery.id_sales=sales.id_sales WHERE id_exceldlv='"+req.params.idfiles+"'", (err, files) => {
            if(files.length==0){
                res.redirect("../")
            }else{
                if(files[0].type_exceldlv=="0"){
                    var table = "delivery_temp"
                    var type = "DRAFT"
                }else{
                    var table = "delivery"
                    var type = "PERMANENT"
                }
                console.log(files)
                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_rangka' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,norangka_err) => {
                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_dealer' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,iddealer_err) => {
                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='type_kendaraan' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,type_err) => {
                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='nama_stnk' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,namastnk_err) => {
                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='user_name' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,username_err) => {
                                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_hp' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,nohp_err) => {
                                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='warna' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,warna_err) => {
                                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='sales_name' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,saname_err) => {
                                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_delivery' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,tgldlv_err) => {
                                                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_uploaddlv' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,uploaddlv_err) => {
                                                        db.query("SELECT * FROM "+table+" WHERE id_exceldlv='"+req.params.idfiles+"' AND id_delivery='"+req.params.iddelivery+"'",(err,delivery)=>{
                                                            res.render("detaildatadelivery", {
                                                                result: delivery,
                                                                login:login,
                                                                moment: moment,
                                                                files: files,
                                                                type: type,
                                                                norangka_err: norangka_err,
                                                                iddealer_err: iddealer_err,
                                                                type_err: type_err,
                                                                username_err: username_err,
                                                                warna_err: warna_err,
                                                                namastnk_err: namastnk_err,
                                                                nohp_err: nohp_err,
                                                                saname_err: saname_err,
                                                                tgldlv_err: tgldlv_err,
                                                                uploaddlv_err: uploaddlv_err
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            }
        })
    }
}


exports.getEditFileDelivery = (req,res) => {
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        db.query("SELECT * FROM delivery_temp WHERE id_exceldlv=? AND id_delivery=?", [req.params.idfiles,req.params.iddelivery],(err,delivery) => {
            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_rangka' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,norangka_err) => {
                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_dealer' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,iddealer_err) => {
                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='type_kendaraan' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,type_err) => {
                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='nama_stnk' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,namastnk_err) => {
                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='user_name' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,username_err) => {
                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_hp' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,nohp_err) => {
                                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='warna' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,warna_err) => {
                                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='sales_name' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,saname_err) => {
                                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_delivery' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,tgldlv_err) => {
                                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_uploaddlv' AND error_table='delivery' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.iddelivery],(err2,uploaddlv_err) => {
                                                    if(err){
                                                        console.log(err)
                                                    }else{
                                                        res.render("editdelivery", {
                                                            login: login,
                                                            delivery: delivery,
                                                            moment: moment,
                                                            norangka_err: norangka_err,
                                                            iddealer_err: iddealer_err,
                                                            type_err: type_err,
                                                            namastnk_err: namastnk_err,
                                                            username_err: username_err,
                                                            nohp_err: nohp_err,
                                                            warna_err: warna_err,
                                                            saname_err: saname_err,
                                                            tgldlv_err: tgldlv_err,
                                                            uploaddlv_err: uploaddlv_err
                                                        })
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
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
    var upload_dlv = req.body.upload_dlv;
    var id_dealer = req.body.id_dealer;
    var nama_stnk = req.body.nama_stnk;
    var user_name = req.body.user_name;
    var no_hp = req.body.no_hp;
    var no_hpalt = req.body.no_hpalt
    var no_rangka = req.body.no_rangka;
    var model = req.body.model
    var warna = req.body.warna
    var tgl_delivery = req.body.tgl_delivery
    var sa_name = req.body.sa_name
    let detaildealer = await getdetaildealer(id_dealer)
    let dealername = detaildealer.dealername;
    let dealerregion = detaildealer.region;
    let dealercity = detaildealer.city;
    let dealertype = detaildealer.type;
    let dealergroup = detaildealer.group;
    // cek error data
    let dealer = await cekdealer(id_dealer);
    let norangka = await ceknorangka(no_rangka)
    let nohpcek = await cekinteger(no_hp, "no_hp")
    let type = await cektype(model);
    let flag = "2"
    if (dealer!=true || norangka==false || type!=true || nohpcek.check!=true){
        flag = "0"
        if(dealer!=true){
            var errordealer = ({id_exceldata: id_exceldlv, id_data:deliveryinput, error_field: "id_dealer", error_word: id_dealer, error_table: 'delivery', error_msg: dealer})
            db.query("INSERT INTO error_data set ?", [errordealer],(errdealer) => {
            })
        }
        if(norangka=="0"){
            var errornorangka = ({id_exceldata: id_exceldlv, id_data:deliveryinput, error_field: "no_rangka", error_word: no_rangka, error_table: 'delivery', error_msg: "No rangka tidak valid"})
            db.query("INSERT INTO error_data set ?", [errornorangka],(errorrangka) => {
            })
        }
        if(type!=true){
            flag = "0"
            var errortype = ({id_exceldata: req.params.idfiles, id_data:deliveryinput, error_field: "type_kendaraan", error_word: model, error_msg: type, error_table: "delivery"})
            db.query("INSERT INTO error_data set ?", [errortype],(errtype) => {
            })
        }
        if(nohpcek.check!=true){
            flag = "0"
            var errortype = ({id_exceldata: req.params.idfiles, id_data:deliveryinput, error_field: nohpcek.field, error_word: no_hp, error_msg: nohpcek.msg, error_table: "delivery"})
            db.query("INSERT INTO error_data set ?", [errortype],(errtype) => {
            })
        }
    }
    if(dealer==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='id_dealer' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    if(norangka==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='no_rangka' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    if(type==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='type_kendaraan' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    if(nohpcek.check==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='no_hp' AND id_data=? AND error_table='delivery'", [id_exceldlv,id_delivery],(errupdate) => {})
    }
    // end cek error data
    var updatefile = ({id_delivery: deliveryinput, tgl_uploaddlv: upload_dlv, id_dealer: id_dealer, dealername_dlv: dealername, dealercity_dlv: dealercity, dealerregion_dlv: dealerregion, dealertype_dlv: dealertype, dealergroup_dlv: dealergroup, no_rangka: no_rangka, nama_stnk: nama_stnk, type_kendaraan: model, warna: warna, user_name: user_name, no_hp: no_hp, no_hpalt: no_hpalt, tgl_delivery: tgl_delivery, sales_name: sa_name, flag_delivery: flag})
    console.log(updatefile)
    db.query("UPDATE delivery_temp SET ? WHERE id_exceldlv=? AND no_delivery=?", [updatefile,id_exceldlv,id_delivery], (err, updatefile) => {
        if(err){
            console.log(err)
        }else{
            res.redirect("../../detail/"+id_exceldlv)
        }
    })
}
function checkcust(no_rangka){
    return new Promise(resolve => {
        db.query("SELECT * FROM customer WHERE chassis_no=?",[no_rangka], function(err,res){
            if(res.length!=0){
                resolve(true)
            }else{
                resolve(false)
            }
        })
    })
}
exports.SavePermanentDelivery = (req,res) => {
    var getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD");
    var formatdateinsert = moment().format("YYYY_MM_DD HH:mm:ss")
    
    db.query("SELECT * FROM excel_delivery WHERE id_exceldlv='"+req.params.idfiles+"'", (err, excelfile) => {
        var newfilename = "DLV_"+excelfile[0].id_dealer+"_"+formatdate+"_"+excelfile[0].id_exceldlv+".xlsx";
        db.query("SELECT * FROM delivery_temp WHERE id_exceldlv='"+req.params.idfiles+"'", async function(err,res1) {
            var isifile = [
                ["no", "Date of sent","Purchase Dealer Name","Purchase Dealer City","Dealer Region","Purchase Dealer Code","Dealer Type","Dealer Group","Owner Name","USER NAME","MobileNo","Alt Contact No","Model","ChassisNo","Delivery Date","Salesperson Name","Warna Kendaraan"]
            ]
            for(var i=0;i<res1.length;i++){
                isifile.push([res1[i].id_delivery,res1[i].tgl_delivery,res1[i].dealername_dlv,res1[i].dealercity_dlv,res1[i].dealerregion_dlv,res1[i].id_dealer,res1[i].dealertype_dlv,res1[i].dealergroup_dlv,res1[i].nama_stnk,res1[i].user_name,res1[i].no_hp,res1[i].no_hpalt,res1[i].type_kendaraan,res1[i].no_rangka,res1[i].tgl_delivery,res1[i].sales_name,res1[i].warna])
                var savepermanent = (
                    {
                        id_delivery: res1[i].id_delivery,
                        tgl_uploaddlv: res1[i].tgl_uploaddlv,
                        id_exceldlv: res1[i].id_exceldlv,
                        id_dealer: res1[i].id_dealer,
                        dealername_dlv: res1[i].dealername_dlv,
                        dealercity_dlv: res1[i].dealercity_dlv,
                        dealerregion_dlv: res1[i].dealerregion_dlv,
                        dealergroup_dlv: res1[i].dealergroup_dlv,
                        dealertype_dlv: res1[i].dealertype_dlv,
                        no_rangka: res1[i].no_rangka,
                        nama_stnk: res1[i].nama_stnk,
                        type_kendaraan: res1[i].type_kendaraan,
                        warna: res1[i].warna,
                        user_name: res1[i].user_name,
                        no_hp: res1[i].no_hp,
                        no_hpalt: res1[i].no_hpalt,
                        tgl_delivery: res1[i].tgl_delivery,
                        sales_name: res1[i].sales_name,
                        flag_delivery: "1"
                    })
                db.query("INSERT INTO delivery set ?", [savepermanent],(err1) => {
                    if(err1){
                        console.log(err1)
                    }
                })
                var checkcustomer = await checkcust(res1[i].no_rangka)
                if(checkcustomer==false){
                    var savecust = ({
                        chassis_no: res1[i].no_rangka,
                        owner_name: res1[i].nama_stnk,
                        user_name: res1[i].user_name,
                        type_unit: res1[i].type_kendaraan,
                        warna: res1[i].warna,
                        no_hp: res1[i].no_hp,
                        no_hpalt: res1[i].no_hpalt,
                        active_cust: "1"
                    })
                    db.query("INSERT INTO customer SET ?", [savecust],(errcust)=>{})
                }
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
exports.deleteCheckDelivery = (req,res) => {
    var check = req.body.checkdlv;
    for(var i=0;i<check.length;i++){
        db.query("DELETE FROM delivery_temp WHERE id_delivery=? AND id_exceldlv=?", [check[i],req.params.idfiles], (err, del) => {
            
        })
    }
    res.render("partials/actionajax");
}
exports.removeDelivery = (req,res) => {
    var idfiles = req.params.idfiles
    db.query("SELECT * FROM excel_delivery WHERE id_exceldlv=?", [idfiles], (err,delivery) => {
        if(delivery.length==0){
            res.redirect("../")
        }else{
            db.query("DELETE FROM excel_delivery WHERE id_exceldlv=?", [idfiles], (err,del) => {})
            db.query("DELETE FROM delivery_temp WHERE id_exceldlv=?", [idfiles], (err,del) => {})
            db.query("DELETE FROM error_data WHERE id_exceldata=? AND error_table='delivery'", [idfiles], (err,del) => {})
            res.redirect("../")
        }
    })
}