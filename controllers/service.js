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


function updateSession(id){
    return new Promise(resolve => {
        db.query("UPDATE log_session SET session_login='"+moment().format()+"' WHERE id_sales='"+id+"'", (err,result) => {
            resolve(result)
        })
    })
}
function countrecord(sql){
    return new Promise(resolve => {
        db.query(sql, function(err,result){
            resolve(result)
        })
    })
}
function pageservice(limit,page,iddealer,type){
    return new Promise(resolve => {
        if(page > 1){
            var start = page * limit - limit
        }else{
            var start = 0;
        }
        if(type=="super"){
            var sql = ""
        }else{
            var sql = "WHERE excel_service.id_dealer='"+iddealer+"'"
        }
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales "+sql+" ORDER BY update_excelsrv DESC LIMIT ?, ?", [start,limit], function(err,srv) {
            resolve(srv)
        })
    })
}
exports.getService = async function(req,res) {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        await updateSession(login.idses)
        var limit = 20
        if(!req.query.page){
            var page = 0;
        }else{
            var page = req.query.page
        }
        if(login.typeses=="super"){
            var sqlcount = "SELECT COUNT(*) AS countrec FROM excel_service"
            var sql = ""
        }else{
            var sqlcount = "SELECT COUNT(*) AS countrec FROM excel_service WHERE id_dealer='"+login.iddealerses+"'"
            var sql = "WHERE excel_service.id_dealer='"+login.iddealerses+"'"
        }
        var count = await countrecord(sqlcount)
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
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales "+sql+" ORDER BY update_excelsrv DESC LIMIT ?,?",[start,limit],(err,srv) => {
            res.render("services", {
                login: login,
                srv: srv,
                moment: moment,
                count: math,
                page: page,
                arrpage: arrpage
            });  
        })
    }
}



