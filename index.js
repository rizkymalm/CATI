const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fileupload = require("express-fileupload");
const IndexRouter = require("./routes/index")
const sgMail = require("@sendgrid/mail")
const db = require("./models/db")
const LoginRouter = require("./routes/login")
const UserRouter = require("./routes/user")
const ReportRouter = require("./routes/report")
const session  = require("express-session")
const path = require("path");

global.baseurl = function(){
	var url = "http://survey.kadence.co.id:8000/";
    return url;
}

const app = express();
app.use(fileupload());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))


app.use("/", IndexRouter);
app.use("/login", LoginRouter);
app.use("/user", UserRouter);
app.use("/report", ReportRouter);

app.get("/logout", function(req,res) {
    var login = ({emailses: req.session.email, nameses: req.session.salesname, idses: req.session.idsales, typeses: req.session.type})
    db.query("DELETE FROM log_session WHERE id_sales=?", login.idses, (err,result) => {
        req.session.destroy();
        res.redirect("/login")
    })
})

app.listen(8000, (req,err) => {
    if(err) throw err;
})