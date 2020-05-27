// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

var app = express();

var Usuario = require("../models/usuario");

app.post("/", (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas",
                errors: { message: "Credenciales incorrectas" },
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas",
                errors: { message: "Credenciales incorrectas" },
            });
        }

        user.password = "";
        // Crear token
        var token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });

        res.status(201).json({
            ok: true,
            message: "user",
            token: token,
            usuario: user,
            id: user._id,
        });
    });
});

module.exports = app;