const express = require('express')
const mysql = require('mysql')

const PORT = process.env.PORT || 3000

const app = express()

const connection = mysql.createConnection({
    host:'sql12.freesqldatabase.com',
    user:'sql12353831',
    database:'sql12353831',
    password:'Y4jgHbkEtI',
    port:'3306'
})

connection.connect((err) => {
    err ? console.log(err) : console.log(connection);
})

require('./routes/html-routes')(app, connection);
app.listen(PORT, () => {
    console.log(`App running on Port ${PORT}`)
})