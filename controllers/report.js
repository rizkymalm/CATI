const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const path = require("path");
const xslx = require("xlsx");
const xlsfile = require("node-xlsx");
const fs = require("fs");
const download = require("download-file")


function successinterview(iddealer){
    return new Promise(resolve => {
        if(iddealer==''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1"
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0"
        }else{
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND id_dealer='"+iddealer+"'"
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND id_dealer='"+iddealer+"'"
        }
        db.query(sqlsuccess, function(err,success){
            db.query(sqlfail, function(err,fail){
                var jsondata = ({success: success.length, failed: fail.length, iddealer: iddealer})
                resolve(jsondata)
            })
        })
    })
}
function getReason(iddealer){
    return new Promise(resolve => {
        if(iddealer==''){
            var sql = 'WHERE';
        }else{
            var sql = "WHERE id_dealer='"+iddealer+"' AND";
        }
        db.query("SELECT * FROM reason "+sql+" (karyawan=1 OR tidak_sesuai=1 OR tidak_pernah_service=1 OR supir=1 OR mobil_dijual=1 OR orang_lain=1 OR menolak_diawal=1 OR expatriat=1 OR menolak_ditengah=1 OR sibuk=1 OR diluar_negeri=1)", function(err,personal){
            db.query("SELECT * FROM reason "+sql+" (mailbox=1 OR tidak_aktif=1 OR no_signal=1 OR dialihkan=1 OR no_tidaklengkap=1 OR not_connected=1 OR tulalit=1 OR no_relatif=1 OR salah_sambung=1 OR terputus=1 OR tidak_diangkat=1 OR no_sibuk=1 OR unclear_voice=1 OR reject=1 OR fax_modem=1 OR dead_sample=1)", function(err,technical){
                db.query("SELECT * FROM reason "+sql+" (duplicate=1 OR fresh_sample=1)", function(err,other){
                    var jsondata = ({personal: personal.length, technical: technical.length, other: other.length, sql: sql})
                    resolve(jsondata)
                })
            })
        })
    })
}
function getReasonById(iddealer){
    return new Promise (resolve => {
        if(iddealer==undefined || iddealer==''){
            var sql = "SELECT * FROM reason"
        }else{
            var sql = "SELECT * FROM reason WHERE id_dealer='"+iddealer+"'"
        }
        db.query(sql, function(err,result){
            var karyawan = 0;
            var tidak_sesuai = 0
            var karyawan = 0;
            var tidak_sesuai = 0;
            var tidak_pernah_service = 0;
            var supir = 0;
            var mobil_dijual = 0;
            var orang_lain = 0;
            var menolak_diawal = 0;
            var expatriat = 0;
            var menolak_ditengah = 0;
            var sibuk = 0;
            var diluar_negeri = 0;
            var mailbox = 0;
            var tidak_aktif = 0;
            var no_signal = 0;
            var dialihkan = 0;
            var no_tidaklengkap = 0;
            var not_connected = 0;
            var tulalit = 0;
            var no_relatif = 0;
            var salah_sambung = 0;
            var terputus = 0;
            var tidak_diangkat = 0;
            var no_sibuk = 0;
            var unclear_voice = 0;
            var reject = 0;
            var fax_modem = 0;
            var dead_sample = 0;
            var duplicate = 0;
            var fresh_sample = 0;
            for (let i = 0; i < result.length; i++) {
                karyawan = karyawan+result[i].karyawan;
                tidak_sesuai = tidak_sesuai+result[i].tidak_sesuai;
                tidak_pernah_service = tidak_pernah_service+result[i].tidak_pernah_service;
                supir = supir+result[i].supir;
                mobil_dijual = mobil_dijual+result[i].mobil_dijual;
                orang_lain = orang_lain+result[i].orang_lain;
                menolak_diawal = menolak_diawal+result[i].menolak_diawal;
                expatriat = expatriat+result[i].expatriat;
                menolak_ditengah = menolak_ditengah+result[i].menolak_ditengah;
                sibuk = sibuk+result[i].sibuk;
                diluar_negeri = diluar_negeri+result[i].diluar_negeri;
                mailbox = mailbox+result[i].mailbox;
                tidak_aktif = tidak_aktif+result[i].tidak_aktif;
                no_signal = no_signal+result[i].no_signal;
                dialihkan = dialihkan+result[i].dialihkan;
                no_tidaklengkap = no_tidaklengkap+result[i].no_tidaklengkap;
                not_connected = not_connected+result[i].not_connected;
                tulalit = tulalit+result[i].tulalit;
                no_relatif = no_relatif+result[i].no_relatif;
                salah_sambung = salah_sambung+result[i].salah_sambung;
                terputus = terputus+result[i].terputus;
                tidak_diangkat = tidak_diangkat+result[i].tidak_diangkat;
                no_sibuk = no_sibuk+result[i].no_sibuk;
                unclear_voice = unclear_voice+result[i].unclear_voice;
                reject = reject+result[i].reject;
                fax_modem = fax_modem+result[i].fax_modem;
                dead_sample = dead_sample+result[i].dead_sample;
                duplicate = duplicate+result[i].duplicate;
                fresh_sample = fresh_sample+result[i].fresh_sample;
            }
            var jsondata = ([
                {label: "Karyawan Nissan", y: karyawan},
                {label: "Tidak sesuai dengan nama yang dicari (A)", y: tidak_sesuai},
                {label: "Tidak pernah melakukan servis di dealer Nissan (C2a)", y: tidak_pernah_service},
                {label: "Supir yang melakukan servis di dealer Nissan (D2)", y: supir},
                {label: "Mobil sudah dijual", y: mobil_dijual},
                {label: "Orang lain yang melakukan servis", y: orang_lain},
                {label: "Menolak di wawancara(dari awal - B)", y: menolak_diawal},
                {label: "Expatriat", y: expatriat},
                {label: "Menolak untuk melanjutkan wawancara", y: menolak_ditengah},
                {label: "Responden sedang sibuk", y: sibuk},
                {label: "Sedang di luar negeri", y: diluar_negeri},
                {label: "Mailbox", y: mailbox},
                {label: "Nomor tidak aktif", y: tidak_aktif},
                {label: "Tidak ada sinyal", y: no_signal},
                {label: "Nomor telepon dialihkan", y: dialihkan},
                {label: "Nomor tidak lengkap", y: no_tidaklengkap},
                {label: "Tidak bisa dihubungi", y: not_connected},
                {label: "Tulalit", y: tulalit},
                {label: "Nomor telepon yang diberikan adalah milik relatif", y: no_relatif},
                {label: "Salah sambung", y: salah_sambung},
                {label: "Wawancara terputus", y: terputus},
                {label: "Telepon tidak diangkat", y: tidak_diangkat},
                {label: "Nomor sibuk", y: no_sibuk},
                {label: "Suara tidak jelas", y: unclear_voice},
                {label: "Telepon selalu ditolak", y: reject},
                {label: "Nomor Fax / modem", y: fax_modem},
                {label: "Dead Sample (sudah dikontak 8 kali)", y: dead_sample},
                {label: "Data Duplicated", y: duplicate},
                {label: "Fresh sample (not called)", y: fresh_sample}
            ])
            resolve(jsondata)
        })
    })
}

