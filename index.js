const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const IndexRouter = require("./routes/index")
const ExcelRouter = require("./routes/excel")


const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.use("/", IndexRouter);
app.use("/excel", ExcelRouter);

app.listen(8000, (err) => {
    if(err) throw err;
    console.log("connect")
})