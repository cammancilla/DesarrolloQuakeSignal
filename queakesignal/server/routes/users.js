const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

// GET /api/users - Listar usuarios
router.get("/", async (req, res) => {
  try {
    // Excluimos password_hash del resultado
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
});

// POST /api/users - Registrar usuario
router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const newUser = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role: role || "operador",
    });

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario." });
  }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
});

module.exports = router;