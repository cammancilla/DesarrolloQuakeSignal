const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

const iniciarCron = () => {
  console.log("Servicio CRON de monitoreo cíclico inicializado (Cada 5 segundos)");

  // Ejecuta la consulta continua cada 5 segundos
  cron.schedule('*/5 * * * * *', () => {
    try {
      const alertas = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      
      // Buscar alerta que esté ACTIVA pero NO DESPACHADA
      const alertaPendiente = alertas.find(a => a.activa === true && a.despachada === false);

      if (alertaPendiente) {
        console.log(`\n[CRON DETECTÓ EVENTO] Procesando ${alertaPendiente.id}...`);

        // Canal A: Telegram API (Simulación)
        console.log(`[CANAL A] HTTP POST a Telegram API: Notificación Push enviada.`);

        // Canal B: Broker MQTT GCP (Simulación)
        console.log(`[CANAL B] MQTT Publish en tópico 'chile/alertas' hacia Broker GCP.`);

        // Marcar la alerta como procesada
        alertaPendiente.despachada = true;
        fs.writeFileSync(DB_PATH, JSON.stringify(alertas, null, 2));

        console.log(`[CRON COMPLETE] Alerta ${alertaPendiente.id} despachada a Telegram y Nodos ESP32.\n`);
      }
    } catch (error) {
      console.error("Error en el proceso CRON:", error.message);
    }
  });
};

module.exports = { iniciarCron };