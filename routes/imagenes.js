// Requires
var express = require("express");
var mdAuth = require("../middlewares/autenticacion");
const path = require("path");
var fs = require("fs");

var app = express();

var Medico = require("../models/medico");
var Hospital = require("../models/hospital");
var Usuario = require("../models/usuario");

// Rutas

// Subir archivo
app.get("/:tabla/:img", (req, res) => {
    var tabla = req.params.tabla;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../uploads/${tabla}/${img}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        var noImg = path.resolve(__dirname, "../assets/no-img.jpg");
        res.sendFile(noImg);
    }
});

module.exports = app;