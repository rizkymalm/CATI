const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fileupload = require("express-fileupload");
const IndexRouter = require("./routes/index")
const ExcelRouter = require("./routes/excel")


const app = express();
app.use(fileupload());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.use("/", IndexRouter);
app.use("/excel", ExcelRouter);
app.post("/save", function(req,res) {
    let uploadPath;
    if (!req.files || Object.keys(req.files).length === 0) {
        res.send('no file uploaded');
    }else{
        var filename = req.files.filexls;
        uploadPath = __dirname+"/public/filexls/temp/"+filename.name
        filename.mv(uploadPath, function(err){
            res.redirect("excel/readfile/"+filename.name)
        })
    }
});


app.listen(8000, (err) => {
    if(err) throw err;
    console.log("connect")
})