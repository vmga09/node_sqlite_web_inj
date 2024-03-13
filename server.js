// Create express app
const express = require("express")
const app = express()
//Conexion base de datos sqlite
const db = require("./db/database")
//Encrip y jwt
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
const HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});



// Insert here other API endpoints

//List all user 
app.get("/api/users", (req, res, next) => {
    const sql = "select * from user"
    const params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});


//List all coffe
app.get("/api/coffe", (req, res, next) => {
    const sql = "select * from coffees"
    const params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});




//Obtener un usuario 
app.get("/api/user/:id", (req, res, next) => {
    const sql = "select * from user where id = ?"
    const params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

//Crear usuario 
app.post("/api/user/", async (req, res, next) => {
    const errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    const data = {
        name: req.body.name,
        email: req.body.email,
        rol: req.body.rol,
        passHash : await bcryptjs.hash(req.body.password,8)
    }
    const sql ='INSERT INTO user (name, email, password,rol) VALUES (?,?,?,?)'
    const params =[data.name, data.email, data.passHash, data.rol]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
});



// Update user
app.patch("/api/user/:id", async (req, res, next) => {
    const  data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? await bcryptjs.hash(req.body.password,8) : null
    }
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
});

// Delete user from db
app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})




// Function login user 
app.post("/api/login", async (req, res, next) => {
    const jwtTiempoEx = '7d'
    const jwtSecreto = "S3cr3t0"
    const errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    const data = {
        email: req.body.email,
        password: req.body.password
    }

    const sql ='select * from user where email=?'
    const params =[data.email]
    



    db.get(sql, params, async function (err, row) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        } else {
            console.log(row)
            if(row === undefined || ! (await bcryptjs.compare(data.password, row.password))){
                res.status(400).json({
                    "message": "Usuario o password incorrectos"
                })

            } else { 
                const newId = row.id
                const token = jwt.sign({id:newId},jwtSecreto,{expiresIn:jwtTiempoEx})
                res.status(200).json({
                    "message":"usuario logueado",
                    token
                })
            }
        }

    });
});




// Default response for any other request
app.use(function(req, res){
    res.status(404);
});