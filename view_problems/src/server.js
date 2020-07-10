const express = require('express')
const mysql = require('mysql')
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = process.env.PORT || 8080

const app = express()

var corsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

require("./routes/problems.routes")(app);
app.listen(PORT, () => {
    console.log(`App running on Port ${PORT}`)
})