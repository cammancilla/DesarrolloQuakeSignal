// services/mqttService.js
const mqtt = require('mqtt');

let client = null;

const initMQTT = (config = {}) => {
  // Si ya existe un cliente conectado, lo cerramos antes de crear una nueva conexión
  if (client) {
    client.end();
  }

  // Extraer el broker configurado
  let host = config.broker || "127.0.0.1";

  // Si se detecta la IP pública o el dominio de GCP, forzamos la IP interna (127.0.0.1)
  // para evitar el Hairpin NAT / connack timeout cuando el backend corre dentro de la VM.
  if (host === "136.112.57.163" || host === "quakesignal.duckdns.org") {
    host = "127.0.0.1";
  }

  const port = parseInt(config.puerto) || 1883;
  const brokerUrl = `mqtt://${host}:${port}`;

  const options = {
    username: config.usuario || "quakesignal_core",
    password: config.password || "qs_secure_pwd_2026",
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  };

  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log(` [MQTT] Conectado exitosamente al broker: ${brokerUrl}`);
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
      console.error(' [MQTT] Error al publicar alerta:', err.message);
    } else {
      console.log(` [MQTT] Alerta publicada en '${topico}':`, capPayload.alert?.identifier || capPayload.id);
    }
  });

  return true;
};

module.exports = { initMQTT, publicarAlertaCAP };