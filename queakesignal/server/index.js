const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require("./config/db");
const { iniciarCron } = require('./cron');
const { formatToCAP } = require('./utils/capFormatter');
const { enviarAlertaTelegram, probarConexionTelegram, DEFAULT_BOT_TOKEN, DEFAULT_CHAT_ID } = require('./utils/telegram');
const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const LOGS_DIR = path.join(__dirname, 'logs');
const ALERTAS_LOG_PATH = path.join(LOGS_DIR, 'alertas.log');
const { initMQTT, publicarAlertaCAP } = require('./services/mqttService');
const mqtt = require('mqtt');
const os = require('os');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const JWT_SECRET = 'quakesignal_secret_key_2026';

const getUserFromReq = (req) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Asegurar que la carpeta logs exista
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Registra en alertas.log cada consulta a la API de alertas,
 * ÚNICAMENTE cuando SÍ hay al menos una alerta activa (no cuando no hay nada).
 */
const registrarConsultaAlertaLog = (alertas, origen = '127.0.0.1') => {
  const activas = (alertas || []).filter(a => a.activa === true);
  // Si no hay alertas activas, NO registramos nada (requisito estricto)
  if (activas.length === 0) {
    return;
  }

  const timestamp = new Date().toISOString();
  const resumenAlertas = activas
    .map(a => `[ID: ${a.id} | Tipo: ${a.tipo} | Intensidad: ${a.intensidad} | Ubicación: ${a.ubicacion}]`)
    .join(' ; ');

  const linea = `[${timestamp}] [CONSULTA API] ${activas.length} alerta(s) activa(s) detectada(s) desde IP: ${origen} -> ${resumenAlertas}\n`;

  try {
    fs.appendFileSync(ALERTAS_LOG_PATH, linea, 'utf-8');
  } catch (err) {
    console.error("[LOG ERROR] Error al escribir en alertas.log:", err.message);
  }
};

app.use(cors());
app.use(express.json());

// --- HELPERS DE BASE DE DATOS ---
const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Configuración centralizada del sistema de alerta e IoT
const CONFIGURACION_DEFAULT = {
  comunicaciones: {
    telegram: {
      botToken: DEFAULT_BOT_TOKEN,
      chatId: DEFAULT_CHAT_ID,
      activo: true
    },
    mqtt: {
      broker: "quakesignal.duckdns.org",
      puerto: 1883,
      usuario: "quakesignal_core",
      password: "qs_secure_pwd_2026",
      topico: "chile/alertas",
      activo: true
    },
    radiofrecuencia: {
      banda: "915 MHz (Chile / Américas)",
      canal: "CH-04 (915.2 MHz)",
      frecuenciaMhz: 915.2,
      potenciaTxDbm: 20,
      spreadingFactor: "SF7"
    }
  },
  automatizacion: {
    umbralDesconexionSegundos: 180,
    autoContingencia: true,
    tasaRefrescoSegundos: 3
  },
  interfaz: {
    vistaInicial: "dashboard",
    temaVisual: "oscuro"
  }
};

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
  let modificado = false;
  if (!db.alertas) {
    db.alertas = [];
    modificado = true;
  }
  if (!db.nodos || db.nodos.length <= 1) {
    db.nodos = NODOS_INICIALES;
    modificado = true;
  }
  if (!db.configuracion) {
    db.configuracion = CONFIGURACION_DEFAULT;
    modificado = true;
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
      modificado = true;
    }
  });

  if (modificado) {
    saveDB(db);
  }
};
inicializarDB();

// --- RUTAS DE AUTENTICACIÓN Y USUARIOS ---
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// --- RUTAS DE ALERTAS ---

/**
 * Determina con certeza si una alerta fue emitida manualmente por un operador (Botón de Pánico).
 */
