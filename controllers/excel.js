const xslx = require("xlsx");
const path = require("path");
exports.getExcel = (req,res) => {
    var workbook  = xslx.readFile("public/filexls/temp/"+req.params.filexls);
    var sheetname_list = workbook.SheetNames;
    sheetname_list.forEach(function(y){
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
        for(var i=0;i<data.length;i++){
            json.push({Head1: data[i].Head1, Head2: data[i].Head2, Head3: data[i].Head3});
        }
        console.log(path.extname('index.html'))
        res.render("excel", {
            data: data,
            jsonxls: json
        })
    })  
}

exports.getDataExcel = (req,res) => {
    var filename = req.body.filexls;
    res.render("upload");
}

exports.saveExcel = (req,res) => {
    let uploadPath;
    if (!req.files || Object.keys(req.files).length === 0) {
        res.send('no file uploaded');
    }else{
        var filename = req.files.filexls;
        var extension = path.extname(filename.name)
        if(extension==".xlsx" || extension==".xls"){
            uploadPath = __dirname+"/public/filexls/temp/"+filename.name
            filename.mv(uploadPath, function(err){
                res.redirect("readfile/"+filename.name)
            })
        }else{
            res.send("Sorry cannot upload file "+extension+" file must be .xls or .xlsx")
        }
    }
}