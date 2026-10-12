
const mqtt = require('mqtt');

// Broker público de pruebas para desarrollo local
const BROKER_URL = 'mqtt://broker.hivemq.com:1883';
const TOPIC_ALERTAS = 'quakesignal/alertas/cap';

let client = null;

/**
 * Inicializa la conexión del cliente Node.js con el Broker MQTT.
 */
const initMQTT = () => {
  client = mqtt.connect(BROKER_URL);

  client.on('connect', () => {
    console.log(' [MQTT] Conectado exitosamente al broker:', BROKER_URL);
  });

  client.on('error', (err) => {
    console.error(' [MQTT] Error de conexión con el broker:', err);
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Intentando reconexión con el broker...');
  });
};

/**
 * Publica un paquete estandarizado CAP v1.2 hacia el broker.
 * @param {Object} capPayload - JSON generado por formatToCAP()
 */
const publicarAlertaCAP = (capPayload) => {
  if (!client || !client.connected) {
    console.warn(' [MQTT] No se pudo publicar: Sin conexión activa con el broker.');
    return false;
  }

  const mensajeString = JSON.stringify(capPayload);
  
  // Publicación con QoS 1 para asegurar la recepción por parte de las ESP32
  client.publish(TOPIC_ALERTAS, mensajeString, { qos: 1, retain: true }, (err) => {
    if (err) {
      console.error(' [MQTT] Error al publicar alerta:', err);
    } else {
      console.log(` [MQTT] Alerta '${capPayload.alert.identifier}' publicada con éxito en '${TOPIC_ALERTAS}'`);
    }
  });

  return true;
};

module.exports = { initMQTT, publicarAlertaCAP, TOPIC_ALERTAS };