const esAlertaManual = (alerta) => {
  if (!alerta) return false;
  if (alerta.manual === true || alerta.origen === "manual") return true;
  const idStr = String(alerta.id || "");
  const tipoStr = String(alerta.tipo || "").toLowerCase();
  return tipoStr.includes("manual") || (!idStr.includes("SIM") && !idStr.startsWith("ALERT-00"));
};

/**
 * Obtiene la última alerta generada ordenando por fecha de forma descendente.
 * REGLA DE PRIORIDAD OPERACIONAL:
 * 1. Si existe una alerta MANUAL ACTIVA (emitida por operador / botón de pánico),
 *    tiene PRIORIDAD MÁXIMA y se muestra en el CAP por sobre cualquier simulación automática repetitiva.
 * 2. Si no hay alerta manual activa, retorna la alerta activa más reciente.
 * 3. Si no hay alertas activas, retorna la alerta más reciente histórica.
 */
const obtenerUltimaAlerta = (alertas = [], soloManuales = false) => {
  if (!alertas || alertas.length === 0) return null;
  const ordenadas = [...alertas].sort((a, b) => {
    const tA = new Date(a.fecha || 0).getTime();
    const tB = new Date(b.fecha || 0).getTime();
    return tB - tA;
  });

  if (soloManuales) {
    const manuales = ordenadas.filter(esAlertaManual);
    return manuales.find(a => a.activa) || manuales[0] || null;
  }

  // Prioridad 1: Alerta manual activa
  const manualActiva = ordenadas.find(a => esAlertaManual(a) && a.activa);
  if (manualActiva) {
    return manualActiva;
  }

  // Prioridad 2: Alerta activa más reciente
  const alertaActiva = ordenadas.find(a => a.activa);
  if (alertaActiva) {
    return alertaActiva;
  }

  // Fallback: La más reciente
  return ordenadas[0];
};

/**
 * Busca una alerta por su ID de forma flexible e insensible a mayúsculas/minúsculas.
 * Soporta: "ALERT-6044", "alert-6044", "6044", "#ALERT-6044", "ALERT-SIM-3098", "3098", "SIM-3098", etc.
 */
const buscarAlertaPorId = (alertas = [], searchId = "") => {
  if (!searchId || !alertas || alertas.length === 0) return null;
  const raw = String(searchId).trim();
  const sinHash = raw.replace(/^#/, '').trim();
  const lower = sinHash.toLowerCase();

  // 1. Coincidencia exacta
  let encontrada = alertas.find(a => a.id === raw || a.id === sinHash);
  if (encontrada) return encontrada;

  // 2. Coincidencia insensible a mayúsculas/minúsculas
  encontrada = alertas.find(a => String(a.id || "").toLowerCase() === lower);
  if (encontrada) return encontrada;

  // 3. Coincidencia agregando o quitando prefijos ("6044" -> "ALERT-6044", "SIM-3098" -> "ALERT-SIM-3098")
  encontrada = alertas.find(a => {
    const idLower = String(a.id || "").toLowerCase();
    return idLower === `alert-${lower}` ||
           idLower === `alert-sim-${lower}` ||
           idLower.endsWith(`-${lower}`);
  });
  if (encontrada) return encontrada;

  // 4. Coincidencia por dígitos finales numéricos
  const digitos = sinHash.replace(/^[^\d]*/, '');
  if (digitos && digitos.length >= 3) {
    encontrada = alertas.find(a => String(a.id || "").endsWith(digitos));
    if (encontrada) return encontrada;
  }

  return null;
};

app.get('/api/alertas', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  
  // Registrar en alertas.log ÚNICAMENTE si hay alertas activas
  registrarConsultaAlertaLog(alertas, req.ip || req.socket?.remoteAddress || '127.0.0.1');

  res.json(alertas);
});

