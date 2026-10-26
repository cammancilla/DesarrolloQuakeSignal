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

// Asegurar que la carpeta logs exista
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Registra en alertas.log cada consulta a la API de alertas,
 * ÚNICAMENTE cuando SI hay al menos una alerta activa (no cuando no hay nada).
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

// --- RUTAS DE ALERTAS ---


// Endpoints
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));



// Leer alertas de la base dummy
const getAlertas = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveAlertas = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));


app.get('/api/alertas', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  
  // Registrar en alertas.log ÚNICAMENTE si hay alertas activas
  registrarConsultaAlertaLog(alertas, req.ip || req.socket?.remoteAddress || '127.0.0.1');

  res.json(alertas);
});

// Formateador CAP v1.2 (JSON) para la última alerta o por query ?id=...
app.get('/api/alertas/cap', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  if (alertas.length === 0) {
    return res.status(404).json({ error: "No hay alertas disponibles" });
  }

  // Si envían ?todas=true o ?activas=true
  if (req.query.todas === 'true' || req.query.all === 'true') {
    return res.json(alertas.map(a => a.cap || formatToCAP(a)));
  }
  if (req.query.activas === 'true') {
    return res.json(alertas.filter(a => a.activa).map(a => a.cap || formatToCAP(a)));
  }

  // Si envían ?id=ALERT-XXXX
  if (req.query.id) {
    const alerta = alertas.find(a => a.id === req.query.id);
    if (!alerta) {
      return res.status(404).json({ error: "Alerta no encontrada" });
    }
    return res.json(alerta.cap || formatToCAP(alerta));
  }

  // Por defecto, retorna la última alerta emitida (ej. botón de pánico más reciente)
  const ultimaAlerta = alertas[0];
  const capMensaje = ultimaAlerta.cap || formatToCAP(ultimaAlerta);

  res.json(capMensaje);
});

// Endpoint para obtener una alerta específica en formato CAP: /api/alertas/:id/cap
app.get('/api/alertas/:id/cap', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  const alerta = alertas.find(a => a.id === req.params.id);
  if (!alerta) {
    return res.status(404).json({ error: "Alerta no encontrada" });
  }

  res.json(alerta.cap || formatToCAP(alerta));
});

app.get('/api/alertas/:id', (req, res) => {
  const db = getDB();
  const alertas = db.alertas || [];
  const alerta = alertas.find(a => a.id === req.params.id);
  if (!alerta) {
    return res.status(404).json({ error: "Alerta no encontrada" });
  }

  // Registrar si la alerta consultada está activa
  if (alerta.activa) {
    registrarConsultaAlertaLog([alerta], req.ip || req.socket?.remoteAddress || '127.0.0.1');
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

  const capMensaje = formatToCAP(nuevaAlerta);
  nuevaAlerta.cap = capMensaje;

  db.alertas.unshift(nuevaAlerta);
  saveDB(db);

  console.log(`[INFO] BOTÓN DE PÁNICO ACTIVADO. Alerta ${nuevaAlerta.id} guardada en BD.`);
  console.log(`[CAP v1.2] Payload preparado para despacho:`, JSON.stringify(capMensaje?.alert?.info?.headline || ""));

  // Enviar mensaje al canal de Telegram inmediatamente
  await enviarAlertaTelegram(nuevaAlerta);
//  DESPACHAR ALERTA CAP VÍA MQTT A LOS NODOS ESP32
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
  if (os.platform() === 'linux') {
    host = "127.0.0.1";
  } else if (host === "broker.emqx.io" || host === "136.112.57.163") {
    host = "quakesignal.duckdns.org";
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

  alertaSorpresa.cap = formatToCAP(alertaSorpresa);
  db.alertas.unshift(alertaSorpresa);
  saveDB(db);
  console.log(`[SIMULADOR] Nueva alerta generada automáticamente: ${alertaSorpresa.tipo}`);
}, 120000); 

// Iniciar servidor y CRON

const startServer = async () => {
  await connectDB();
  
  //  INICIALIZAR CONEXIÓN AL BROKER MQTT DESDE CONFIGURACIÓN
  try {
    const db = getDB();
    const configMqtt = db.configuracion?.comunicaciones?.mqtt || CONFIGURACION_DEFAULT.comunicaciones.mqtt;
    if (configMqtt.activo !== false) {
      initMQTT(configMqtt);
    }
  } catch (err) {
    console.error(" [MQTT] No se pudo cargar configuración inicial:", err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(` Backend Core QuakeSignal corriendo en http://localhost:${PORT}`);
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

