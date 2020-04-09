const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const path = require("path");
const xslx = require("xlsx");

function successinterview(){
    return new Promise(resolve => {
        db.query("SELECT * FROM interviews WHERE success_int=1", function(err,success){
            db.query("SELECT * FROM interviews WHERE success_int=0", function(err,fail){
                var jsondata = ({success: success.length, failed: fail.length})
                resolve(jsondata)
            })
        })
    })
}
function getReason(){
    return new Promise(resolve => {
        db.query("SELECT * FROM reason WHERE karyawan=1 OR tidak_sesuai=1 OR tidak_pernah_service=1 OR supir=1 OR mobil_dijual=1 OR orang_lain=1 OR menolak_diawal=1 OR expatriat=1 OR menolak_ditengah=1 OR sibuk=1 OR diluar_negeri=1", function(err,personal){
            db.query("SELECT * FROM reason WHERE mailbox=1 OR tidak_aktif=1 OR no_signal=1 OR dialihkan=1 OR no_tidaklengkap=1 OR not_connected=1 OR tulalit=1 OR no_relatif=1 OR salah_sambung=1 OR terputus=1 OR tidak_diangkat=1 OR no_sibuk=1 OR unclear_voice=1 OR reject=1 OR fax_modem=1 OR dead_sample=1", function(err,technical){
                db.query("SELECT * FROM reason WHERE duplicate=1 OR fresh_sample=1", function(err,other){
                    var jsondata = ({personal: personal.length, technical: technical.length, other: other.length})
                    resolve(jsondata)
                })
            })
        })
    })
}
exports.getReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM interviews", async function(err, resint){
                db.query("SELECT * FROM reason JOIN interviews ON reason.id_interview=interviews.id_interview", async function(errreason,reason){
                    db.query("SELECT * FROM dealer", async function (errdealer,dealer){
                        var countint = resint.length
                        var successpercent;
                        var failedpercent;
                        var success;
                        var failed;
                        if(resint.length==0){
                            successpercent = 0;
                            failedpercent = 0;
                        }else{
                            var countfunct = await successinterview()
                            successpercent = (countfunct.success * 100) / countint 
                            failedpercent = (countfunct.failed * 100) / countint
                            success = countfunct.success
                            failed = countfunct.failed
                        }
                        var reasonlength = reason.length
                        var countreason = await getReason()
                        var jsonpercent = ({
                            percentpersonal: (countreason.personal * 100) / reasonlength,
                            percenttechnical: (countreason.technical * 100) / reasonlength,
                            percentother: (countreason.other * 100) / reasonlength
                        })
                        res.render("report",{
                            login: login,
                            successpercent: successpercent,
                            failedpercent: failedpercent,
                            success: success,
                            failed: failed,
                            countint: countint,
                            reason: reason,
                            dealer: dealer,
                            countreason: countreason,
                            jsonpercent: jsonpercent
                        })  
                    })
                })
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.importReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            res.render("importreport",{
                login: login
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.saveReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            let uploadPath;
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var filename = req.files.filexls;
            var extension = path.extname(filename.name);
            var newfilename = "REP_"+formatdate+extension
            if(extension==".xlsx" || extension=="xls"){
                uploadPath = "public/filexls/report/"+newfilename
                filename.mv(uploadPath, function(err){
                    if(err){
                        throw err;
                    }else{
                        res.redirect("../report/readfile/"+newfilename)
                    }
                })
            }else{
                res.send("failed")
            }
        }else{
            res.redirect("../")
        }
    }
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
function getdetailuser(chassisno){
    return new Promise(resolve => {
        db.query("SELECT * FROM customer WHERE chassis_no=?",[chassisno], function(err,result){
            if(result.length==0){
                var jsondata = ({chassisno: "", username: "", model: "", no_hp: "", check: false})
                resolve(jsondata)
            }else{
                var jsondata = ({chassisno: result[0].chassis_no, username: result[0].user_name, model: result[0].type_unit, no_hp: result[0].no_hp, check: true})
                resolve(jsondata)
            }
        })
    })
}
function getlastid(){
    return new Promise(resolve => {
        db.query("SELECT * FROM interviews ORDER BY id_interview DESC LIMIT 1", function(err,result) {
            if(result.length==0){
                resolve(1)
            }else{
                resolve(result[0].id_interview)
            }
        })
    })
}
function getnulldata(data){
    return new Promise(resolve => {
        if(data=="" || data==" " || data==undefined){
            resolve(0)
        }else{
            resolve(1)
        }
    })
}
exports.readFileReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super"){
            var workbook  = xslx.readFile("public/filexls/report/"+req.params.filename);
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
                var date = moment().format("YYYY-MM-DD")
                for(var i=0;i<data.length;i++){
                    var sukses = await getnulldata(data[i]["Sukses interview"])
                    var dealercode = data[i]["Service Dealer Code"]
                    var dealername = data[i]["Service Dealer Name"]
                    var chassisno = data[i]["ChassisNo"]
                    var firstattempt = await getnulldata(data[i]["Telpon pertama diangkat"])
                    if(firstattempt == 1){
                        var attempt = 1;
                    }else{
                        var attempt = 2; 
                    }
                    var detailuser = await getdetailuser(chassisno)
                    if(detailuser.check==true){
                        var user_name = detailuser.username;
                        var no_hp = detailuser.no_hp;
                        var type_unit = detailuser.model;
                    }else{
                        var user_name = data[i]["Main User Name"]
                        var no_hp = data[i]["MobileNo"]
                        var type_unit = data[i]["Model"]
                    }
                    var inputinterviews = ({
                        id_dealer: dealercode,
                        chassis_no: chassisno,
                        user_name: user_name,
                        no_hp: no_hp,
                        type_unit: type_unit,
                        success_int: sukses,
                        attempt_int: attempt,
                        date_interview: date
                    })
                    db.query("INSERT INTO interviews set ?", [inputinterviews], (errsavecust,savecust) => {})
                    if(sukses!=1){
                        var lastid = await getlastid();
                        var karyawan =await getnulldata (data[i]["Karyawan Nissan"])
                        var tidak_sesuai =await getnulldata (data[i]["Tidak sesuai dengan nama yang dicari (A)"])
                        var tidak_pernah_service =await getnulldata (data[i]["Tidak pernah melakukan servis di dealer Nissan (C2a)"])
                        var supir =await getnulldata (data[i]["Supir yang melakukan servis di dealer Nissan (D2)"])
                        var mobil_dijual =await getnulldata (data[i]["Mobil sudah dijual"])
                        var orang_lain =await getnulldata (data[i]["Orang lain yang melakukan servis di dealer Nissan (D2)"])
                        var menolak_diawal =await getnulldata (data[i]["Menolak di wawancara (dari awal - B)"])
                        var expatriat =await getnulldata (data[i]["Expatriat"])
                        var menolak_ditengah =await getnulldata (data[i]["Menolak untuk melanjutkan wawancara (di tengah-tengah interview)"])
                        var sibuk =await getnulldata (data[i]["Responden sedang sibuk"])
                        var diluar_negeri =await getnulldata (data[i]["Sedang di luar negeri"])
                        var mailbox =await getnulldata (data[i]["Mailbox"])
                        var tidak_aktif =await getnulldata (data[i]["Nomor tidak aktif"])
                        var no_signal =await getnulldata (data[i]["Tidak ada sinyal  / tidak ada nada sambung sama sekali"])
                        var dialihkan =await getnulldata (data[i]["Nomor telepon dialihkan"])
                        var no_tidaklengkap =await getnulldata (data[i]["Nomor tidak lengkap"])
                        var not_connected =await getnulldata (data[i]["Tidak bisa dihubungi"])
                        var tulalit =await getnulldata (data[i]["Tulalit"])
                        var no_relatif =await getnulldata (data[i]["Nomor telepon yang diberikan adalah milik relatif (suami/istri/anak/supir/dll)"])
                        var salah_sambung =await getnulldata (data[i]["Salah sambung"])
                        var terputus =await getnulldata (data[i]["Wawancara terputus"])
                        var tidak_diangkat =await getnulldata (data[i]["Telepon tidak diangkat"])
                        var no_sibuk =await getnulldata (data[i]["Nomor sibuk"])
                        var unclear_voice =await getnulldata (data[i]["Suara tidak jelas"])
                        var reject =await getnulldata (data[i]["Telepon selalu ditolak / direject oleh pelanggan"])
                        var fax_modem =await getnulldata (data[i]["Nomor Fax / modem"])
                        var dead_sample =await getnulldata (data[i]["Dead Sample (sudah dikontak 8 kali)"])
                        var duplicate =await getnulldata (data[i]["Data Duplicated"])
                        var fresh_sample =await getnulldata (data[i]["Fresh sample (not called)"])
                        var savereason = ({
                            id_interview: lastid,
                            id_dealer: dealercode,
                            chassis_no: chassisno,
                            cat_reason: "other",
                            karyawan: karyawan,
                            tidak_sesuai: tidak_sesuai,
                            tidak_pernah_service: tidak_pernah_service,
                            supir: supir,
                            mobil_dijual: mobil_dijual,
                            orang_lain: orang_lain,
                            menolak_diawal: menolak_diawal,
                            expatriat: expatriat,
                            menolak_ditengah: menolak_ditengah,
                            sibuk: sibuk,
                            diluar_negeri: diluar_negeri,
                            mailbox: mailbox,
                            tidak_aktif: tidak_aktif,
                            no_signal: no_signal,
                            dialihkan: dialihkan,
                            no_tidaklengkap: no_tidaklengkap,
                            not_connected: not_connected,
                            tulalit: tulalit,
                            no_relatif: no_relatif,
                            salah_sambung: salah_sambung,
                            terputus: terputus,
                            tidak_diangkat: tidak_diangkat,
                            no_sibuk: no_sibuk,
                            unclear_voice: unclear_voice,
                            reject: reject,
                            fax_modem: fax_modem,
                            dead_sample: dead_sample,
                            duplicate: duplicate,
                            fresh_sample: fresh_sample,
                        })
                        db.query("INSERT INTO reason set ?", [savereason], (errsavereason) => {
                            if(errsavereason){
                                console.log(errsavereason)
                            }
                        })
                    }
                }
                res.redirect("../")
            })
        }else{
            res.redirect("../")
        }
    }
}