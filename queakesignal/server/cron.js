const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { enviarAlertaTelegram } = require('./utils/telegram');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Helpers para manejar la DB limpiamente
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const iniciarCron = () => {
  console.log("[CRON] Motores de segundo plano inicializados.");

  // 1. DESPACHADOR DE ALERTAS: Revisa cada 10 segundos
  // En eventos sísmicos, 1 minuto de espera es una eternidad.
  cron.schedule('*/10 * * * * *', async () => {
    try {
      const db = readDB();
      // Soporta tanto si db.json es un array directo (old) o un objeto { alertas: [] } (new)
      const alertas = db.alertas || db; 
      let dbModificada = false;

      for (const alerta of alertas) {
        if (alerta.activa && !alerta.despachada) {
          console.log(`[CRON: DESPACHO] Evento detectado. Procesando ${alerta.id}...`);
          
          // Enviar a Telegram real
          await enviarAlertaTelegram(alerta);
          console.log(`[CANAL A] HTTP POST a Telegram API: Notificación enviada.`);
          console.log(`[CANAL B] MQTT Publish en tópico 'chile/alertas' hacia Broker GCP.`);

          alerta.despachada = true;
          dbModificada = true;
        }
      }

      if (dbModificada) {
        if (db.alertas) db.alertas = alertas;
        writeDB(db.alertas ? db : alertas);
        console.log(`[CRON: DESPACHO] Cola de alertas procesada exitosamente.`);
      }
    } catch (error) {
      console.error("[ERROR: DESPACHO]", error.message);
    }
  });

  // 2. WATCHDOG DE NODOS: Revisa cada 1 minuto
  // Evalúa si algún dispositivo ESP32 dejó de mandar su "ping".
  cron.schedule('* * * * *', () => {
    try {
      const db = readDB();
      if (!db.nodos) return; // Si aún no configuras los nodos en el JSON, lo ignora

      // Umbral configurable por el operador (en segundos)
      const segundosUmbral = db.configuracion?.automatizacion?.umbralDesconexionSegundos || 180;
      const TIEMPO_OFFLINE_MS = segundosUmbral * 1000;
      const ahora = Date.now();
      let dbModificada = false;

      db.nodos.forEach(nodo => {
        if (nodo.status === 'online' && (ahora - new Date(nodo.lastPing).getTime()) > TIEMPO_OFFLINE_MS) {
          console.log(`[CRON: WATCHDOG] Nodo ${nodo.id} sin respuesta. Marcando como OFFLINE.`);
          nodo.status = 'offline';
          dbModificada = true;
        }
      });

      if (dbModificada) writeDB(db);
    } catch (error) {
      console.error("[ERROR: WATCHDOG]", error.message);
    }
  });

  // 3. LIMPIEZA AUTOMÁTICA: Revisa cada hora
  // Evita que el frontend se llene de alertas antiguas desactivándolas.
  cron.schedule('0 * * * *', () => {
    try {
      const db = readDB();
      const alertas = db.alertas || db;
      const EXPIRACION_MS = 1000 * 60 * 60 * 2; // Alertas expiran a las 2 horas
      const ahora = Date.now();
      let dbModificada = false;

      alertas.forEach(alerta => {
        const fechaAlerta = alerta.fecha || alerta.timestamp;
        const expiracionMs = alerta.id?.includes('SIM') ? (1000 * 60 * 30) : EXPIRACION_MS; // Simuladas expiran en 30 min, manuales en 2 horas
        if (alerta.activa && fechaAlerta && (ahora - new Date(fechaAlerta).getTime()) > expiracionMs) {
          console.log(`[CRON: LIMPIEZA] Desactivando alerta expirada ${alerta.id}`);
          alerta.activa = false;
          dbModificada = true;
        }
      });

      if (dbModificada) {
        if (db.alertas) db.alertas = alertas;
        writeDB(db.alertas ? db : alertas);
      }
    } catch (error) {
      console.error("[ERROR: LIMPIEZA]", error.message);
    }
  });
};

module.exports = { iniciarCron };