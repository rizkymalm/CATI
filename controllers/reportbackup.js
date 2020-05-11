for(var i=0;i<data.length;i++){
    var idexcelint = req.params.idfiles;
    var panel = req.params.panel;
    var week = req.params.week;
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







for(var i=0;i<data.length;i++){
    var idexcelint = req.params.idfiles;
    var panel = req.params.panel;
    var week = req.params.week;
    if(data[i].status=="complete"){
        var sukses = 1
    }else{
        var sukses = 0
    }
    var dealercode = data[i].DealerCode
    var dealername = data[i].namaDealer
    var chassisno = data[i].ChassisNo
    var detailuser = await getdetailuser(chassisno)
    var date = data[i].interview_start;
    if(detailuser.check==true){
        var user_name = detailuser.username;
        var no_hp = detailuser.no_hp;
        var type_unit = detailuser.model;
        console.log("ada")
    }else{
        var user_name = data[i].RespondentName
        var no_hp = data[i].TelephoneNumber
        var type_unit = data[i].Model
        console.log("ga ada")
    }
    var inputinterviews = ({
        id_excelint: idexcelint,
        week_int: week,
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
    if(sukses!=1 && data[i].CatiExtendedStatus>=42 && data[i].CatiExtendedStatus<=71){
        var lastid = await getlastid();
        var status = await getReasonValue(data[i].CatiExtendedStatus)
        // if(status==42){
        //     var label = "karyawan"
        // }else if(status==43){
        //     var label = "tidak_sesuai"
        // }else if(status==42){
        //     var label = "tidak_sesuai"
        // }
    //     var karyawan =await getnulldata (data[i]["Karyawan Nissan"])
    //     var tidak_sesuai =await getnulldata (data[i]["Tidak sesuai dengan nama yang dicari (A)"])
    //     var tidak_pernah_service =await getnulldata (data[i]["Tidak pernah melakukan servis di dealer Nissan (C2a)"])
    //     var supir =await getnulldata (data[i]["Supir yang melakukan servis di dealer Nissan (D2)"])
    //     var mobil_dijual =await getnulldata (data[i]["Mobil sudah dijual"])
    //     var orang_lain =await getnulldata (data[i]["Orang lain yang melakukan servis di dealer Nissan (D2)"])
    //     var menolak_diawal =await getnulldata (data[i]["Menolak di wawancara (dari awal - B)"])
    //     var expatriat =await getnulldata (data[i]["Expatriat"])
    //     var menolak_ditengah =await getnulldata (data[i]["Menolak untuk melanjutkan wawancara (di tengah-tengah interview)"])
    //     var sibuk =await getnulldata (data[i]["Responden sedang sibuk"])
    //     var diluar_negeri =await getnulldata (data[i]["Sedang di luar negeri"])
    //     var mailbox =await getnulldata (data[i]["Mailbox"])
    //     var tidak_aktif =await getnulldata (data[i]["Nomor tidak aktif"])
    //     var no_signal =await getnulldata (data[i]["Tidak ada sinyal  / tidak ada nada sambung sama sekali"])
    //     var dialihkan =await getnulldata (data[i]["Nomor telepon dialihkan"])
    //     var no_tidaklengkap =await getnulldata (data[i]["Nomor tidak lengkap"])
    //     var not_connected =await getnulldata (data[i]["Tidak bisa dihubungi"])
    //     var tulalit =await getnulldata (data[i]["Tulalit"])
    //     var no_relatif =await getnulldata (data[i]["Nomor telepon yang diberikan adalah milik relatif (suami/istri/anak/supir/dll)"])
    //     var salah_sambung =await getnulldata (data[i]["Salah sambung"])
    //     var terputus =await getnulldata (data[i]["Wawancara terputus"])
    //     var tidak_diangkat =await getnulldata (data[i]["Telepon tidak diangkat"])
    //     var no_sibuk =await getnulldata (data[i]["Nomor sibuk"])
    //     var unclear_voice =await getnulldata (data[i]["Suara tidak jelas"])
    //     var reject =await getnulldata (data[i]["Telepon selalu ditolak / direject oleh pelanggan"])
    //     var fax_modem =await getnulldata (data[i]["Nomor Fax / modem"])
    //     var dead_sample =await getnulldata (data[i]["Dead Sample (sudah dikontak 8 kali)"])
    //     var duplicate =await getnulldata (data[i]["Data Duplicated"])
    //     var fresh_sample =await getnulldata (data[i]["Fresh sample (not called)"])
        // var savereason = ({
        //     id_interview: lastid,
        //     id_excelint: idexcelint,
        //     panel_reason: panel,
        //     week_reason: week,
        //     id_dealer: dealercode,
        //     chassis_no: chassisno,
        //     cat_reason: "other"
            // karyawan: karyawan,
            // tidak_sesuai: tidak_sesuai,
            // tidak_pernah_service: tidak_pernah_service,
            // supir: supir,
            // mobil_dijual: mobil_dijual,
            // orang_lain: orang_lain,
            // menolak_diawal: menolak_diawal,
            // expatriat: expatriat,
            // menolak_ditengah: menolak_ditengah,
            // sibuk: sibuk,
            // diluar_negeri: diluar_negeri,
            // mailbox: mailbox,
            // tidak_aktif: tidak_aktif,
            // no_signal: no_signal,
            // dialihkan: dialihkan,
            // no_tidaklengkap: no_tidaklengkap,
            // not_connected: not_connected,
            // tulalit: tulalit,
            // no_relatif: no_relatif,
            // salah_sambung: salah_sambung,
            // terputus: terputus,
            // tidak_diangkat: tidak_diangkat,
            // no_sibuk: no_sibuk,
            // unclear_voice: unclear_voice,
            // reject: reject,
            // fax_modem: fax_modem,
            // dead_sample: dead_sample,
            // duplicate: duplicate,
            // fresh_sample: fresh_sample,
        // })
        db.query("INSERT INTO reason (id_interview,id_excelint,panel_reason,week_reason,id_dealer,chassis_no,cat_reason,"+status+") VALUES (?,?,?,?,?,?,?,?)", [lastid,idexcelint,panel,week,dealercode,chassisno,"other",1], (errsavereason) => {
            if(errsavereason){
                console.log(errsavereason)
            }
        })
    }
}