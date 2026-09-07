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

// POST: Activar Boton de Panico desde el Dashboard
app.post('/api/alertas/panico', (req, res) => {
  const alertas = getAlertas();
  
  const nuevaAlerta = {
    id: `ALERT-${Date.now().toString().slice(-4)}`,
    tipo: req.body.tipo || "Sismo de Gran Magnitud",
    intensidad: req.body.intensidad || "Alerta Critica",
    ubicacion: req.body.ubicacion || "Zona Central, Chile",
    fecha: new Date().toISOString(),
    activa: true,
    despachada: false
  };

  alertas.unshift(nuevaAlerta);
  saveAlertas(alertas);

  console.log(`[INFO] BOTON DE PANICO ACTIVADO. Alerta ${nuevaAlerta.id} guardada en BD.`);
  res.status(201).json({ status: "OK", alerta: nuevaAlerta });
});

// PUT: Finalizar una alerta activa
app.put('/api/alertas/:id/resolver', (req, res) => {
  const alertas = getAlertas();
  const index = alertas.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Alerta no encontrada" });
  }

  alertas[index].activa = false;
  saveAlertas(alertas);

  console.log(`[INFO] Alerta ${req.params.id} marcada como FINALIZADA.`);
  res.json({ status: "OK", alerta: alertas[index] });
});

// GET: Estado dummy de Nodos IoT para el Dashboard
app.get('/api/nodos/status', (req, res) => {
  const nodosDummy = [
    { id: "Nodo 01", ubicacion: "Santiago Centro", estado: "online" },
    { id: "Nodo 02", ubicacion: "Providencia", estado: "online" },
    { id: "Nodo 03", ubicacion: "Pudahuel", estado: "offline" }
  ];
  res.json({ total: 12, online: 11, detalle: nodosDummy });
});

// --- SIMULADOR DE EMERGENCIAS (Para la presentacion) ---
const emergenciasRandom = [
  { tipo: "Terremoto", intensidad: "8.2 Mw", ubicacion: "Concepcion, Chile" },
  { tipo: "Alerta de Tsunami", intensidad: "Evacuacion Inmediata", ubicacion: "Iquique, Chile" },
  { tipo: "Incendio Forestal", intensidad: "Alerta Roja", ubicacion: "Vina del Mar, Chile" }
];

setInterval(() => {
  const alertas = getAlertas();
  const randomActiva = emergenciasRandom[Math.floor(Math.random() * emergenciasRandom.length)];
  
  const alertaSorpresa = {
    id: `ALERT-SIM-${Date.now().toString().slice(-4)}`,
    ...randomActiva,
    fecha: new Date().toISOString(),
    activa: true,
    despachada: false
  };

  alertas.unshift(alertaSorpresa);
  saveAlertas(alertas);
  console.log(`[SIMULADOR] Nueva alerta generada automaticamente: ${alertaSorpresa.tipo}`);
}, 30000); 
// -------------------------------------------------------

// Iniciar servidor y CRON
app.listen(PORT, () => {
  console.log(`[SYSTEM] Backend Core QuakeSignal corriendo en http://localhost:${PORT}`);
  iniciarCron();
});