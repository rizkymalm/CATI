const mysql = require("mysql");

const con = mysql.createConnection({
    host: "remotemysql.com",
    user: "OnHyc3CMVU",
    password: "ylrB9vfDWB",
    database: "OnHyc3CMVU"
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;