// Requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

//Google
var CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

var app = express();

var Usuario = require("../models/usuario");

/* Autenticacion norma */
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
            token: token,
            usuario: user,
            id: user._id,
        });
    });
});

/* Autenticacion mediante google */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
}

app.post("/google", async(req, res) => {
    var body = req.body;

    var googleUser = await verify(body.token).catch((e) => {
        return res.status(403).json({
            ok: false,
            message: "Token no válido",
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }

        if (usuario) {
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar su autenticación normal",
                });
            } else {
                // Crear token
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

                return res.status(201).json({
                    ok: true,
                    token: token,
                    usuario: usuario,
                    id: usuario._id,
                });
            }
        } else {
            // El usuario no existe
            var user = new Usuario();

            user.nombre = googleUser.nombre;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = googleUser.google;
            user.password = ":)";

            user.save((err, userCre) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al crear usuario",
                        errors: err,
                    });
                }

                var token = jwt.sign({ usuario: userCre }, SEED, { expiresIn: 14400 });

                return res.status(201).json({
                    ok: true,
                    token: token,
                    usuario: userCre,
                    id: userCre._id,
                });
            });
        }
    });
});

module.exports = app;