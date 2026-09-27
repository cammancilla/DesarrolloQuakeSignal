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

// 12 Nodos IoT distribuidos en Gran Santiago para la red de emergencia
const NODOS_INICIALES = [
  { id: "ESP32-Alfa", zona: "Centro", ubicacion: "Hall Principal — Santiago Centro", status: "online", lastPing: new Date().toISOString(), lat: -33.4429, lng: -70.6539 },
  { id: "Nodo 01", zona: "Centro", ubicacion: "Santiago Centro — Hall Cívico", status: "online", lastPing: new Date().toISOString(), lat: -33.4429, lng: -70.6539 },
  { id: "Nodo 02", zona: "Providencia", ubicacion: "Providencia — Pedro de Valdivia", status: "online", lastPing: new Date().toISOString(), lat: -33.4255, lng: -70.6148 },
  { id: "Nodo 03", zona: "Las Condes", ubicacion: "Las Condes — Apoquindo / Manquehue", status: "online", lastPing: new Date().toISOString(), lat: -33.4117, lng: -70.5802 },
  { id: "Nodo 04", zona: "Pudahuel", ubicacion: "Pudahuel — Parque Enea", status: "offline", lastPing: "2026-09-27T10:15:33.000Z", lat: -33.4427, lng: -70.7656 },
  { id: "Nodo 05", zona: "Maipú", ubicacion: "Maipú — Plaza Monumento", status: "online", lastPing: new Date().toISOString(), lat: -33.5110, lng: -70.7578 },
  { id: "Nodo 06", zona: "La Florida", ubicacion: "La Florida — Bellavista", status: "online", lastPing: new Date().toISOString(), lat: -33.5227, lng: -70.5983 },
  { id: "Nodo 07", zona: "Ñuñoa", ubicacion: "Ñuñoa — Plaza Ñuñoa Sur", status: "online", lastPing: new Date().toISOString(), lat: -33.4569, lng: -70.5976 },
  { id: "Nodo 08", zona: "Peñalolén", ubicacion: "Peñalolén — Quebrada de Macul", status: "online", lastPing: new Date().toISOString(), lat: -33.4831, lng: -70.5475 },
  { id: "Nodo 09", zona: "Recoleta", ubicacion: "Recoleta — Cerro Blanco", status: "online", lastPing: new Date().toISOString(), lat: -33.4072, lng: -70.6358 },
  { id: "Nodo 10", zona: "Quilicura", ubicacion: "Quilicura — Parque Industrial", status: "online", lastPing: new Date().toISOString(), lat: -33.3644, lng: -70.7297 },
  { id: "Nodo 11", zona: "Lo Barnechea", ubicacion: "Lo Barnechea — El Rodeo", status: "online", lastPing: new Date().toISOString(), lat: -33.3547, lng: -70.5186 },
  { id: "Nodo 12", zona: "San Bernardo", ubicacion: "San Bernardo — Plaza de Armas", status: "online", lastPing: new Date().toISOString(), lat: -33.5922, lng: -70.7047 }
];

// Asegurar que db.json tenga la estructura correcta y geolocalizada al iniciar
const inicializarDB = () => {
  let db = {};
  try {
    db = getDB();
    if (Array.isArray(db)) db = { alertas: db, nodos: [] };
  } catch (e) {
    db = { alertas: [], nodos: [] };
  }
  if (!db.alertas) db.alertas = [];
  if (!db.nodos || db.nodos.length <= 1) {
    db.nodos = NODOS_INICIALES;
  }

  // Geocodificar automáticamente alertas existentes que no tengan lat/lng
  const geoMap = {
    "santiago": { lat: -33.4429, lng: -70.6539, radioKm: 20 },
    "concepción": { lat: -36.8270, lng: -73.0503, radioKm: 35 },
    "concepcion": { lat: -36.8270, lng: -73.0503, radioKm: 35 },
    "viña del mar": { lat: -33.0245, lng: -71.5518, radioKm: 15 },
    "valparaíso": { lat: -33.0472, lng: -71.6127, radioKm: 15 },
    "valparaiso": { lat: -33.0472, lng: -71.6127, radioKm: 15 },
    "iquique": { lat: -20.2133, lng: -70.1503, radioKm: 25 },
    "san josé de maipo": { lat: -33.6389, lng: -70.3503, radioKm: 12 },
    "san jose de maipo": { lat: -33.6389, lng: -70.3503, radioKm: 12 },
    "coquimbo": { lat: -29.9533, lng: -71.3436, radioKm: 20 },
    "villarrica": { lat: -39.4203, lng: -71.9396, radioKm: 20 }
  };

  db.alertas.forEach(a => {
    if (!a.lat || !a.lng) {
      let asignado = false;
      const lower = (a.ubicacion || "").toLowerCase();
      for (const [clave, coords] of Object.entries(geoMap)) {
        if (lower.includes(clave)) {
          a.lat = coords.lat;
          a.lng = coords.lng;
          a.radioKm = coords.radioKm;
          asignado = true;
          break;
        }
      }
      if (!asignado) {
        a.lat = -33.4429;
        a.lng = -70.6539;
        a.radioKm = 18;
      }
    }
  });

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
  
  const ubicacion = req.body.ubicacion || "Santiago Centro, Chile";
  const geoMap = {
    "Santiago Centro, Chile": { lat: -33.4429, lng: -70.6539, radioKm: 20 },
    "Concepción, Chile": { lat: -36.8270, lng: -73.0503, radioKm: 35 },
    "Viña del Mar, Chile": { lat: -33.0245, lng: -71.5518, radioKm: 15 },
    "Iquique, Chile": { lat: -20.2133, lng: -70.1503, radioKm: 25 },
    "San José de Maipo, Chile": { lat: -33.6389, lng: -70.3503, radioKm: 12 }
  };
  const coords = geoMap[ubicacion] || { lat: -33.4429, lng: -70.6539, radioKm: 20 };

  const nuevaAlerta = {
    id: `ALERT-${Date.now().toString().slice(-4)}`,
    tipo: req.body.tipo || "Terremoto (Manual)",
    intensidad: req.body.intensidad || "Alerta Crítica",
    ubicacion: ubicacion,
    lat: req.body.lat !== undefined ? req.body.lat : coords.lat,
    lng: req.body.lng !== undefined ? req.body.lng : coords.lng,
    radioKm: req.body.radioKm || coords.radioKm,
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
  { tipo: "Terremoto", intensidad: "8.2 Mw", ubicacion: "Concepción, Chile", lat: -36.8270, lng: -73.0503, radioKm: 35 },
  { tipo: "Alerta de Tsunami", intensidad: "Evacuación Inmediata", ubicacion: "Iquique, Chile", lat: -20.2133, lng: -70.1503, radioKm: 25 },
  { tipo: "Incendio Forestal", intensidad: "Alerta Roja", ubicacion: "Viña del Mar, Chile", lat: -33.0245, lng: -71.5518, radioKm: 15 },
  { tipo: "Sismo Mayor", intensidad: "7.1 Mw", ubicacion: "Santiago Centro, Chile", lat: -33.4429, lng: -70.6539, radioKm: 20 },
  { tipo: "Aluvión", intensidad: "Alto Riesgo", ubicacion: "San José de Maipo, Chile", lat: -33.6389, lng: -70.3503, radioKm: 12 }
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