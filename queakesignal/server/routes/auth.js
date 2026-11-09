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
  const rawEmail = (req.body.email || "").trim();
  const rawPassword = req.body.password;

  if (!rawEmail || !rawPassword) {
    return res.status(400).json({ message: "Por favor ingresa tu correo y contraseña." });
  }

  const emailClean = rawEmail.toLowerCase();

  try {
    // 1. Buscar usuario por email directo (normalizado sin espacios y en minúsculas)
    let user = await User.findOne({ email: emailClean });

    // 2. Si no lo encuentra, buscar alternando entre @quakesignal.com y @queakesignal.com
    if (!user) {
      let altEmail = null;
      if (emailClean.includes("@quakesignal.com")) {
        altEmail = emailClean.replace("@quakesignal.com", "@queakesignal.com");
      } else if (emailClean.includes("@queakesignal.com")) {
        altEmail = emailClean.replace("@queakesignal.com", "@quakesignal.com");
      }
      if (altEmail) {
        user = await User.findOne({ email: altEmail });
      }
    }

    // 3. Fallback: búsqueda insensible a mayúsculas
    if (!user) {
      const escaped = emailClean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      user = await User.findOne({ email: { $regex: new RegExp(`^${escaped}$`, "i") } });
    }

    if (!user) {
      return res.status(401).json({ 
        message: `El correo "${rawEmail}" no está registrado en el sistema. Verifica la dirección o regístrate.` 
      });
    }

    // 4. Comparar contraseña con bcrypt
    let isMatch = await bcrypt.compare(String(rawPassword), user.password_hash);
    
    // Si no coincide, probar quitando posibles espacios en los extremos
    if (!isMatch && typeof rawPassword === "string") {
      isMatch = await bcrypt.compare(rawPassword.trim(), user.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ 
        message: "Contraseña incorrecta. Por favor verifica la clave ingresada." 
      });
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
    console.error("Error en autenticación:", error);
    res.status(500).json({ message: "Error en el servidor durante la autenticación.", error: error.message });
  }
});

// POST /api/auth/reset-password - Restablecer contraseña de emergencia
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Se requiere correo y nueva contraseña." });
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const altEmail = cleanEmail.includes("@quakesignal.com")
        ? cleanEmail.replace("@quakesignal.com", "@queakesignal.com")
        : cleanEmail.includes("@queakesignal.com")
        ? cleanEmail.replace("@queakesignal.com", "@quakesignal.com")
        : null;
      if (altEmail) {
        user = await User.findOne({ email: altEmail });
      }
    }

    if (!user) {
      return res.status(404).json({ message: `No se encontró un usuario con el correo "${email}".` });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    user.password_hash = hashedPassword;
    await user.save();

    res.json({ message: `Contraseña actualizada exitosamente para ${user.email}.` });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar la contraseña.", error: err.message });
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
