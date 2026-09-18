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

// --- HELPERS DE BASE DE DATOS ---
const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Asegurar que db.json tenga la estructura correcta al iniciar ({ alertas: [], nodos: [] })
const inicializarDB = () => {
  let db = {};
  try {
    db = getDB();
    // Si la BD antigua era un simple array, la migramos al nuevo formato
    if (Array.isArray(db)) db = { alertas: db, nodos: [] };
  } catch (e) {
    db = { alertas: [], nodos: [] };
  }
  if (!db.alertas) db.alertas = [];
  if (!db.nodos) db.nodos = [];
  saveDB(db);
};
inicializarDB();

// --- RUTAS DE ALERTAS ---

app.get('/api/alertas', (req, res) => {
  const db = getDB();
  res.json(db.alertas);
});

app.post('/api/alertas/panico', (req, res) => {
  const db = getDB();
  
  const nuevaAlerta = {
    id: `ALERT-${Date.now().toString().slice(-4)}`,
    tipo: req.body.tipo || "Sismo de Gran Magnitud",
    intensidad: req.body.intensidad || "Alerta Crítica",
    ubicacion: req.body.ubicacion || "Zona Central, Chile",
    fecha: new Date().toISOString(),
    activa: true,
    despachada: false
  };

  db.alertas.unshift(nuevaAlerta);
  saveDB(db);

  console.log(`[INFO] BOTÓN DE PÁNICO ACTIVADO. Alerta ${nuevaAlerta.id} guardada en BD.`);
  res.status(201).json({ status: "OK", alerta: nuevaAlerta });
});

app.put('/api/alertas/:id/resolver', (req, res) => {
  const db = getDB();
  const index = db.alertas.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Alerta no encontrada" });
  }

  db.alertas[index].activa = false;
  saveDB(db);

  console.log(`[INFO] Alerta ${req.params.id} marcada como FINALIZADA.`);
  res.json({ status: "OK", alerta: db.alertas[index] });
});

// --- RUTAS DE NODOS IoT ---

// GET: Calcula dinámicamente los nodos online/offline desde la base de datos
app.get('/api/nodos/status', (req, res) => {
  const db = getDB();
  const total = db.nodos.length;
  const online = db.nodos.filter(n => n.status === 'online').length;
  
  res.json({ total, online, detalle: db.nodos });
});

// POST: Endpoint real para recibir el "Estoy vivo" (Heartbeat) de los ESP32
app.post('/api/nodos/ping', (req, res) => {
  const { id, ubicacion } = req.body;
  if (!id) return res.status(400).json({ error: "El payload debe incluir un 'id'" });

  const db = getDB();
  const nodoIndex = db.nodos.findIndex(n => n.id === id);
  const ahora = new Date().toISOString();

  if (nodoIndex !== -1) {
    // El nodo ya existe, actualizamos su estado y hora
    db.nodos[nodoIndex].status = 'online';
    db.nodos[nodoIndex].lastPing = ahora;
    if (ubicacion) db.nodos[nodoIndex].ubicacion = ubicacion;
  } else {
    // Es un nodo nuevo, lo registramos
    db.nodos.push({
      id,
      ubicacion: ubicacion || "Ubicación Desconocida",
      status: 'online',
      lastPing: ahora
    });
  }

  saveDB(db);
  console.log(`[IoT] Ping recibido del nodo: ${id}`);
  res.json({ status: "OK", message: "Ping registrado" });
});

// --- SIMULADOR DE EMERGENCIAS ---
const emergenciasRandom = [
  { tipo: "Terremoto", intensidad: "8.2 Mw", ubicacion: "Concepción, Chile" },
  { tipo: "Alerta de Tsunami", intensidad: "Evacuación Inmediata", ubicacion: "Iquique, Chile" },
  { tipo: "Incendio Forestal", intensidad: "Alerta Roja", ubicacion: "Viña del Mar, Chile" }
];

// Cambiado a 2 minutos (120000 ms) para evitar saturar la base de datos
setInterval(() => {
  const db = getDB();
  const randomActiva = emergenciasRandom[Math.floor(Math.random() * emergenciasRandom.length)];
  
  const alertaSorpresa = {
    id: `ALERT-SIM-${Date.now().toString().slice(-4)}`,
    ...randomActiva,
    fecha: new Date().toISOString(),
    activa: true,
    despachada: false
  };

  db.alertas.unshift(alertaSorpresa);
  saveDB(db);
  console.log(`[SIMULADOR] Nueva alerta generada automáticamente: ${alertaSorpresa.tipo}`);
}, 120000); 

// Iniciar servidor y CRON
app.listen(PORT, () => {
  console.log(`[SYSTEM] Backend Core QuakeSignal corriendo en http://localhost:${PORT}`);
  iniciarCron();
});