// Formateador CAP v1.2 (JSON) para la última alerta o por query ?id=...
// Admite también ?manual=true para ver la última alerta manual,
// y ?todas=true / ?activas=true combinables con ?manual=true
app.get('/api/alertas/cap', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  if (alertas.length === 0) {
    return res.status(404).json({ error: "No hay alertas disponibles" });
  }

  const filtroManual = req.query.manual === 'true' || req.query.manuales === 'true' || req.query.origen === 'manual';

  // Si envían ?todas=true o ?activas=true
  if (req.query.todas === 'true' || req.query.all === 'true') {
    const lista = filtroManual ? alertas.filter(esAlertaManual) : alertas;
    return res.json(lista.map(a => formatToCAP(a)));
  }
  if (req.query.activas === 'true') {
    const lista = alertas.filter(a => a.activa && (!filtroManual || esAlertaManual(a)));
    return res.json(lista.map(a => formatToCAP(a)));
  }

  // Si envían ?id=ALERT-XXXX o ?id=6044
  if (req.query.id) {
    const alerta = buscarAlertaPorId(alertas, req.query.id);
    if (!alerta) {
      return res.status(404).json({
        error: "Alerta no encontrada",
        idConsultado: req.query.id,
        ultimosIdsDisponibles: alertas.slice(0, 5).map(a => a.id)
      });
    }
    return res.json(formatToCAP(alerta));
  }

  // Por defecto, retorna la última alerta emitida en el sistema recalculando siempre su CAP de forma dinámica.
  // Si hay una alerta manual activa, tiene prioridad sobre las simulaciones.
  const ultimaAlerta = obtenerUltimaAlerta(alertas, filtroManual);
  if (!ultimaAlerta) {
    return res.status(404).json({ error: "No se encontraron alertas para el filtro especificado" });
  }
  res.json(formatToCAP(ultimaAlerta));
});

// Endpoints específicos y dedicados para alertas manuales en formato CAP:
// /api/alertas/manual/cap, /api/alertas/manuales/cap, /api/alertas/cap/manual
const handlerAlertaManualCap = (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  const manuales = alertas.filter(esAlertaManual);

  if (manuales.length === 0) {
    return res.status(404).json({ error: "No hay alertas manuales registradas en el sistema" });
  }

  if (req.query.todas === 'true' || req.query.all === 'true') {
    return res.json(manuales.map(a => formatToCAP(a)));
  }
  if (req.query.activas === 'true') {
    return res.json(manuales.filter(a => a.activa).map(a => formatToCAP(a)));
  }

  const ultimaManual = obtenerUltimaAlerta(alertas, true);
  res.json(formatToCAP(ultimaManual));
};

app.get('/api/alertas/manual/cap', handlerAlertaManualCap);
app.get('/api/alertas/manuales/cap', handlerAlertaManualCap);
app.get('/api/alertas/cap/manual', handlerAlertaManualCap);
app.get('/api/alertas/cap/manuales', handlerAlertaManualCap);

// Endpoint nativo para consultar lista de alertas manuales (JSON estándar)
app.get('/api/alertas/manuales', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  const manuales = alertas.filter(esAlertaManual);
  res.json(manuales);
});

// Handler flexible para obtener una alerta específica en formato CAP
const handlerAlertaCapPorId = (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  if (alertas.length === 0) {
    return res.status(404).json({ error: "No hay alertas disponibles" });
  }

  const rawId = req.params.id;

  // Si acceden literalmente con ":id" o palabras clave como "latest", "ultima", "actual"
  if (rawId === ":id" || rawId === "latest" || rawId === "ultima" || rawId === "actual") {
    const ultima = obtenerUltimaAlerta(alertas);
    return res.json(formatToCAP(ultima));
  }

  // Si piden explícitamente "manual" en el parámetro de ID
  if (rawId === "manual" || rawId === "manuales") {
    const ultimaManual = obtenerUltimaAlerta(alertas, true);
    if (!ultimaManual) return res.status(404).json({ error: "No hay alertas manuales registradas" });
    return res.json(formatToCAP(ultimaManual));
  }

  const alerta = buscarAlertaPorId(alertas, rawId);
  if (!alerta) {
    return res.status(404).json({
      error: "Alerta no encontrada",
      idConsultado: rawId,
      sugerencia: "Verifique el ID. Puede ingresar el identificador completo (ej: ALERT-6044, ALERT-SIM-3098) o solo su número (ej: 6044).",
      ultimosIdsDisponibles: alertas.slice(0, 5).map(a => a.id)
    });
  }

  res.json(formatToCAP(alerta));
};

