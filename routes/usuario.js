// Requires
var express = require("express");
var bcrypt = require("bcryptjs");

var mdAuth = require("../middlewares/autenticacion");

var app = express();

var Usuario = require("../models/usuario");

// Rutas

// Obtener todos los usuarios
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, "nombre email img role")
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuarios",
                    errors: err,
                });
            }

            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    totalUsuarios: conteo,
                });
            });
        });
});

// Actualizar usuario
app.put("/:id", mdAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con id " + id + " no existe",
                errors: { message: "No existe un usuario con ese id" },
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, user) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err,
                });
            }

            user.password = "";

            res.status(200).json({
                ok: true,
                usuario: user,
            });
        });
    });
});

// Crear usuario
app.post("/", mdAuth.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    usuario.save((err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: err,
            });
        }

        res.status(201).json({
            ok: true,
            usuario: user,
        });
    });
});

// Borra usuario
app.delete("/:id", mdAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con id " + id + " no existe",
                errors: { message: "No existe un usuario con ese id" },
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuario,
        });
    });
});

module.exports = app;