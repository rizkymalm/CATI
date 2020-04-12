const mysql = require("mysql");

// const con = mysql.createConnection({
//     host: "remotemysql.com",
//     user: "OnHyc3CMVU",
//     password: "ylrB9vfDWB",
//     database: "OnHyc3CMVU"
// })

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kadence-cati"
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;