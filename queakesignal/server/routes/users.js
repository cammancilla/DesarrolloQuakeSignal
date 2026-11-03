const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const JWT_SECRET = "quakesignal_secret_key_2026";

// Helper para extraer el usuario desde el token JWT
const getUserFromToken = (req) => {
  const authHeader = req.headers["authorization"] || req.headers["x-access-token"];
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// GET /api/users - Listar usuarios (Protegido por mínimo privilegio: solo admin)
router.get("/", async (req, res) => {
  const user = getUserFromToken(req);
  if (user && user.role === "operador") {
    return res.status(403).json({ 
      message: "Acceso denegado: Los operadores no tienen permisos para ver la lista de usuarios." 
    });
  }

  try {
    // Excluimos password_hash del resultado
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
});

// POST /api/users - Registrar usuario
// Principio de mínimo privilegio: Los nuevos usuarios registrados siempre reciben el rol de 'operador'.
router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    // Si quien crea el usuario es un administrador autenticado, se respeta el rol solicitado.
    // De lo contrario (registro público de nuevos usuarios), se fuerza estrictamente el rol 'operador'.
    const requester = getUserFromToken(req);
    const assignedRole = (requester && requester.role === "admin" && role) ? role : "operador";

    const newUser = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role: assignedRole,
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

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete("/:id", async (req, res) => {
  const user = getUserFromToken(req);
  if (user && user.role === "operador") {
    return res.status(403).json({ 
      message: "Acceso denegado: Los operadores no tienen permisos para eliminar usuarios." 
    });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
});

module.exports = router;
