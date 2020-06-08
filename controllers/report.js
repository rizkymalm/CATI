const express = require("express")
const db = require("../models/db")
const moment = require("moment")
const path = require("path");
const xslx = require("xlsx");
const xlsfile = require("node-xlsx");
const fs = require("fs");
const download = require("download-file")


function successinterview(iddealer,panel,week){
    return new Promise(resolve => {
        if(iddealer=='' && panel=='' && week==''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1"
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0"
        }else if(iddealer!='' && panel=='' && week==''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND id_dealer='"+iddealer+"'"
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND id_dealer='"+iddealer+"'"
        }else if(iddealer=='' && panel!='' && week==''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND panel_interview='"+panel+"'"
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND panel_interview='"+panel+"'"
        }else if(iddealer!='' && panel!='' && week==''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND id_dealer='"+iddealer+"' AND panel_interview='"+panel+"'"
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND id_dealer='"+iddealer+"' AND panel_interview='"+panel+"'"
        }else if(iddealer!='' && panel=='' && week!=''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND id_dealer='"+iddealer+"' AND week_int="+week
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND id_dealer='"+iddealer+"' AND week_int="+week
        }else if(iddealer=='' && panel!='' && week!=''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND panel_interview='"+panel+"' AND week_int="+week
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND panel_interview='"+panel+"' AND week_int="+week
        }else if(iddealer=='' && panel=='' && week!=''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND week_int="+week
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND week_int="+week
        }else if(iddealer!='' && panel!='' && week!=''){
            var sqlsuccess = "SELECT * FROM interviews WHERE success_int=1 AND id_dealer='"+iddealer+"' AND panel_interview='"+panel+"' AND week_int="+week
            var sqlfail = "SELECT * FROM interviews WHERE success_int=0 AND id_dealer='"+iddealer+"' AND panel_interview='"+panel+"' AND week_int="+week
        }
        db.query(sqlsuccess, function(err,success){
            db.query(sqlfail, function(err,fail){
                var jsondata = ({success: success.length, failed: fail.length, iddealer: iddealer})
                resolve(jsondata)
            })
        })
    })
}
function getReason(iddealer,panel,week){
    return new Promise(resolve => {
        if(iddealer=='' && panel=='' && week==''){
            var sql = 'WHERE';
        }else if(iddealer!='' && panel=='' && week==''){
            var sql = "WHERE id_dealer='"+iddealer+"' AND";
        }else if(iddealer=='' && panel!='' && week==''){
            var sql = "WHERE panel_reason='"+panel+"' AND";
        }else if(iddealer!='' && panel!='' && week==''){
            var sql = "WHERE id_dealer='"+iddealer+"' AND panel_reason='"+panel+"' AND";
        }else if(iddealer!='' && panel=='' && week!=''){
            var sql = "WHERE id_dealer='"+iddealer+"' AND week_reason="+week+" AND";
        }else if(iddealer=='' && panel!='' && week!=''){
            var sql = "WHERE panel_reason='"+panel+"' AND week_reason="+week+" AND";
        }else if(iddealer=='' && panel=='' && week!=''){
            var sql = "WHERE week_reason="+week+" AND";
        }else if(iddealer!='' && panel!='' && week!=''){
            var sql = "WHERE id_dealer='"+iddealer+"' AND panel_reason='"+panel+"' AND week_reason="+week+" AND";
        }

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
function getReasonById(iddealer,panel,week){
    return new Promise (resolve => {
        if(iddealer=='' && panel=='' && week==''){ //no,no,no
            var sql = "SELECT * FROM reason"
        }else if(iddealer!='' && panel=='' && week==''){ //yes,no,no
            var sql = "SELECT * FROM reason WHERE id_dealer='"+iddealer+"'"
        }else if(iddealer=='' && panel!='' && week==''){//no,yes,no
            var sql = "SELECT * FROM reason WHERE panel_reason='"+panel+"'"
        }else if(iddealer!='' && panel!='' && week==''){//yes,yes,no
            var sql = "SELECT * FROM reason WHERE id_dealer='"+iddealer+"' AND panel_reason='"+panel+"'"
        }else if(iddealer!='' && panel=='' && week!=''){//yes,no,yes
            var sql = "SELECT * FROM reason WHERE id_dealer='"+iddealer+"' AND week_reason="+week
        }else if(iddealer=='' && panel!='' && week!=''){//no,yes,yes
            var sql = "SELECT * FROM reason WHERE panel_reason='"+panel+"' AND week_reason="+week
        }else if(iddealer=='' && panel=='' && week!=''){//no,no,yes
            var sql = "SELECT * FROM reason WHERE week_reason=1"
        }else if(iddealer!='' && panel!='' && week!=''){//yes,yes,yes
            var sql = "SELECT * FROM reason WHERE id_dealer='"+iddealer+"' AND panel_reason='"+panel+"' AND week_reason=1"
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
            var unregistered = 0;
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
                unregistered = unregistered+result[i].unregistered;
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
                {label: "Nomor tidak terdaftar", y: unregistered},
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
                {label: "Fresh sample (not called)", y: fresh_sample},
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
        var linkdealer;
        var linkweek;
        var linkpanel;
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            if(login.iddealerses!=''){
                var iddealer = login.iddealerses
                if(req.query.dealer!=undefined){
                    res.redirect("../report")
                }else{
                    if(req.query.panel==undefined && req.query.week==undefined){
                        var panel = ""
                        var week = ""
                        var sql = "WHERE id_dealer='"+iddealer+"'";
                        var sqlreason = "WHERE reason.id_dealer='"+iddealer+"'";
                        link = "?"
                    }else if(req.query.panel!=undefined && req.query.week==undefined){
                        var panel = req.query.panel;
                        var week = "";
                        var sql = "WHERE id_dealer='"+iddealer+"' AND panel_interview='"+panel+"'";
                        var sqlreason = "WHERE reason.id_dealer='"+iddealer+"' AND panel_reason='"+panel+"'";
                        link = "?"
                    }else if(req.query.panel==undefined && req.query.week!=undefined){
                        var panel = "";
                        var week = req.query.week;
                        var sql = "WHERE id_dealer='"+iddealer+"' AND week_int="+week;
                        var sqlreason = "WHERE reason.id_dealer='"+iddealer+"' AND week_reason="+week;
                        link = "?"
                    }else if(req.query.panel!=undefined && req.query.week!=undefined){
                        var panel = req.query.panel;
                        var week = req.query.week;
                        var sql = "WHERE id_dealer='"+iddealer+"' AND panel_interview='"+panel+"' AND week_int="+week;
                        var sqlreason = "WHERE reason.id_dealer='"+iddealer+"' AND panel_reason='"+panel+"' AND week_reason="+week;
                        link = "?"
                    }
                }
            }else{
                if(req.query.dealer==undefined && req.query.panel==undefined && req.query.week==undefined){
                    var sql = "";
                    var sqlreason = "";
                    var iddealer = "";
                    var panel = ""
                    var week = ""
                    linkdealer = "?";
                    linkpanel = "?";
                    linkweek = "?";
                }else if(req.query.dealer!=undefined && req.query.panel==undefined && req.query.week==undefined){
                    var iddealer = req.query.dealer;
                    var panel = ""
                    var week = ""
                    var sql = "WHERE id_dealer='"+iddealer+"'";
                    var sqlreason = "WHERE reason.id_dealer='"+iddealer+"'";
                    linkdealer = "?"
                    linkpanel = "?dealer="+iddealer+"&"
                    linkweek = "?dealer="+iddealer+"&"
                }else if(req.query.dealer==undefined && req.query.panel!=undefined && req.query.week==undefined){
                    var iddealer = "";
                    var panel = req.query.panel
                    var week = ""
                    var sql = "WHERE panel_interview='"+panel+"'";
                    var sqlreason = "WHERE reason.panel_reason='"+panel+"'";
                    linkdealer = "?panel="+panel+"&"
                    linkpanel = "?"
                    linkweek = "?panel="+panel+"&"
                }else if(req.query.dealer!=undefined && req.query.panel!=undefined && req.query.week==undefined){
                    var iddealer = req.query.dealer;
                    var panel = req.query.panel;
                    var week = ""
                    var sql = "WHERE id_dealer='"+iddealer+"' AND panel_interview='"+panel+"'";
                    var sqlreason = "WHERE reason.id_dealer='"+iddealer+"' AND panel_reason='"+panel+"'";
                    linkdealer = "?panel="+panel+"&"
                    linkpanel = "?dealer="+iddealer+"&"
                    linkweek = "?dealer="+iddealer+"&panel="+panel+"&"
                }else if(req.query.dealer!=undefined && req.query.panel==undefined && req.query.week!=undefined){
                    var iddealer = req.query.dealer;
                    var panel = ""
                    var week = req.query.week
                    var sql = "WHERE id_dealer='"+iddealer+"' AND week_int="+week;
                    var sqlreason = "WHERE reason.id_dealer='"+iddealer+"' AND week_reason="+week;
                    linkdealer = "?week="+week+"&"
                    linkpanel = "?dealer="+iddealer+"&week="+week+"&"
                    linkweek = "?dealer="+iddealer+"&"
                }else if(req.query.dealer==undefined && req.query.panel!=undefined && req.query.week!=undefined){
                    var iddealer = "";
                    var panel = req.query.panel;
                    var week = req.query.week
                    linkdealer = "?panel="+panel+"&week="+week+"&"
                    linkpanel = "?week="+week+"&"
                    linkweek = "?panel="+panel+"&"
                    var sql = "WHERE panel_interview='"+panel+"' AND week_int="+week;
                    var sqlreason = "WHERE reason.panel_reason='"+panel+"' AND week_reason="+week;
                }else if(req.query.dealer==undefined && req.query.panel==undefined && req.query.week!=undefined){
                    var iddealer = "";
                    var panel = "";
                    var week = req.query.week;
                    linkdealer = "?week="+week+"&"
                    linkpanel = "?week="+week+"&"
                    linkweek = "?"
                    var sql = "WHERE week_int="+week;
                    var sqlreason = "WHERE week_reason="+week;
                }else if(req.query.dealer!=undefined && req.query.panel!=undefined && req.query.week!=undefined){
                    var iddealer = req.query.dealer;
                    var panel = req.query.panel;
                    var week = req.query.week;
                    var sql = "WHERE id_dealer='"+iddealer+"' AND panel_interview='"+panel+"' AND week_int="+week;
                    var sqlreason = "WHERE reason.id_dealer='"+iddealer+"' AND panel_reason='"+panel+"' AND week_reason="+week;
                    linkdealer = "?panel="+panel+"&week="+week+"&"
                    linkpanel = "?dealer="+iddealer+"&week="+week+"&"
                    linkweek = "?dealer="+iddealer+"&panel="+panel+"&"
                }
            }
            var control = ({iddealer: iddealer, panel: panel, linkdealer: linkdealer, linkpanel: linkpanel, linkweek: linkweek, week: week})
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
                            var countfunct = await successinterview(iddealer,panel,week)
                            successpercent = (countfunct.success * 100) / countint 
                            failedpercent = (countfunct.failed * 100) / countint
                            success = countfunct.success
                            failed = countfunct.failed
                        }
                        var reasonlength = reason.length
                        var countreason = await getReason(iddealer,panel,week)
                        var jsonpercent = ({
                            percentpersonal: (countreason.personal * 100) / reasonlength,
                            percenttechnical: (countreason.technical * 100) / reasonlength,
                            percentother: (countreason.other * 100) / reasonlength
                        })
                        var reasonById = await getReasonById(iddealer,panel,week)
                        var dealer = await getReasonPerDealer(iddealer);
                        // console.log(reasonById)
                        var reasonperid = []
                        for (let i = 0; i < dealer.length; i++) {
                            var getreasonperid = await getReasonById(dealer[i].id_dealer,panel,week)
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
                                        {label: "Nomor tidak terdaftar", value: getreasonperid[16].y},
                                        {label: "Tidak bisa dihubungi", value: getreasonperid[17].y},
                                        {label: "Tulalit", value: getreasonperid[18].y},
                                        {label: "Nomor telepon yang diberikan adalah milik relatif", value: getreasonperid[19].y},
                                        {label: "Salah sambung", value: getreasonperid[20].y},
                                        {label: "Wawancara terputus", value: getreasonperid[21].y},
                                        {label: "Telepon tidak diangkat", value: getreasonperid[22].y},
                                        {label: "Nomor sibuk", value: getreasonperid[23].y},
                                        {label: "Suara tidak jelas", value: getreasonperid[24].y},
                                        {label: "Telepon selalu ditolak", value: getreasonperid[25].y},
                                        {label: "Nomor Fax / modem", value: getreasonperid[26].y},
                                        {label: "Dead Sample (sudah dikontak 8 kali)", value: getreasonperid[27].y},
                                        {label: "Data Duplicated", value: getreasonperid[28].y},
                                        {label: "Fresh sample (not called)", value: getreasonperid[29].y},
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
                            control: control
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
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            res.render("importreport",{
                login: login,
                moment: moment
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
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            let uploadPath;
            var panel = req.body.panel;
            var week = req.body.week;
            var month = req.body.month;
            let getdate = new Date();
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var filename = req.files.filexls;
            var extension = path.extname(filename.name);
            var newfilename = "REP_"+panel+"_"+formatdate+extension
            if(extension==".xlsx" || extension=="xls"){
                uploadPath = "public/filexls/report/"+newfilename
                filename.mv(uploadPath, function(errupload){
                    var datainterview = ({filename_excelint: newfilename, week_excelint: week, month_excelint: month, upload_excelint: getdate, update_excelint: getdate, panel_excelint: panel})
                    db.query("INSERT INTO excel_interview SET ?", [datainterview], (err,result) => {
                        if(errupload || err){
                            throw err;
                        }else{
                            db.query("SELECT * FROM excel_interview WHERE filename_excelint=?", [newfilename], (err1, resint) => {
                                res.redirect("../report/readfile/"+resint[0].id_excelint+"/"+newfilename+"/"+resint[0].panel_excelint+"/"+resint[0].week_excelint)
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
function getReasonValue(reason){
    return new Promise(resolve => {
        var label = ["karyawan","tidak_sesuai","tidak_pernah_service","supir","mobil_dijual","orang_lain","menolak_diawal","expatriat","menolak_ditengah","sibuk","diluar_negeri","mailbox","tidak_aktif","no_signal","dialihkan","no_tidaklengkap","unregistered","not_connected","tulalit","no_relatif","salah_sambung","terputus","tidak_diangkat","no_sibuk","unclear_voice","reject","fax_modem","dead_sample","duplicate","fresh_sample"]
        var no = 0
        if(reason>=42 && reason<=71){
            for (let i = 42; i <= 71; i++) {
                no++;
                if(reason==i){
                    resolve(label[no-1])
                }
            }
        }else{
            resolve("no label")
        }
    })
}
function formatdate(dateinput){
    return new Promise(resolve =>{
        var convertexceldate = (dateinput - (25567 + 2)) * 86400 * 1000
        var dateexcel = moment(convertexceldate).format("YYYY-MM-DD HH:mm:ss")
        resolve(dateexcel);
    })
}
function getdetailexcelint(id,panel,week){
    return new Promise(resolve => {
        db.query("SELECT * FROM excel_interview WHERE id_excelint=? AND panel_excelint=? AND week_excelint=?", [id,panel,week], function(err,result){
            resolve(result)
        })
    })
}
exports.readFileReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
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
                for(var i=0;i<data.length;i++){
                    var idexcelint = req.params.idfiles;
                    var panel = req.params.panel;
                    var week = req.params.week;
                    var detailexcelint = await getdetailexcelint(idexcelint,panel,week)
                    var monthint = detailexcelint[0].month_excelint
                    var datasukses = data[i]["Sukses interview"]
                    if(datasukses==1){
                        sukses = 1
                    }else{
                        sukses = 0
                    }
                    var dealercode = data[i]["Dealer Code"]
                    // var dealername = data[i].namaDealer
                    var chassisno = data[i]["ChassisNo"]
                    var detailuser = await getdetailuser(chassisno)
                    var date = await formatdate(data[i]["Date Interview"])
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
                        week_int: week,
                        month_int: monthint,
                        id_dealer: dealercode,
                        chassis_no: chassisno,
                        user_name: user_name,
                        no_hp: no_hp,
                        type_unit: type_unit,
                        panel_interview: panel,
                        success_int: sukses,
                        attempt_int: 1,
                        date_interview: date
                    })
                    
                    db.query("INSERT INTO interviews set ?", [inputinterviews], (errsavecust,savecust) => {
                        if(errsavecust){
                            console.log(errsavecust)
                        }
                    })
                    if(sukses!=1){
                        var lastid = await getlastid();
                        var status = await getReasonValue(data[i].CatiExtendedStatus)
                        
                        // console.log(status)
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
                            week_reason: week,
                            month_reason: monthint,
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
                        // db.query("INSERT INTO reason (id_interview,id_excelint,panel_reason,week_reason,id_dealer,chassis_no,cat_reason,"+status+") VALUES (?,?,?,?,?,?,?,?)", [lastid,idexcelint,panel,week,dealercode,chassisno,"other",1], (errsavereason) => {
                        //     if(errsavereason){
                        //         console.log(errsavereason)
                        //     }
                        // })
                        db.query("INSERT INTO reason set ?", [savereason], (errsavereason) => {
                            if(errsavereason){
                                console.log(errsavereason)
                            }
                        })
                    }
                }
                
                res.redirect("../../../../")
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
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
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
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
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
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
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
                    var dealercode = data[i]["Dealer Code"]
                    var dealername = data[i]["Dealer Name"]
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
        if(iddealer!=""){
            var sql = " WHERE id_dealer='"+iddealer+"'"
        }else{
            var sql = ""
        }
        db.query("SELECT * FROM dealer"+sql, function (err,result){
            if(result.length>0){
                resolve(result)
            }else{
                resolve(null)
            }
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

function countInterviewByIdDealer(iddealer,panel){
    return new Promise(resolve => {
        if(panel!=""){
            var sql = " AND panel_interview='"+panel+"'"
        }else{
            var sql = ""
        }
        db.query("SELECT * FROM interviews WHERE id_dealer=?"+sql, iddealer, function(err,result) {
            var countsuccess = 0;
            for(var i=0;i<result.length;i++){
                if(result[i].success_int==1){
                    countsuccess = countsuccess+1
                }
            }
            var jsondata = ({count: result.length, countsuccess: countsuccess})
            resolve(jsondata)
        })
    })
}

exports.downloadReport = async function(req,res){
    if(!req.session.loggedin){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var newfilename = "REP_"+formatdate+".xlsx";
            if(req.params.iddealer=='all'){
                var dealer = ''
            }else{
                var dealer = req.params.iddealer
            }
            if(req.params.panel=='all'){
                var panel = ''
            }else{
                var panel = req.params.panel
            }
            var header = [
                    [
                        "Dealer",
                        "Dealer Code",
                        "Dealer Type",
                        "Dealer City",
                        "Dealer Region ",
                        "Database received / provided",
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
                        "Nomor tidak terdaftar",
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
                        "Fresh sample (not called)",
                        "Success Interview"
                    ]
                ]
            var dealerById = await getDealerByID(dealer)
            var csidata = []
            var ssidata = []
            if(req.params.panel=="CSI" || req.params.panel=="all"){
                for(var i=0;i<dealerById.length;i++){
                    var countinterviewperdealer = await countInterviewByIdDealer(dealerById[i].id_dealer,"CSI")
                    if(countinterviewperdealer.count==0){
                        var percentage = 0
                    }else{
                        var percentage = Math.floor(countinterviewperdealer.countsuccess/countinterviewperdealer.count*100)
                    }
                    var reasonperdealer = await getReasonById(dealerById[i].id_dealer,"CSI")
                    csidata.push([
                        dealerById[i].name_dealer,
                        dealerById[i].id_dealer,
                        dealerById[i].type_dealer,
                        dealerById[i].city_dealer,
                        dealerById[i].region_dealer,
                        countinterviewperdealer.count,
                        countinterviewperdealer.countsuccess,
                        "","",
                        reasonperdealer[0].y,
                        reasonperdealer[1].y,
                        reasonperdealer[2].y,
                        reasonperdealer[3].y,
                        reasonperdealer[4].y,
                        reasonperdealer[5].y,
                        reasonperdealer[6].y,
                        reasonperdealer[7].y,
                        reasonperdealer[8].y,
                        reasonperdealer[9].y,
                        reasonperdealer[10].y,
                        reasonperdealer[11].y,
                        reasonperdealer[12].y,
                        reasonperdealer[13].y,
                        reasonperdealer[14].y,
                        reasonperdealer[15].y,
                        reasonperdealer[16].y,
                        reasonperdealer[17].y,
                        reasonperdealer[18].y,
                        reasonperdealer[19].y,
                        reasonperdealer[20].y,
                        reasonperdealer[21].y,
                        reasonperdealer[22].y,
                        reasonperdealer[23].y,
                        reasonperdealer[24].y,
                        reasonperdealer[25].y,
                        reasonperdealer[26].y,
                        reasonperdealer[27].y,
                        reasonperdealer[28].y,
                        reasonperdealer[29].y,
                        percentage+"%"
                    ])
                }
            }

            if(req.params.panel=="SSI" || req.params.panel=="all"){
                for(var x=0;x<dealerById.length;x++){
                    var countinterviewperdealer = await countInterviewByIdDealer(dealerById[x].id_dealer,"SSI")
                    if(countinterviewperdealer.count==0){
                        var percentage = 0
                    }else{
                        var percentage = Math.floor(countinterviewperdealer.countsuccess/countinterviewperdealer.count*100)
                    }
                    var reasonperdealer = await getReasonById(dealerById[x].id_dealer,"SSI")
                    ssidata.push([
                        dealerById[x].name_dealer,
                        dealerById[x].id_dealer,
                        dealerById[x].type_dealer,
                        dealerById[x].city_dealer,
                        dealerById[x].region_dealer,
                        countinterviewperdealer.count,
                        countinterviewperdealer.countsuccess,
                        "","",
                        reasonperdealer[0].y,
                        reasonperdealer[1].y,
                        reasonperdealer[2].y,
                        reasonperdealer[3].y,
                        reasonperdealer[4].y,
                        reasonperdealer[5].y,
                        reasonperdealer[6].y,
                        reasonperdealer[7].y,
                        reasonperdealer[8].y,
                        reasonperdealer[9].y,
                        reasonperdealer[10].y,
                        reasonperdealer[11].y,
                        reasonperdealer[12].y,
                        reasonperdealer[13].y,
                        reasonperdealer[14].y,
                        reasonperdealer[15].y,
                        reasonperdealer[16].y,
                        reasonperdealer[17].y,
                        reasonperdealer[18].y,
                        reasonperdealer[19].y,
                        reasonperdealer[20].y,
                        reasonperdealer[21].y,
                        reasonperdealer[22].y,
                        reasonperdealer[23].y,
                        reasonperdealer[24].y,
                        reasonperdealer[25].y,
                        reasonperdealer[26].y,
                        reasonperdealer[27].y,
                        reasonperdealer[28].y,
                        reasonperdealer[29].y,
                        percentage+"%"
                    ])
                }
            }

            var csifile = header.concat(csidata)
            var ssifile = header.concat(ssidata)
            const progress = xlsfile.build([{name: "CSI", data: csifile},{name: "SSI", data: ssifile}])
            fs.writeFile("public/filexls/report/download/"+newfilename, progress, (err) => {
                if(err){
                    console.log(err)
                }else{
                    res.render("downloadreport", {
                        login: login,
                        moment: moment,
                        filename: newfilename
                    })
                }
            })
        }else{
            res.redirect("../../")
        }
    }
}


exports.getPdfReport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        console.log(login.iddealerses)
        if(login.iddealerses!=""){
            if(req.query.panel!=undefined){
                var panel = req.query.panel
                var sql = " WHERE panel_report='"+panel+"' AND id_dealer='"+login.iddealerses+"'"
            }else if(req.query.search!=undefined){
                var search = req.query.search
                var sql = " WHERE id_dealer LIKE '%"+search+"%' OR pdf_filename LIKE '%"+search+"%' AND id_dealer='"+login.iddealerses+"'"
            }else{
                var sql = " WHERE id_dealer='"+login.iddealerses+"'";
            }
        }else{
            if(req.query.panel!=undefined){
                var panel = req.query.panel
                var sql = " WHERE panel_report='"+panel+"'"
            }else if(req.query.search!=undefined){
                var search = req.query.search
                var sql = " WHERE id_dealer LIKE '%"+search+"%' OR pdf_filename LIKE '%"+search+"%'"
            }else{
                var sql = "";
            }
        }
        console.log(sql)
        db.query("SELECT * FROM pdf_file"+sql+" ORDER BY upload_file DESC", (err,result)=>{
            res.render("listpdf", {
                login: login,
                moment: moment,
                result: result
            })
        })
    }
}

exports.getPdfImport = (req,res) => {
    if(!req.session.loggedin){
        res.redirect("../../../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
        db.query("SELECT * FROM dealer ORDER BY name_dealer", (err,result) => {
            res.render("importpdf", {
                login: login,
                result: result
            })
        })
    }
}



exports.savePdfReport = async function(req,res) {
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            let uploadPath;
            var dealer = req.body.dealer;
            var getdealer = await getDealerByID(dealer)
            var deralername = getdealer[0].name_dealer
            var panel = req.body.panel;
            var monthpdf = req.body.monthpdf;
            let getdate = new Date();
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var date = moment().format("DD")
            var year = moment().format("YYYY")
            var filename = req.files.filepdf;
            var extension = path.extname(filename.name);
            var newfilename = panel+" REPORT "+monthpdf+" "+year+" - "+dealer+" "+deralername+extension
            if(extension==".pdf"){
                uploadPath = "public/filepdf/"+newfilename
                filename.mv(uploadPath, function(errupload){
                    var dataupload = ({id_dealer: dealer, panel_report: panel, month_reportpdf: monthpdf, pdf_filename: newfilename, upload_file: getdate})
                    db.query("INSERT INTO pdf_file SET ?", [dataupload], (err,result) => {
                        if(errupload || err){
                            throw err;
                        }else{
                            res.redirect("../pdf/download/")
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


exports.getToplineReport = (req,res) => {
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
    if(login.typeses!="super"){
        return res.redirect("../../")
    }
    if(req.query.search!=undefined){
        var search = req.query.search
        var sql = "SELECT * FROM topline_file WHERE month_topline LIKE '%"+search+"%' OR topline_filename LIKE '%"+search+"%' " 
    }else{
        var sql = "SELECT * FROM topline_file"
    }
    db.query(sql,(err,result) => {
        res.render("topline",{
            login:login,
            moment: moment,
            results: result
        })
    })
    
}

exports.getToplineImport = (req,res) => {
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
    if(login.typeses!="super"){
        return res.redirect("../../")
    }
    res.render("importtopline",{
        login: login,
        moment: moment
    })
}

exports.saveToplineReport = async function(req,res){
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            let uploadPath;
            var panel = req.body.panel;
            var monthtopline = req.body.monthtopline;
            let getdate = new Date();
            var formatdate = moment().format("YYYY_MM_DD_HH_mm_ss");
            var date = moment().format("DD")
            var year = moment().format("YYYY")
            var filename = req.files.filepdf;
            var extension = path.extname(filename.name);
            var newfilename = panel+" TOPLINE REPORT "+monthtopline+" - "+year+extension
            if(extension==".xls" || extension==".xlsx"){
                uploadPath = "public/filetopline/"+newfilename
                filename.mv(uploadPath, function(errupload){
                    var dataupload = ({panel_topline: panel, month_topline: monthtopline, topline_filename: newfilename, upload_topline: getdate})
                    db.query("INSERT INTO topline_file SET ?", [dataupload], (err,result) => {
                        if(errupload || err){
                            throw err;
                        }else{
                            res.redirect("../topline/download/")
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


exports.getPPTReport = async function(req,res){
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
    if(login.typeses!="super"){
        return res.redirect("../../")
    }
    if(req.query.search!=undefined){
        var search = req.query.search
        var sql = "SELECT * FROM ppt_file WHERE month_ppt LIKE '%"+search+"%' OR ppt_filename LIKE '%"+search+"%' " 
    }else{
        var sql = "SELECT * FROM ppt_file"
    }
    db.query(sql,(err,result) => {
        res.render("listppt",{
            login:login,
            moment: moment,
            results: result
        })
    })
}

exports.getPPTImport = (req,res) => {
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type, iddealerses: req.session.iddealer})
    if(login.typeses!="super"){
        return res.redirect("../../")
    }
    res.render("importppt",{
        login: login,
        moment: moment
    })
}


exports.savePPTReport = async function(req,res){
    if(!req.session.loggedin){
        res.redirect("../login")
    }else{
        var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
        if(login.typeses=="admin" || login.typeses=="super" || login.typeses=="coordinator"){
            let uploadPath;
            var panel = req.body.panel;
            var monthppt = req.body.monthppt;
            let getdate = new Date();
            var year = moment().format("YYYY")
            var filename = req.files.fileppt;
            var extension = path.extname(filename.name);
            var newfilename = panel+" REPORT "+monthppt+" - "+year+extension
            if(extension==".ppt" || extension==".pptx"){
                uploadPath = "public/fileppt/"+newfilename
                filename.mv(uploadPath, function(errupload){
                    var dataupload = ({panel_ppt: panel, month_ppt: monthppt, ppt_filename: newfilename, upload_ppt: getdate})
                    db.query("INSERT INTO ppt_file SET ?", [dataupload], (err,result) => {
                        if(errupload || err){
                            throw err;
                        }else{
                            res.redirect("../ppt/download/")
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