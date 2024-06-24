const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require('express-validator');
require("dotenv").config();

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;

// Conexión a la base de datos en MongoDB Atlas a través de mongoose
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false // para evitar el uso de métodos obsoletos
})
.then(() => {
  console.log("Conectado a MongoDB");
})
.catch((error) => {
  console.error("Error de conexión", error);
});

// Obtener una referencia a la conexión con la base de datos
const db = mongoose.connection;

// Definición del esquema del libro
const libroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
});

// Modelo de Libro basado en el esquema
const Libro = mongoose.model("Libro", libroSchema);

// Middleware para validar la entrada de creación de libro
const validateBookCreation = [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('autor').notEmpty().withMessage('El autor es requerido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Bienvenido a la tienda de libros");
});

// Ruta para obtener todos los libros
app.get("/libros", async (req, res) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    res.status(500).send("Error al obtener libros");
  }
});

// Ruta para obtener un libro específico por su ID
app.get("/libros/:id", async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id);
    if (libro) {
      res.json(libro);
    } else {
      res.status(404).send("Libro no encontrado");
    }
  } catch (error) {
    res.status(500).send("Error al buscar el libro");
  }
});

// Ruta para crear un nuevo libro
app.post("/libros", validateBookCreation, async (req, res) => {
  const libro = new Libro({
    titulo: req.body.titulo,
    autor: req.body.autor,
  });

  try {
    await libro.save();
    res.json(libro);
  } catch (error) {
    res.status(500).send("Error al guardar libro");
  }
});

// Ruta para actualizar un libro específico por su ID
app.put("/libros/:id", validateBookCreation, async (req, res) => {
  try {
    const libro = await Libro.findByIdAndUpdate(
      req.params.id,
      {
        titulo: req.body.titulo,
        autor: req.body.autor,
      },
      { new: true }
    );

    if (libro) {
      res.json(libro);
    } else {
      res.status(404).send("Libro no encontrado");
    }
  } catch (error) {
    res.status(500).send("Error al actualizar el libro");
  }
});

// Ruta para eliminar un libro específico por su ID
app.delete("/libros/:id", async (req, res) => {
  try {
    const libro = await Libro.findByIdAndRemove(req.params.id);
    if (libro) {
      res.status(204).send();
    } else {
      res.status(404).send("Libro no encontrado");
    }
  } catch (error) {
    res.status(500).send("Error al eliminar el libro");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}/`);
});