function getReasonPerDealer(iddealer){
    return new Promise(resolve =>{
        if(iddealer==''){
            var sql = '';
        }else{
            var sql = "WHERE id_dealer='"+iddealer+"'";
        }
        db.query("SELECT * FROM dealer "+sql, function(err,resdealer){
            resolve(resdealer)
        })
    })
}
exports.getReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        var link;
        if(login.typeses=="admin" || login.typeses=="super"){
            if(login.iddealerses!=''){
                if(req.query.dealer!=undefined){
                    res.redirect("../report")
                }else{
                    var iddealer = login.iddealerses
                    var sql = "WHERE id_dealer='"+login.iddealerses+"'";
                    var sqlreason = "WHERE reason.id_dealer='"+login.iddealerses+"'";
                }
            }else{
                if(req.query.dealer!=undefined){
                    var sql = "WHERE id_dealer='"+req.query.dealer+"'";
                    var sqlreason = "WHERE reason.id_dealer='"+req.query.dealer+"'";
                    var iddealer = req.query.dealer;
                    link = "?dealer="+iddealer+"&"
                }else{
                    var sql = "";
                    var sqlreason = "";
                    var iddealer = "";
                    link = "?";
                }
            }
            db.query("SELECT * FROM interviews "+sql, async function(err, resint){
                db.query("SELECT * FROM reason JOIN interviews ON reason.id_interview=interviews.id_interview "+sqlreason, async function(errreason,reason){
                    db.query("SELECT * FROM dealer", async function (errdealer,alldealer){
                        var countint = resint.length
                        var successpercent;
                        var failedpercent;
                        var success;
                        var failed;
                        if(resint.length==0){
                            successpercent = 0;
                            failedpercent = 0;
                        }else{
                            var countfunct = await successinterview(iddealer)
                            successpercent = (countfunct.success * 100) / countint 
                            failedpercent = (countfunct.failed * 100) / countint
                            success = countfunct.success
                            failed = countfunct.failed
                        }
                        var reasonlength = reason.length
                        var countreason = await getReason(iddealer)
                        var jsonpercent = ({
                            percentpersonal: (countreason.personal * 100) / reasonlength,
                            percenttechnical: (countreason.technical * 100) / reasonlength,
                            percentother: (countreason.other * 100) / reasonlength
                        })
                        var reasonById = await getReasonById(iddealer)
                        var dealer = await getReasonPerDealer(iddealer);
                        var reasonperid = []
                        for (let i = 0; i < dealer.length; i++) {
                            var getreasonperid = await getReasonById(dealer[i].id_dealer)
                            reasonperid.push(
                                {
                                    id_dealer: dealer[i].id_dealer, 
                                    count: 
                                    [
                                        {label: "Karyawan Nissan", value: getreasonperid[0].y},
                                        {label: "Tidak sesuai dengan nama yang dicari (A)", value: getreasonperid[1].y},
                                        {label: "Tidak pernah melakukan servis di dealer Nissan (C2a)", value: getreasonperid[2].y},
                                        {label: "Supir yang melakukan servis di dealer Nissan (D2)", value: getreasonperid[3].y},
                                        {label: "Mobil sudah dijual", value: getreasonperid[4].y},
                                        {label: "Orang lain yang melakukan servis", value: getreasonperid[5].y},
                                        {label: "Menolak di wawancara(dari awal - B)", value: getreasonperid[6].y},
                                        {label: "Expatriat", value: getreasonperid[7].y},
                                        {label: "Menolak untuk melanjutkan wawancara", value: getreasonperid[8].y},
                                        {label: "Responden sedang sibuk", value: getreasonperid[9].y},
                                        {label: "Sedang di luar negeri", value: getreasonperid[10].y},
                                        {label: "Mailbox", value: getreasonperid[11].y},
                                        {label: "Nomor tidak aktif", value: getreasonperid[12].y},
                                        {label: "Tidak ada sinyal", value: getreasonperid[13].y},
                                        {label: "Nomor telepon dialihkan", value: getreasonperid[14].y},
                                        {label: "Nomor tidak lengkap", value: getreasonperid[15].y},
                                        {label: "Tidak bisa dihubungi", value: getreasonperid[16].y},
                                        {label: "Tulalit", value: getreasonperid[17].y},
                                        {label: "Nomor telepon yang diberikan adalah milik relatif", value: getreasonperid[18].y},
                                        {label: "Salah sambung", value: getreasonperid[19].y},
                                        {label: "Wawancara terputus", value: getreasonperid[20].y},
                                        {label: "Telepon tidak diangkat", value: getreasonperid[21].y},
                                        {label: "Nomor sibuk", value: getreasonperid[22].y},
                                        {label: "Suara tidak jelas", value: getreasonperid[23].y},
                                        {label: "Telepon selalu ditolak", value: getreasonperid[24].y},
                                        {label: "Nomor Fax / modem", value: getreasonperid[25].y},
                                        {label: "Dead Sample (sudah dikontak 8 kali)", value: getreasonperid[26].y},
                                        {label: "Data Duplicated", value: getreasonperid[27].y},
                                        {label: "Fresh sample (not called)", value: getreasonperid[28].y},
                                    ]
                                }
                            )
                        }
                        
                        res.render("report",{
                            login: login,
                            successpercent: successpercent,
                            failedpercent: failedpercent,
                            success: success,
                            failed: failed,
                            countint: countint,
                            reason: reason,
                            alldealer: alldealer,
                            dealer: dealer,
                            countreason: countreason,
                            jsonpercent: jsonpercent,
                            reasonById: reasonById,
                            reasonperid: reasonperid,
                            link: link
                        })  
                    })
                })
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.listReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        db.query("SELECT * FROM excel_interview ORDER BY update_excelint DESC", (err,result) => {
            res.render("listreport", {
                login: login,
                moment: moment,
                result: result
            })
        })
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
            var panel = req.body.panel;
            var week = req.body.week;
            let getdate = new Date();
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var filename = req.files.filexls;
            var extension = path.extname(filename.name);
            var newfilename = "REP_"+panel+"_"+formatdate+extension
            if(extension==".xlsx" || extension=="xls"){
                uploadPath = "public/filexls/report/"+newfilename
                filename.mv(uploadPath, function(errupload){
                    var datainterview = ({filename_excelint: newfilename, week_excelint: week, upload_excelint: getdate, update_excelint: getdate, panel_excelint: panel})
                    db.query("INSERT INTO excel_interview SET ?", [datainterview], (err,result) => {
                        if(errupload || err){
                            throw err;
                        }else{
                            db.query("SELECT * FROM excel_interview WHERE filename_excelint=?", [newfilename], (err1, resint) => {
                                res.redirect("../report/readfile/"+resint[0].id_excelint+"/"+newfilename+"/"+resint[0].panel_excelint)
                            })
                        }
                    })
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
                    var idexcelint = req.params.idfiles;
                    var panel = req.params.panel;
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
                        id_excelint: idexcelint,
                        id_dealer: dealercode,
                        chassis_no: chassisno,
                        user_name: user_name,
                        no_hp: no_hp,
                        type_unit: type_unit,
                        panel_interview: panel,
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
                            id_excelint: idexcelint,
                            panel_reason: panel,
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
                res.redirect("../../../")
            })
        }else{
            res.redirect("../")
        }
    }
}

exports.updateReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../../../login")
    }else{
        var detaildata = ({idfile: req.params.idfiles, filename: req.params.filename, panel: req.params.panel});
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        if(login.typeses=="admin" || login.typeses=="super"){
            res.render("updatereport", {
                login: login,
                moment: moment,
                detaildata: detaildata
            })
        }else{
            res.redirect("../../../")
        }
    }
}