// Endpoints compatibles: /api/alertas/:id/cap y alias /api/alertas/cap/:id
app.get('/api/alertas/:id/cap', handlerAlertaCapPorId);
app.get('/api/alertas/cap/:id', handlerAlertaCapPorId);

app.get('/api/alertas/:id', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  
  if (req.params.id === ":id" || req.params.id === "latest" || req.params.id === "ultima") {
    const ultima = obtenerUltimaAlerta(alertas);
    if (req.query.format === 'cap') return res.json(formatToCAP(ultima));
    return res.json(ultima);
  }

  if (req.params.id === "manual" || req.params.id === "manuales") {
    const manuales = alertas.filter(esAlertaManual);
    if (req.query.format === 'cap') return res.json(manuales.map(formatToCAP));
    return res.json(manuales);
  }

  const alerta = buscarAlertaPorId(alertas, req.params.id);
  if (!alerta) {
    return res.status(404).json({
      error: "Alerta no encontrada",
      idConsultado: req.params.id,
      ultimosIdsDisponibles: alertas.slice(0, 5).map(a => a.id)
    });
  }

  // Registrar si la alerta consultada está activa
  if (alerta.activa) {
    registrarConsultaAlertaLog([alerta], req.ip || req.socket?.remoteAddress || '127.0.0.1');
  }

  if (req.query.format === 'cap') {
    return res.json(formatToCAP(alerta));
  }

  res.json(alerta);
});

// Endpoint para consultar el contenido del archivo de logs
app.get('/api/logs/alertas', (req, res) => {
  try {
    if (fs.existsSync(ALERTAS_LOG_PATH)) {
      const contenido = fs.readFileSync(ALERTAS_LOG_PATH, 'utf-8');
      res.type('text/plain').send(contenido);
    } else {
      res.type('text/plain').send("Aún no se han generado registros en alertas.log.");
    }
  } catch (error) {
    res.status(500).json({ error: "Error al leer el archivo de log" });
  }
});

