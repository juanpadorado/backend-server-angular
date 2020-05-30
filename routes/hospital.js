// Requires
var express = require("express");
var mdAuth = require("../middlewares/autenticacion");

var app = express();

var Hospital = require("../models/hospital");

// Rutas

// Obtener todos los Hospitals
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando hospitales",
                    errors: err,
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    totalHospitales: conteo,
                });
            });
        });
});

// Actualizar hospital
app.put("/:id", mdAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err,
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con id " + id + " no existe",
                errors: { message: "No existe un hospital con ese id" },
            });
        }

        hospital.nombre = body.nombre;

        hospital.save((err, hosp) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: err,
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hosp,
            });
        });
    });
});

// Crear Hospital
app.post("/", mdAuth.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
    });

    hospital.save((err, hosp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear hospital",
                errors: err,
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hosp,
        });
    });
});

// Borra Hospital
app.delete("/:id", mdAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err,
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con id " + id + " no existe",
                errors: { message: "No existe un hospital con ese id" },
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospital,
        });
    });
});

module.exports = app;