function countservice(idsales){
    return new Promise(resolve => {
        db.query("SELECT COUNT(*) AS countsrv FROM excel_service WHERE id_sales=? ", [idsales], function(err,result){
            resolve(result[0].countsrv)
        })
    })
}
function pageservice(limit,page,idsales){
    return new Promise(resolve => {
        if(page > 1){
            var start = page * limit
        }else{
            var start = 0;
        }
        db.query("SELECT * FROM excel_service JOIN sales ON excel_service.id_sales=sales.id_sales WHERE excel_service.id_sales='"+idsales+"' LIMIT ?, ?", [start,limit], function(err,srv) {
                resolve(srv)
        })
    })
}