app.post('/api/alertas/panico', async (req, res) => {
  // Principio de mínimo privilegio: Los operadores no tienen permisos para el Botón de Pánico
  const requester = getUserFromReq(req);
  if (requester && requester.role === 'operador') {
    return res.status(403).json({ 
      error: 'Acceso denegado: Los operadores no tienen permisos para activar el botón de pánico.' 
    });
  }
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
    despachada: false,
    manual: true,
    origen: 'manual'
  };

  const capMensaje = formatToCAP(nuevaAlerta);
  nuevaAlerta.cap = capMensaje;

  db.alertas.unshift(nuevaAlerta);
  saveDB(db);

  console.log(`[INFO] BOTÓN DE PÁNICO ACTIVADO. Alerta ${nuevaAlerta.id} guardada en BD.`);
  console.log(`[CAP v1.2] Payload preparado para despacho:`, JSON.stringify(capMensaje?.alert?.info?.headline || ""));

  // Enviar mensaje al canal de Telegram inmediatamente
  await enviarAlertaTelegram(nuevaAlerta);

  // DESPACHAR ALERTA CAP VÍA MQTT A LOS NODOS ESP32
  const configMqtt = db.configuracion?.comunicaciones?.mqtt || {};
  if (configMqtt.activo !== false) {
    publicarAlertaCAP(capMensaje, configMqtt.topico || "chile/alertas");
  }

  // Retornar la alerta nativa y el objeto CAP listo
  res.status(201).json({ status: "OK", alerta: nuevaAlerta, cap: capMensaje });
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

// --- RUTAS DE CONFIGURACIÓN DEL SISTEMA ---

// GET: Obtener la configuración actual del sistema
app.get('/api/configuracion', (req, res) => {
  const db = getDB();
  res.json(db.configuracion || CONFIGURACION_DEFAULT);
});

// PUT: Actualizar parámetros del sistema sin reiniciar el servidor
app.put('/api/configuracion', (req, res) => {
  // Principio de mínimo privilegio: Los operadores no tienen permisos para modificar configuración
  const requester = getUserFromReq(req);
  if (requester && requester.role === 'operador') {
    return res.status(403).json({ 
      error: 'Acceso denegado: Los operadores no tienen permisos para modificar los parámetros del sistema.' 
    });
  }
  const db = getDB();
  db.configuracion = {
    ...CONFIGURACION_DEFAULT,
    ...db.configuracion,
    ...req.body,
    comunicaciones: {
      ...CONFIGURACION_DEFAULT.comunicaciones,
      ...(db.configuracion?.comunicaciones || {}),
      ...(req.body.comunicaciones || {})
    },
    automatizacion: {
      ...CONFIGURACION_DEFAULT.automatizacion,
      ...(db.configuracion?.automatizacion || {}),
      ...(req.body.automatizacion || {})
    },
    interfaz: {
      ...CONFIGURACION_DEFAULT.interfaz,
      ...(db.configuracion?.interfaz || {}),
      ...(req.body.interfaz || {})
    }
  };
  saveDB(db);
  console.log(`[CONFIG] Parámetros del sistema actualizados por el operador.`);

  // Re-inicializar conexión MQTT con los nuevos parámetros si está activo
  if (db.configuracion?.comunicaciones?.mqtt?.activo !== false) {
    initMQTT(db.configuracion.comunicaciones.mqtt);
  }

  res.json({ status: "OK", message: "Configuración guardada correctamente", configuracion: db.configuracion });
});

// POST: Probar conexión de Telegram
app.post('/api/configuracion/test-telegram', async (req, res) => {
  const { botToken, chatId } = req.body;
  const token = botToken || DEFAULT_BOT_TOKEN;
  const chat = chatId || DEFAULT_CHAT_ID;

  console.log(`[TELEGRAM TEST] Probando envío a Chat ID ${chat} con token ${token.slice(0, 10)}...`);

  try {
    const data = await probarConexionTelegram(token, chat);
    if (data.ok) {
      res.json({ status: "OK", message: "Conexión a Telegram verificada exitosamente y mensaje enviado al canal." });
    } else {
      res.status(400).json({ error: `Error de Telegram: ${data.description || 'No se pudo enviar el mensaje'}` });
    }
  } catch (err) {
    res.status(500).json({ error: `Error de conexión con Telegram: ${err.message}` });
  }
});

// POST: Probar conexión MQTT
app.post('/api/configuracion/test-mqtt', (req, res) => {
  const { broker, puerto, usuario, password } = req.body;
  if (!broker) {
    return res.status(400).json({ error: "Falta la dirección del Broker MQTT" });
  }

  let host = broker.replace(/^mqtt:\/\//, '').replace(/^tcp:\/\//, '').trim();

  // Si estamos ejecutando dentro de GCP y probamos la IP pública/dominio, usamos 127.0.0.1
  if ((host === "136.112.57.163" || host === "quakesignal.duckdns.org") && os.hostname().includes('broker-mqtt')) {
    host = "127.0.0.1";
  }

  const port = parseInt(puerto) || 1883;

  console.log(`[MQTT TEST] Probando conexión a mqtt://${host}:${port}...`);

  const testClient = mqtt.connect(`mqtt://${host}:${port}`, {
    username: usuario || "quakesignal_core",
    password: password || "qs_secure_pwd_2026",
    connectTimeout: 4000,
  });

  let responded = false;

  testClient.on('connect', () => {
    if (!responded) {
      responded = true;
      testClient.end(true);
      console.log(`[MQTT TEST] Conexión exitosa a ${host}:${port}`);
      return res.json({ status: "OK", message: `Conexión con Broker MQTT ${host}:${port} verificada exitosamente` });
    }
  });

  testClient.on('error', (err) => {
    if (!responded) {
      responded = true;
      testClient.end(true);
      console.error(`[MQTT TEST] Error conectando a ${host}:${port}:`, err.message);
      return res.status(500).json({ error: `Error de conexión con el Broker: ${err.message}` });
    }
  });

  setTimeout(() => {
    if (!responded) {
      responded = true;
      testClient.end(true);
      console.warn(`[MQTT TEST] Timeout conectando a ${host}:${port}`);
      return res.status(504).json({ error: `Tiempo de espera agotado al conectar con el Broker ${host}:${port}` });
    }
  }, 4500);
});

// --- SIMULADOR DE EMERGENCIAS ---
const emergenciasRandom = [
  { tipo: "Terremoto", intensidad: "8.2 Mw", ubicacion: "Concepción, Chile", lat: -36.8270, lng: -73.0503, radioKm: 35 },
  { tipo: "Alerta de Tsunami", intensidad: "Evacuación Inmediata", ubicacion: "Iquique, Chile", lat: -20.2133, lng: -70.1503, radioKm: 25 },
  { tipo: "Incendio Forestal", intensidad: "Alerta Roja", ubicacion: "Viña del Mar, Chile", lat: -33.0245, lng: -71.5518, radioKm: 15 },
  { tipo: "Sismo Mayor", intensidad: "7.1 Mw", ubicacion: "Santiago Centro, Chile", lat: -33.4429, lng: -70.6539, radioKm: 20 },
  { tipo: "Aluvión", intensidad: "Alto Riesgo", ubicacion: "San José de Maipo, Chile", lat: -33.6389, lng: -70.3503, radioKm: 12 }
];

// Generador automático de alertas simuladas cada 2 minutos
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

  alertaSorpresa.cap = formatToCAP(alertaSorpresa);
  db.alertas.unshift(alertaSorpresa);
  saveDB(db);

  // Despachar la alerta simulada también a los nodos IoT vía MQTT
  const configMqtt = db.configuracion?.comunicaciones?.mqtt || {};
  if (configMqtt.activo !== false) {
    publicarAlertaCAP(alertaSorpresa.cap, configMqtt.topico || "chile/alertas");
  }

  console.log(`[SIMULADOR] Nueva alerta generada automáticamente: ${alertaSorpresa.tipo}`);
}, 120000); 

