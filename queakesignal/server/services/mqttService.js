
// services/mqttService.js
const mqtt = require('mqtt');

let client = null;

const initMQTT = (config = {}) => {
  // Si ya existe un cliente conectado, lo cerramos antes de crear una nueva conexión
  if (client) {
    client.end();
  }

  // Extraer parámetros recibidos o usar los predeterminados de GCP por defecto
  const host = config.broker || "136.112.57.163";
  const port = config.puerto || 1883;
  const brokerUrl = `mqtt://${host}:${port}`;

  const options = {
    username: config.usuario || "quakesignal_core",
    password: config.password || "qs_secure_pwd_2026"
  };

  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log(`[MQTT] Conectado exitosamente al broker: ${brokerUrl}`);
  });

  client.on('error', (err) => {
    console.error(' [MQTT] Error de conexión:', err.message);
  });
};

const publicarAlertaCAP = (capPayload, topico = "chile/alertas") => {
  if (!client || !client.connected) {
    console.warn(' [MQTT] No hay conexión activa con el broker.');
    return false;
  }

  const mensajeString = JSON.stringify(capPayload);
  
  client.publish(topico, mensajeString, { qos: 1, retain: true }, (err) => {
    if (err) {
      console.error(' [MQTT] Error al publicar alerta:', err);
    } else {
      console.log(` [MQTT] Alerta publicada en '${topico}':`, capPayload.alert?.identifier || capPayload.id);
    }
  });

  return true;
};

module.exports = { initMQTT, publicarAlertaCAP };