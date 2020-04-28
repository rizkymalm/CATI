const mysql = require("mysql");
require("dotenv").config()
// const con = mysql.createConnection({
//     host: "remotemysql.com",
//     user: "OnHyc3CMVU",
//     password: "ylrB9vfDWB",
//     database: "OnHyc3CMVU"
// })

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database:'kadence-cati'
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;