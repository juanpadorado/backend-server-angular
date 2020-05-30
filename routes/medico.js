// Requires
var express = require("express");
var mdAuth = require("../middlewares/autenticacion");

var app = express();

var Medico = require("../models/medico");

// Rutas

// Obtener todos los Medicos
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .populate("hospital")
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando medicos",
                    errors: err,
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    totalHospitales: conteo,
                });
            });
        });
});

// Actualizar Medico
app.put("/:id", mdAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err,
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con id " + id + " no existe",
                errors: { message: "No existe un medico con ese id" },
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;

        medico.save((err, med) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err,
                });
            }

            res.status(200).json({
                ok: true,
                medico: med,
            });
        });
    });
});

// Crear Medico
app.post("/", mdAuth.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital,
    });

    medico.save((err, med) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear medico",
                errors: err,
            });
        }

        res.status(201).json({
            ok: true,
            medico: med,
        });
    });
});

// Borra Medico
app.delete("/:id", mdAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err,
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con id " + id + " no existe",
                errors: { message: "No existe un medico con ese id" },
            });
        }

        res.status(200).json({
            ok: true,
            medico: medico,
        });
    });
});

module.exports = app;