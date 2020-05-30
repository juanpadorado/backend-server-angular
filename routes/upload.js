// Requires
var express = require("express");
var mdAuth = require("../middlewares/autenticacion");
var fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();

app.use(fileUpload());

var Medico = require("../models/medico");
var Hospital = require("../models/hospital");
var Usuario = require("../models/usuario");

// Rutas

// Subir archivo
app.put("/:tabla/:id", (req, res) => {
    var tabla = req.params.tabla;
    var id = req.params.id;

    // Tipos de colecciones
    var tablaValid = ["usuarios", "hospitales", "medicos"];

    if (tablaValid.indexOf(tabla) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tabla no válida",
            errors: {
                message: "Tabla no válida",
            },
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono ninguna imagen",
            errors: { message: "No selecciono ninguna imagen" },
        });
    }

    var archivo = req.files.imagen;
    var nombreCort = archivo.name.split(".");
    var extencion = nombreCort[nombreCort.length - 1];
    var extencionesVali = ["png", "jpg", "jpeg", "gif"];
    if (extencionesVali.indexOf(extencion) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extension no válida",
            errors: {
                message: "Las extensiones validas son: " + extencionesVali.join(", "),
            },
        });
    }

    // Nombre de archivo
    var nombreArch = `${id}-${new Date().getMilliseconds()}.${extencion}`;

    // Mover archivo a un patch en especifico
    var path = `./uploads/${tabla}/${nombreArch}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err,
            });
        }

        subirPorTipo(tabla, id, nombreArch, res);
    });
});

function subirPorTipo(tabla, id, nombreArchivo, res) {
    if (tabla === "usuarios") {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Usuario no existe",
                    errors: {
                        message: "Usuario no existe",
                    },
                });
            }
            var pathViejo = "./uploads/usuarios/" + usuario.img;

            //Elimina imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuAtualizado) => {
                usuAtualizado.password = "";

                return res.status(200).json({
                    ok: true,
                    mensaje: "Archivo cargado correctamente",
                    usuario: usuAtualizado,
                });
            });
        });
    } else if (tabla === "medicos") {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Medico no existe",
                    errors: {
                        message: "Medico no existe",
                    },
                });
            }

            var pathViejo = "./uploads/medicos/" + medico.img;

            //Elimina imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoAct) => {
                medicoAct.password = "";

                return res.status(200).json({
                    ok: true,
                    mensaje: "Archivo cargado correctamente",
                    medico: medicoAct,
                });
            });
        });
    } else if (tabla === "hospitales") {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Hospital no existe",
                    errors: {
                        message: "Hospital no existe",
                    },
                });
            }

            var pathViejo = "./uploads/hospitales/" + hospital.img;

            //Elimina imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalAct) => {
                hospitalAct.password = "";

                return res.status(200).json({
                    ok: true,
                    mensaje: "Archivo cargado correctamente",
                    hospital: hospitalAct,
                });
            });
        });
    }
}

module.exports = app;