function getFile(idfile,filename,panel){
    return new Promise(resolve => {
        db.query("SELECT * FROM excel_interview WHERE id_excelint=? AND filename_excelint=? AND panel_excelint=?", [idfile,filename,panel], (err,result) => {
            if(!err){
                resolve(result)
            }
        })
    })
}

exports.saveUpdateReport = async function(req,res){
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        if(login.typeses=="admin" || login.typeses=="super"){
            let uploadPath;
            var detaildata = ({idfile: req.params.idfiles, filename: req.params.filename, panel: req.params.panel});
            var getfile = await getFile(detaildata.idfile,detaildata.filename,detaildata.panel)
            var week = req.body.week;
            let getdate = new Date();
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var filename = req.files.filexls;
            var extension = path.extname(filename.name);
            var newfilename = "REP_"+detaildata.panel+"_"+formatdate+extension
            if(extension==".xlsx" || extension=="xls"){
                uploadPath = "public/filexls/report/"+newfilename
                filename.mv(uploadPath, function(errupload){
                    var datainterview = ({filename_excelint: newfilename, week_excelint: getfile[0].week_excelint, update_excelint: getdate})
                    db.query("UPDATE excel_interview SET ? WHERE id_excelint='"+detaildata.idfile+"' AND panel_excelint='"+detaildata.panel+"'", [datainterview], (err,result) => {
                        if(errupload || err){
                            throw err;
                        }else{
                            res.redirect("../../../../report/readfileupdate/"+detaildata.idfile+"/"+newfilename+"/"+detaildata.panel)
                        }
                    })
                })
            }else{
                res.send("failed")
            }
        }else{
            res.redirect("../../../")
        }
    }
}


