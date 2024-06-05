// Create express app
const express = require("express");
const app = express();
const path = require("path");
//Conexion base de datos sqlite
const db = require("./db/database");
//Encrip y jwt
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Server port
const HTTP_PORT = 3500 
// Start server




app.post("/api/countries", async (req, res, next) => {
    const errors=[]


    const params =[]
    db.all(`select id, name, capital, population, currency  from countries where name like '%${req.body.name}%'`, params, function (err, rows) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.status(200).json({ rows
        })
        console.log(rows)
    });
});



app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

