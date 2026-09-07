const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

const iniciarCron = () => {
  console.log("[CRON] Servicio de monitoreo ciclico inicializado (Cada 1 minuto)");

  cron.schedule('* * * * *', () => {
    try {
      const alertas = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      
      const alertaPendiente = alertas.find(a => a.activa === true && a.despachada === false);

      if (alertaPendiente) {
        console.log(`[CRON] Evento detectado. Procesando ${alertaPendiente.id}...`);

        // Canal A: Telegram API (Simulacion)
        console.log(`[CANAL A] HTTP POST a Telegram API: Notificacion Push enviada.`);

        // Canal B: Broker MQTT GCP (Simulacion)
        console.log(`[CANAL B] MQTT Publish en topico 'chile/alertas' hacia Broker GCP.`);

        // Marcar la alerta como procesada
        alertaPendiente.despachada = true;
        fs.writeFileSync(DB_PATH, JSON.stringify(alertas, null, 2));

        console.log(`[CRON] Tarea completada. Alerta ${alertaPendiente.id} despachada a Telegram y Nodos ESP32.`);
      }
    } catch (error) {
      console.error("[ERROR] Fallo en el proceso CRON:", error.message);
    }
  });
};

module.exports = { iniciarCron };