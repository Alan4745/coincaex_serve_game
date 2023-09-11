const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

require("dotenv").config();
const cors = require("cors"); // Middleware que ayuda a configurar la politica de mismo origen en la aplicacion

const User = require("./models/user.model");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("¡Hola, Mundo!");
});

app.post("/guardar_usuario", async (req, res) => {
  const module_user = new User();
  const patron = /^@/;

  const parameters = req.body;

  module_user.nombre = parameters.nombre;
  module_user.puntaje = parameters.puntaje;

  if (!patron.test(parameters.nombre)) {
    return res
      .status(500)
      .send({ message: "debes de ingresar @ al principio de tu usuario" });
  }

  let usuario_encontrado = await User.find({ nombre: parameters.nombre });

  console.log(usuario_encontrado.length > 0);

  if (usuario_encontrado.length > 0) {
    return res.status(500).send({ message: usuario_encontrado[0] });
  }

  module_user
    .save()
    .then((save_user) => {
      if (!save_user) {
        return res.status(500).send({ message: "Error saving user" });
      }
      return res
        .status(200)
        .send({ message: "el usuario se a guardado", save_user });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ message: "error al guardar el usuario", err });
    });
});

app.put("/puntaje_jugador/:id_user", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id_user,
    { puntaje: req.body.puntaje },
    { new: true }
  )
    .then((user_update) => {
      if (!user_update) {
        return res
          .status(500)
          .send({ message: "error al actualizar el punajate del usuario" });
      }

      return res.status(200).send({ message: user_update });
    })
    .catch((error) => {
      return res.status(500).send({ message: error });
    });
});

app.get("/puntacion", (req, res) => {
  User.find()
    .then((usuario_puntaciones) => {
      return res.status(200).send({ message: usuario_puntaciones });
    })
    .catch((error) => {
      return res.status(500).send({ message: error });
    });
});

const puerto = 3000;

console.log(process.env.DATABASE_URL);
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexión a MongoDB exitosa");

    app.listen(puerto, () => {
      console.log(`El servidor está escuchando en el puerto ${puerto}`);
    });
  })
  .catch((error) => {
    console.log("error", error);
  });
