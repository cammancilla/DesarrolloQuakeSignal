const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { iniciarCron } = require('./cron');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());

// Leer alertas de la base dummy
const getAlertas = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveAlertas = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET: Obtener todas las alertas para el Dashboard
app.get('/api/alertas', (req, res) => {
  const alertas = getAlertas();
  res.json(alertas);
});

// POST: Activar Botón de Pánico desde el Dashboard
app.post('/api/alertas/panico', (req, res) => {
  const alertas = getAlertas();
  
  const nuevaAlerta = {
    id: `ALERT-${Date.now().toString().slice(-4)}`,
    tipo: req.body.tipo || "Sismo de Gran Magnitud",
    intensidad: req.body.intensidad || "Alerta Crítica",
    ubicacion: req.body.ubicacion || "Zona Central, Chile",
    fecha: new Date().toISOString(),
    activa: true,
    despachada: false
  };

  alertas.unshift(nuevaAlerta);
  saveAlertas(alertas);

  console.log(`\n ¡BOTÓN DE PÁNICO ACTIVADO! Alerta ${nuevaAlerta.id} guardada en BD.`);
  res.status(201).json({ status: "OK", alerta: nuevaAlerta });
});

// Iniciar servidor y CRON
app.listen(PORT, () => {
  console.log(`Backend Core QuakeSignal corriendo en http://localhost:${PORT}`);
  iniciarCron();
});