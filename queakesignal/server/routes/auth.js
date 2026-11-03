const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const JWT_SECRET = "quakesignal_secret_key_2026";

// Helper para extraer usuario desde el token
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

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Asegurar que el usuario administrador por defecto siempre tenga el rol 'admin'
    let effectiveRole = user.role;
    if (user.email === "admin@quakesignal.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
      effectiveRole = "admin";
    }

    const token = jwt.sign(
      { id: user._id, role: effectiveRole, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en la autenticación." });
  }
});

// GET /api/auth/users (o /api/users)
// Protegido por mínimo privilegio: solo accesible para administradores
router.get("/users", async (req, res) => {
  const requester = getUserFromToken(req);
  if (requester && requester.role === "operador") {
    return res.status(403).json({ 
      message: "Acceso denegado: Los operadores no tienen permisos para consultar la lista de usuarios." 
    });
  }

  try {
    // Busca todos los usuarios omitiendo el campo de contraseña por seguridad
    const users = await User.find({}, "-password_hash"); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
});

module.exports = router;
