const mysql = require("mysql");

// const con = mysql.createConnection({
//     host: "remotemysql.com",
//     user: "OnHyc3CMVU",
//     password: "ylrB9vfDWB",
//     database: "OnHyc3CMVU"
// })

const con = mysql.createConnection({
    host: "sql12.freemysqlhosting.net",
    user: "sql12326975",
    password: "9LHyrhTGxy",
    database: "sql12326975"
})

con.connect(err => {
    if (err){
        throw err;
    }
})
module.exports = con;