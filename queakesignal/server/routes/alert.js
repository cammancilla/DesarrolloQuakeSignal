const express = require('express');
const router = express.Router();

// 1. Declarar los datos dummy
const dummyAlerts = [
  {
    id: "ALERT-001",
    tipo: "Terremoto",
    intensidad: "Sismo Mayor 7.2 Mw",
    ubicacion: "Valparaíso, Chile",
    fecha: "2026-09-03T23:30:00Z",
    activa: false,
    despachada: true
  }
];

// 2. Definir la ruta relativa (solo '/alerts')
router.get('/alerts', (req, res) => {
  res.json(dummyAlerts);
});

module.exports = router;