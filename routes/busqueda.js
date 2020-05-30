// Requires
var express = require("express");
var mdAuth = require("../middlewares/autenticacion");

var app = express();

var Medico = require("../models/medico");
var Hospital = require("../models/hospital");
var Usuario = require("../models/usuario");

// Rutas

// Busqueda especifica
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");
    var promesa;
    if (tabla === "medicos") {
        promesa = buscarMedicos(regex);
    } else if (tabla === "usuarios") {
        promesa = buscarUsuarios(regex);
    } else if (tabla === "hospitales") {
        promesa = buscarHospitales(regex);
    } else {
        res.status(400).json({
            ok: false,
            mensaje: "Tabla no encontrada",
            error: { mensaje: "Tabla no encontrada" },
        });
        return;
    }

    promesa.then((resp) => {
        res.status(200).json({
            ok: true,
            [tabla]: resp,
        });
    });
});

// Busqueda general
app.get("/todo/:busqueda", (req, res) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex),
    ]).then((resp) => {
        res.status(200).json({
            ok: true,
            hospitales: resp[0],
            medicos: resp[1],
            usuarios: resp[2],
        });
    });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales " + err);
                }

                resolve(hospitales);
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos " + err);
                }

                resolve(medicos);
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, "nombre email rol")
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al cargar usuarios " + err);
                }

                resolve(usuarios);
            });
    });
}

module.exports = app;