exports.readFileUpdateReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        var detaildata = ({idfile: req.params.idfiles, filename: req.params.filename, panel: req.params.panel});
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
                    var idexcelint = req.params.idfiles;
                    var panel = req.params.panel;
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
                        id_excelint: idexcelint,
                        id_dealer: dealercode,
                        chassis_no: chassisno,
                        user_name: user_name,
                        no_hp: no_hp,
                        type_unit: type_unit,
                        panel_interview: panel,
                        success_int: sukses,
                        attempt_int: attempt,
                        date_interview: date
                    })
                    db.query("UPDATE interviews set ? where id_excelint='"+detaildata.idfile+"' AND panel_interview='"+detaildata.panel+"' AND chassis_no='"+chassisno+"' AND id_dealer='"+dealercode+"'", [inputinterviews], (errsavecust,savecust) => {
                        if(errsavecust){
                            console.log(errsavecust)
                        }
                    })
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
                        var updatereason = ({
                            id_interview: lastid,
                            id_excelint: idexcelint,
                            panel_reason: panel,
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
                        db.query("UPDATE reason set ? where id_excelint='"+detaildata.idfile+"' AND panel_reason='"+detaildata.panel+"' AND chassis_no='"+chassisno+"' AND id_dealer='"+dealercode+"'", [updatereason], (errsavereason) => {
                            if(errsavereason){
                                console.log(errsavereason)
                            }
                        })
                    }
                }
                res.redirect("../../../")
            })
        }else{
            res.redirect("../")
        }
    }
}

function getDealerByID(iddealer){
    return new Promise(resolve => {
        db.query("SELECT * FROM dealer WHERE id_dealer=?",[iddealer], function (err,result){
            resolve(result)
        })
    })
}