exports.getDetailFileService = async function(req,res){
    if(req.session.loggedin!=true){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales WHERE id_excelsrv=?",[req.params.idfiles], async function(err, files){
            if(files.length==0){
                res.redirect("../")
            }else{
                if(files[0].type_excelsrv=="0"){
                    var table = "service_temp"
                    var type = "DRAFT"
                    var additional = "_temp"
                }else{
                    var table = "service"
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
                var sql = "SELECT COUNT(*) AS countrec FROM "+table+" WHERE id_excelsrv='"+req.params.idfiles+"'"
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
                db.query("SELECT * FROM "+table+" WHERE id_excelsrv='"+req.params.idfiles+"' LIMIT ?,?",[start,limit],(err,service)=>{
                    res.render("detailservice", {
                        result: service,
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




exports.getPageService = async function(req,res){
    if(req.session.loggedin!=true){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        await updateSession(login.idses)
        var page = req.params.page;
        if(!req.params.page){
            var page = 0;
        }else{
            var page = req.query.page
        }
        if(login.typeses=="super"){
            var sql = "SELECT COUNT(*) AS countrec FROM excel_service"
        }else{
            var sql = "SELECT COUNT(*) AS countrec FROM excel_service WHERE id_dealer='"+login.iddealerses+"'"
        }
        var limit = 10
        var count = await countrecord(sql)
        var math = Math.ceil(count[0].countrec/limit)
        var show = await pageservice(limit,page,login.iddealerses,login.typeses)
        res.render("pageservice", {
            srv: show,
            login: login,
            moment: moment,
            count: math,
            page: page
        })
    }
}
exports.getUploadService = async function(req,res) {
    if(req.session.loggedin!=true){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        await updateSession(login.idses)
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
function cekinteger(int, field){
    return new Promise(resolve => {
        var parse = parseInt(int)
        var check = Number.isInteger(parse)
        // var getfirst = int.toString().substring(0,2)
        if(field=="no_hp"){
            if(check==true){
                var result = ({check: true})
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
function cekhp(nohp, field){
    return new Promise(resolve => {
        var getfirst = nohp.substring(0, 2)
        if(getfirst!=62){
            var jsondata = ({check: false, type: field, data: nohp})
        }else{
            var jsondata = ({check: true, type: field, data: nohp})
        }
        resolve
    })
}

function ceknopol(nopol, field){
    return new Promise(resolve =>{
        if(nopol!=""){
            if(nopol.indexOf(' ') > 0){
                var jsondata = ({msg: "Invalid Permanent Reg No", field: field, check: false, data: nopol})
            }else{
                var jsondata = ({check: true})
            }
        }else{
            var jsondata = ({msg: "Data tidak boleh kosong", field: field, check: false, data: nopol})
        }
        resolve(jsondata)
    })
}
function formatdate(dateinput){
    return new Promise(resolve =>{
        var convertexceldate = (dateinput - (25567 + 2)) * 86400 * 1000
        var dateexcel = moment(convertexceldate).format("YYYY-MM-DD HH:mm:ss")
        resolve(dateexcel);
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
            var uploaddate_covert = await formatdate(data[i]["Date of sent"])
            var srvdate_convert = await formatdate(data[i]["Most Recent Service Date"])
            console.log(srvdate_convert)
            var flag = "2"
            // check is null
            var no = await ceknulldata(data[i]["No"], "id_service")
            var name_sa = await ceknulldata(data[i]["Service Advisor Name"], "name_sa")
            var iddealer = await ceknulldata(data[i]["Service Dealer Code"], "id_dealer")
            var tgl_upload = await ceknulldata(data[i]["Date of sent"], "tgl_uploadsrv")
            var no_rangka = await ceknulldata(data[i]["ChassisNo"], "no_rangka")
            var no_polisi = await ceknulldata(data[i]["PermanentRegNo"], "no_polisi")
            var type_kendaraan = await ceknulldata(data[i]["Model"], "type_kendaraan")
            var km = await ceknulldata(data[i]["Kilometers Covered"], "km")
            var nama_stnk = await ceknulldata(data[i]["Owner Name"], "nama_stnk")
            var user_name = await ceknulldata(data[i]["Main User Name"], "usern_name")
            var no_hp = await ceknulldata(data[i]["MobileNo"], "no_hp")
            var no_hpalt = await ceknulldata(data[i]["Alt Contact No"], "no_hpalt")
            var tgl_service = await ceknulldata(data[i]["Most Recent Service Date"], "tgl_service")
            if(no.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no.type, error_word: no.data, error_msg: "No Service tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(tgl_upload.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: tgl_upload.type, error_word: tgl_upload.data, error_msg: "Tanggal tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(name_sa.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: name_sa.type, error_word: name_sa.data, error_msg: "Nama tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(iddealer.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: iddealer.type, error_word: iddealer.data, error_msg: "Kode dealer tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(no_rangka.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no_rangka.type, error_word: no_rangka.data, error_msg: "No rangka tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(no_polisi.check==false){
                flag=="0"
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no_polisi.type, error_word: no_polisi.data, error_msg: "No polisi tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(type_kendaraan.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: type_kendaraan.type, error_word: type_kendaraan.data, error_msg: "Model tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(km.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: km.type, error_word: km.data, error_msg: "Data tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(nama_stnk.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: nama_stnk.type, error_word: nama_stnk.data, error_msg: "Nama tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(user_name.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: user_name.type, error_word: user_name.data, error_msg: "Nama tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(no_hp.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: no_hp.type, error_word: no_hp.data, error_msg: "No HP tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }
            if(tgl_service.check==false){
                var datanull = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: tgl_service.type, error_word: tgl_service.data, error_msg: "Tanggal tidak boleh kosong", error_table: "service"})
                db.query("INSERT INTO error_data set ?", [datanull], function(err) {
                    
                })
            }


            
            if(no.check==false || tgl_upload.check==false || name_sa.check==false || iddealer.check==false || no_rangka.check==false || no_polisi.check==false || type_kendaraan.check==false || km.check==false || nama_stnk.check==false || user_name.check==false || nama_stnk.check==false || user_name.check==false || no_hp.check==false || tgl_service.check==false){
                flag="0"
            }else{
                // check is null
                // cek error data
                let dealer = await cekdealer(data[i]["Service Dealer Code"]);
                let type = await cektype(data[i]["Model"]);
                let kmcek = await cekinteger(data[i]["Kilometers Covered"], "km")
                let nohpcek = await cekinteger(data[i]["MobileNo"], "no_hp")
                let nopolcek = await ceknopol(data[i]["PermanentRegNo"], "no_polisi")
                let norangka = await ceknorangka(data[i]["ChassisNo"])
                if (dealer!=true || type!=true || kmcek.check!=true || nohpcek.check!=true || nopolcek.check!=true || norangka==false){
                    flag = "0"
                    if(dealer!=true){
                        var errordealer = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: "id_dealer", error_word: data[i]["Service Dealer Code"], error_msg: dealer, error_table: "service"})
                        db.query("INSERT INTO error_data set ?", [errordealer],(err) => {
                        })
                    }
                    if(type!=true){
                        var errortype = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: "type_kendaraan", error_word: data[i]["Model"], error_msg: type, error_table: "service"})
                        db.query("INSERT INTO error_data set ?", [errortype],(err) => {
                        })
                    }
                    if(kmcek.check!=true){
                        var errorkm = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: kmcek.field, error_word: data[i]["Kilometers Covered"], error_msg: kmcek.msg, error_table: "service"})
                        db.query("INSERT INTO error_data set ?", [errorkm],(err) => {
                        })
                    }
                    if(nohpcek.check!=true){
                        var errorhp = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: nohpcek.field, error_word: data[i]["MobileNo"], error_msg: nohpcek.msg, error_table: "service"})
                        db.query("INSERT INTO error_data set ?", [errorhp],(err) => {
                        })
                    }
                    if(nopolcek.check!=true){
                        var errornopol = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: nopolcek.field, error_word: data[i]["PermanentRegNo"], error_msg: nopolcek.msg, error_table: "service"})
                        db.query("INSERT INTO error_data set ?", [errornopol],(err) => {
                        })
                    }
                    if(norangka==false){
                        var errornorangka = ({id_exceldata: req.params.idfiles, id_data:data[i]["No"], error_field: "no_rangka", error_word: data[i]["ChassisNo"], error_msg: "No rangka tidak valid", error_table: "service"})
                        db.query("INSERT INTO error_data set ?", [errornorangka],(err) => {
                        })
                    }
                    
                }
                // end cek error data
            }
                let detaildealer = await getdetaildealer(data[i]["Service Dealer Code"])
                let dealername = detaildealer.dealername;
                let dealerregion = detaildealer.region;
                let dealercity = detaildealer.city;
                let dealertype = detaildealer.type;
                let dealergroup = detaildealer.group;
            
            var insert_temp = (
            {
                id_service: no.data,
                id_excelsrv: req.params.idfiles,
                tgl_uploadsrv: uploaddate_covert,
                name_sa: name_sa.data,
                id_dealer: iddealer.data,
                dealername_srv: dealername,
                dealercity_srv: dealercity,
                dealerregion_srv: dealerregion,
                dealergroup_srv: dealergroup,
                dealertype_srv: dealertype,
                no_rangka: no_rangka.data,
                no_polisi: no_polisi.data,
                type_kendaraan: type_kendaraan.data,
                km: km.data,
                nama_stnk: nama_stnk.data,
                user_name: user_name.data,
                no_hp: no_hp.data,
                no_hpalt: no_hpalt.data,
                tgl_service: srvdate_convert,
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





exports.getDetailDataFileService = async function(req,res){
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        await updateSession(login.idses)
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales WHERE id_excelsrv='"+req.params.idfiles+"'", (err, files) => {
            if(files.length==0){
                res.redirect("../")
            }else{
                if(files[0].type_excelsrv=="0"){
                    var table = "service_temp"
                    var type = "DRAFT"
                    var additional = "_temp"
                }else{
                    var table = "service"
                    var type = "PERMANENT"
                }
                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_rangka' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err1,norangka_err) => {
                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_dealer' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err2,iddealer_err) => {
                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='km' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err3,km_err) => {
                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='type_kendaraan' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err4,type_err) => {
                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_polisi' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err5,nopol_err) => {
                                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='nama_stnk' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err6,namastnk_err) => {
                                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_uploadsrv' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err7,tgluploadsrv_err) => {
                                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_service' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err8,tglsrv_err) => {
                                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_hp' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err9,nohp_err) => {
                                                    db.query("SELECT * FROM "+table+" WHERE id_excelsrv='"+req.params.idfiles+"' AND id_service='"+req.params.idservice+"'",(err,service)=>{
                                                        res.render("detaildataservice", {
                                                            result: service,
                                                            login:login,
                                                            moment: moment,
                                                            files: files,
                                                            type: type,
                                                            adds : additional,
                                                            norangka_err: norangka_err,
                                                            iddealer_err: iddealer_err,
                                                            km_err: km_err,
                                                            type_err: type_err,
                                                            nopol_err: nopol_err,
                                                            namastnk_err: namastnk_err,
                                                            tglsrv_err: tglsrv_err,
                                                            tgluploadsrv_err: tgluploadsrv_err,
                                                            nohp_err: nohp_err
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

exports.getEditFileService = async function(req,res) {
    if(req.session.loggedin!=true){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        await updateSession(login.idses)
        db.query("SELECT * FROM excel_service WHERE id_excelsrv=?", [req.params.idfiles],(errfiles,filesrv) => {
            db.query("SELECT * FROM service_temp WHERE id_excelsrv=? AND id_service=?", [req.params.idfiles,req.params.idservice],(err,service) => {
                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_rangka' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err1,norangka_err) => {
                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='id_dealer' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err2,iddealer_err) => {
                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='km' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err3,km_err) => {
                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='type_kendaraan' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err4,type_err) => {
                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_polisi' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err5,nopol_err) => {
                                    db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='nama_stnk' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err6,namastnk_err) => {
                                        db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_uploadsrv' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err7,tgluploadsrv_err) => {
                                            db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='tgl_service' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err8,tglsrv_err) => {
                                                db.query("SELECT * FROM error_data WHERE id_exceldata=? AND id_data=? AND error_field='no_hp' AND error_solve='0' LIMIT 1", [req.params.idfiles,req.params.idservice],(err9,nohp_err) => {
                                                    if(filesrv.length==0){
                                                        res.redirect("../../")
                                                    }else{
                                                        res.render("editservice", {
                                                            login: login,
                                                            filesrv: filesrv,
                                                            service: service,
                                                            moment: moment,
                                                            norangka_err: norangka_err,
                                                            iddealer_err: iddealer_err,
                                                            km_err: km_err,
                                                            type_err: type_err,
                                                            nopol_err: nopol_err,
                                                            namastnk_err: namastnk_err,
                                                            tgluploadsrv_err: tgluploadsrv_err,
                                                            tglsrv_err: tglsrv_err,
                                                            nohp_err: nohp_err
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

exports.SavePermanentService = (req,res) => {
    var getdate = new Date();
    var formatdate = moment().format("YYYY_MM_DD");
    var formatdateinsert = moment().format("YYYY_MM_DD HH:mm:ss")
    
    db.query("SELECT * FROM excel_service WHERE id_excelsrv='"+req.params.idfiles+"'", (err, excelfile) => {
        var newfilename = "SRV_"+excelfile[0].id_dealer+"_"+formatdate+"_"+excelfile[0].id_excelsrv+".xlsx";
        db.query("SELECT * FROM service_temp WHERE id_excelsrv='"+req.params.idfiles+"'", async function(err,res1){
            var isifile = [
                ["No", "Date of Sent","Service Dealer Name","Service Dealer City","Dealer Region","Service Dealer Code","Dealer Type","Group Dealer","Owner Name","Main User Name","MobileNo","Alt Contact No","Model","ChassisNo","PermanentRegNo","Kilometers Covered","Most Recent Service Date","Service Advisor Name"]
            ]
            for(var i=0;i<res1.length;i++){
                isifile.push([res1[i].id_service,res1[i].tgl_service,res1[i].dealername_srv,res1[i].dealercity_srv,res1[i].dealerregion_srv,res1[i].id_dealer,res1[i].dealertype_srv,res1[i].dealergroup_srv,res1[i].nama_stnk,res1[i].user_name,res1[i].no_hp,"-",res1[i].type_kendaraan,res1[i].no_rangka,res1[i].no_polisi,res1[i].km,res1[i].tgl_uploadsrv,res1[i].name_sa])
                var savepermanent = (
                    {
                        id_service: res1[i].id_service,
                        tgl_uploadsrv: res1[i].tgl_uploadsrv,
                        id_excelsrv: res1[i].id_excelsrv,
                        name_sa: res1[i].name_sa,
                        id_dealer: res1[i].id_dealer,
                        dealername_srv: res1[i].dealername_srv ,
                        dealercity_srv: res1[i].dealercity_srv ,
                        dealerregion_srv: res1[i].dealerregion_srv ,
                        dealergroup_srv: res1[i].dealergroup_srv ,
                        dealertype_srv: res1[i].dealertype_srv ,
                        no_rangka: res1[i].no_rangka,
                        no_polisi: res1[i]. no_polisi,
                        type_kendaraan: res1[i].type_kendaraan,
                        km: res1[i].km,
                        nama_stnk: res1[i].nama_stnk,
                        user_name: res1[i].user_name,
                        no_hp: res1[i].no_hp,
                        no_hpalt: res1[i].no_hpalt,
                        tgl_service: res1[i].tgl_service,
                        flag_service: "1"
                    })
                db.query("INSERT INTO service set ?", [savepermanent],(err1) => {
                    if(err1){
                        console.log(err1)
                    }
                })
                var checkcustomer = await checkcust(res1[i].no_rangka)
                if(checkcustomer==false){
                    var savecustomer = ({
                        chassis_no: res1[i].no_rangka,
                        owner_name: res1[i].nama_stnk,
                        user_name: res1[i].user_name,
                        permanentregno: res1[i].no_polisi,
                        type_unit: res1[i].type_kendaraan,
                        km: res1[i].km,
                        no_hp: res1[i].no_hp,
                        no_hpalt: res1[i].no_hpalt,
                        active_cust: "1"
                    })
                    db.query("INSERT INTO customer SET ?", [savecustomer],(errcust, rescust)=>{
                        if(errcust){
                            console.log(errcust)
                        }
                    })
                }
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



exports.saveEditFIleService = async function(req,res) {
    var no_rangka = req.body.no_rangka;
    var type_kendaraan = req.body.type_kendaraan
    var id_service = req.body.id_service
    var date_sent = req.body.date_sent
    var km = req.body.km
    var no_polisi = req.body.no_polisi
    var nama_stnk = req.body.nama_stnk
    var user_name = req.body.user_name
    var no_hp = req.body.no_hp
    var tanggal_srv = req.body.tgl_service
    var id_dealer = req.body.id_dealer
    var name_sa = req.body.name_sa
    var mydealer = req.session.iddealer;

    // cek error data
    let dealer = await cekdealer(id_dealer);
    let detaildealer = await getdetaildealer(id_dealer)
    let dealername = detaildealer.dealername;
    let dealerregion = detaildealer.region;
    let dealercity = detaildealer.city;
    let dealertype = detaildealer.type;
    let dealergroup = detaildealer.group;
    let norangka = await ceknorangka(no_rangka)
    let type = await cektype(type_kendaraan);
    let nopolcek = await ceknopol(no_polisi)
    let flag = "2"
    if (dealer!=true || norangka==false || type!=true || nopolcek.check!=true){
        flag = "0"
        if(dealer!=true){
            var errordealer = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: "id_dealer", error_word: id_dealer, error_table: 'service', error_msg: dealer})
            db.query("INSERT INTO error_data set ?", [errordealer],(errdealer) => {
            })
        }
        if(norangka==false){
            var errornorangka = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: "no_rangka", error_word: no_rangka, error_table: 'service', error_msg: "No rangka tidak valid"})
            db.query("INSERT INTO error_data set ?", [errornorangka],(errorrangka) => {
            })
        }
        if(type!=true){
            var errortype = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: "type_kendaraan", error_word: type_kendaraan, error_msg: type, error_table: "service"})
            db.query("INSERT INTO error_data set ?", [errortype],(err) => {
            })
        }
        if(nopolcek.check!=true){
            var errortype = ({id_exceldata: req.params.idfiles, id_data:req.params.idservice, error_field: nopolcek.field, error_word: no_polisi, error_msg: nopolcek.msg, error_table: "service"})
            db.query("INSERT INTO error_data set ?", [errornopol],(err) => {
            })
        }
    }
    if(dealer==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='id_dealer' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    if(norangka==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='no_rangka' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    if(type==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='type_kendaraan' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    if(nopolcek.check==true){
        db.query("UPDATE error_data SET error_solve='1' WHERE id_exceldata = ? AND error_field='no_polisi' AND id_data=? AND error_table='service'", [req.params.idfiles,req.params.idservice],(errupdate) => {})
    }
    // end cek error data
    var updatefile = ({id_service: id_service, tgl_uploadsrv: date_sent, id_dealer: id_dealer, name_sa: name_sa, dealername_srv: dealername, dealercity_srv: dealercity, dealerregion_srv: dealerregion, dealertype_srv: dealertype, dealergroup_srv: dealergroup, no_rangka: no_rangka, no_polisi: no_polisi, type_kendaraan: type_kendaraan, km: km, nama_stnk: nama_stnk, user_name: user_name, no_hp: no_hp, tgl_service: tanggal_srv, flag_service: flag})
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

exports.deleteCheckService = (req,res) => {
    var check = req.body.checksrv;
    for(var i=0;i<check.length;i++){
        db.query("DELETE FROM service_temp WHERE id_service=? AND id_excelsrv=?", [check[i],req.params.idfiles], (err, delsrv) => {
            
        })
    }
    res.render("partials/actionajax");
}


exports.removeService = (req,res) => {
    var idfiles = req.params.idfiles
    db.query("SELECT * FROM excel_service WHERE id_excelsrv=?", [idfiles], (err,service) => {
        if(service.length==0){
            res.redirect("../")
        }else{
            var pathfile = "public/filexls/temp/"+service[0].filename_excelsrv
            try{
                if(fs.existsSync(pathfile)){
                    fs.unlinkSync(pathfile)
                }
            }catch (err){
                console.log(err)
            }
            db.query("DELETE FROM excel_service WHERE id_excelsrv=?", [idfiles], (err,delsrv) => {})
            db.query("DELETE FROM service_temp WHERE id_excelsrv=?", [idfiles], (err,delsrv) => {})
            db.query("DELETE FROM error_data WHERE id_exceldata=? AND error_table='service'", [idfiles], (err,delsrv) => {})
            res.redirect("../")
        }
    })
}