const mysql = require('mysql')

module.exports = (app, connection) => {
    app.get('/', (req, res) => {
        connection.query('SELECT * FROM problems', (err, data) => {
            err ? res.send(err) : res.json(data)
        })
    })
}