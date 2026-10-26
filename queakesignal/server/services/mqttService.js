// services/mqttService.js
const mqtt = require('mqtt');
const os = require('os');

let client = null;

const initMQTT = (config = {}) => {
  if (client) {
    client.end();
  }

  // IP/Dominio de origen
  let host = config.broker || "136.112.57.163";

  // Si corre en Linux (la máquina virtual de GCP donde corre Mosquitto localmente):
  // SIEMPRE debe conectarse a 127.0.0.1 para evitar Hairpin NAT / Timeout.
  if (os.platform() === 'linux') {
    host = "127.0.0.1";
  } else if (host === "broker.emqx.io" || host === "136.112.57.163") {
    host = "quakesignal.duckdns.org";
  }

  const port = parseInt(config.puerto) || 1883;
  const brokerUrl = `mqtt://${host}:${port}`;

  const options = {
    username: config.usuario || "quakesignal_core",
    password: config.password || "qs_secure_pwd_2026",
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  };

  console.log(` [MQTT] Intentando conectar a: ${brokerUrl}`);

  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log(` [MQTT] Conectado exitosamente al broker: ${brokerUrl}`);
  });

  client.on('error', (err) => {
    console.error('[MQTT] Error de conexión:', err.message);
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