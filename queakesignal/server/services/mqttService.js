// services/mqttService.js
const mqtt = require('mqtt');
const os = require('os');

let client = null;

/**
 * Función auxiliar para detectar si el código se está ejecutando dentro de la VM de GCP
 */
const esEntornoGCP = () => {
  // GCP asigna nombres de host específicos a las VMs o la variable de entorno USER / hostname
  const hostname = os.hostname();
  return hostname.includes('broker-mqtt-quakesignal') || process.env.GCP_ENV === 'true';
};

const initMQTT = (config = {}) => {
  // Si ya existe un cliente conectado, lo cerramos
  if (client) {
    client.end();
  }

  // IP configurada originalmente
  let host = config.broker || "136.112.57.163";

  // DETECCIÓN AUTOMÁTICA DE ENTORNO:
  // Si el proceso se ejecuta dentro de la VM de GCP y el broker apunta a su propia IP pública/dominio,
  // forzamos el uso de '127.0.0.1' para evitar el Hairpin NAT / connack timeout.
  if (esEntornoGCP()) {
    if (host === "136.112.57.163" || host === "quakesignal.duckdns.org") {
      host = "127.0.0.1";
    }
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