// Iniciar servidor y CRON
const startServer = async () => {
    await connectDB();
  
  // Mínimo privilegio: Asegurar cuenta del Administrador por defecto
  try {
    const adminUser = await User.findOne({ email: 'admin@quakesignal.com' });
    if (!adminUser) {
      const hash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Administrador',
        email: 'admin@quakesignal.com',
        password_hash: hash,
        role: 'admin',
        status: 'active'
      });
      console.log('[AUTH] Usuario administrador asegurado: admin@quakesignal.com (rol: admin)');
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('[AUTH] Rol de admin@quakesignal.com actualizado a admin.');
    }
  } catch (err) {
    console.error('[AUTH] Error verificando administrador por defecto:', err.message);
  }
  
  // INICIALIZAR CONEXIÓN AL BROKER MQTT DESDE CONFIGURACIÓN
  try {
    const db = getDB();
    const configMqtt = db.configuracion?.comunicaciones?.mqtt || CONFIGURACION_DEFAULT.comunicaciones.mqtt;
    if (configMqtt.activo !== false) {
      initMQTT(configMqtt);
    }
  } catch (err) {
    console.error("[MQTT] No se pudo cargar configuración inicial:", err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`Backend Core QuakeSignal corriendo en http://localhost:${PORT}`);
    iniciarCron();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] El puerto ${PORT} ya está en uso.`);
    } else {
      console.error(`[ERROR] Error en el servidor:`, err.message);
    }
  });
};

startServer();