function getDownloadReport(id){
    return new Promise(resolve => {
        db.query("SELECT * FROM reason WHERE id_interview=?",[id], function (err,result){
            if(result.length>0){
                resolve(result)
            }else{
                resolve(null)
            }
        })
    })
}

exports.downloadReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        if(login.typeses=="admin" || login.typeses=="super"){
            db.query("SELECT * FROM interviews", async function(err1,resint) {
                var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
                var newfilename = "REP_"+formatdate+".xlsx";
                var isifile = [
                    [
                        "No.",
                        "Service Dealer Code",
                        "Service Dealer Name",
                        "Service Dealer City",
                        "Dealer Region ",
                        "ChassisNo",
                        "Main User Name",
                        "MobileNo",
                        "Model",
                        " ",
                        "Sukses interview",
                        "Clear Appointment",
                        "Unclear Appointment",
                        "Karyawan Nissan",
                        "Tidak sesuai dengan nama yang dicari (A)",
                        "Tidak pernah melakukan servis di dealer Nissan (C2a)",
                        "Supir yang melakukan servis di dealer Nissan (D2)",
                        "Mobil sudah dijual",
                        "Orang lain yang melakukan servis di dealer Nissan (D2)",
                        "Menolak di wawancara (dari awal - B)",
                        "Expatriat",
                        "Menolak untuk melanjutkan wawancara (di tengah-tengah interview)",
                        "Responden sedang sibuk",
                        "Sedang di luar negeri",
                        "Mailbox",
                        "Nomor tidak aktif",
                        "Tidak ada sinyal  / tidak ada nada sambung sama sekali",
                        "Nomor telepon dialihkan",
                        "Nomor tidak lengkap",
                        "Tidak bisa dihubungi",
                        "Tulalit",
                        "Nomor telepon yang diberikan adalah milik relatif (suami/istri/anak/supir/dll)",
                        "Salah sambung",
                        "Wawancara terputus",
                        "Telepon tidak diangkat",
                        "Nomor sibuk",
                        "Suara tidak jelas",
                        "Telepon selalu ditolak / direject oleh pelanggan",
                        "Nomor Fax / modem",
                        "Dead Sample (sudah dikontak 8 kali)",
                        "Data Duplicated",
                        "Fresh sample (not called)"
                    ]
                ]
                for(var i=0;i<resint.length;i++){
                    var detaildealer = await getDealerByID(resint[i].id_dealer)
                    var reason = await getDownloadReport(resint[i].id_interview)
                    if(reason!=null){
                        isifile.push([
                            i+1,
                            resint[i].id_dealer,
                            detaildealer[0].name_dealer,
                            detaildealer[0].city_dealer,
                            detaildealer[0].region_dealer,
                            resint[i].chassis_no,
                            resint[i].user_name,
                            resint[i].no_hp,
                            resint[i].type_unit,
                            moment(resint[i].date_interview).format("DD/MMM/YYYY"),
                            resint[i].success_int,
                            "","",
                            reason[0].karyawan,
                            reason[0].tidak_sesuai,
                            reason[0].tidak_pernah_service,
                            reason[0].supir,
                            reason[0].mobil_dijual,
                            reason[0].orang_lain,
                            reason[0].menolak_diawal,
                            reason[0].expatriat,
                            reason[0].menolak_ditengah,
                            reason[0].sibuk,
                            reason[0].diluar_negeri,
                            reason[0].mailbox,
                            reason[0].tidak_aktif,
                            reason[0].no_signal,
                            reason[0].dialihkan,
                            reason[0].no_tidaklengkap,
                            reason[0].not_connected,
                            reason[0].tulalit,
                            reason[0].no_relatif,
                            reason[0].salah_sambung,
                            reason[0].terputus,
                            reason[0].tidak_diangkat,
                            reason[0].no_sibuk,
                            reason[0].unclear_voice,
                            reason[0].reject,
                            reason[0].fax_modem,
                            reason[0].dead_sample,
                            reason[0].duplicate,
                            reason[0].fresh_sample
                        ])
                    }
                }
                const progress = xlsfile.build([{name: "demo_sheet", data: isifile}])
                fs.writeFile("public/filexls/report/download/"+newfilename, progress, (err) => {
                    if(err){
                        console.log(err)
                    }else{
                        // res.redirect("../../downloadfile/"+newfilename)
                        res.render("downloadreport", {
                            login: login,
                            moment: moment,
                            filename: newfilename
                        })
                    }
                })
            })
        }else{
            res.redirect("../../")
        }
    }
}