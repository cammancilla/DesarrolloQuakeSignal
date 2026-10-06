const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const DEFAULT_BOT_TOKEN = "8734767607:AAGAra5dEivH3fSCAJ5l8x1v7065ZpbYKBQ";
const DEFAULT_CHAT_ID = "-1003929496016";

/**
 * Función para enviar mensaje al canal de Telegram
 * @param {Object} alerta - Objeto con datos de la alerta
 * @returns {Promise<boolean>}
 */
async function enviarAlertaTelegram(alerta) {
  let botToken = DEFAULT_BOT_TOKEN;
  let chatId = DEFAULT_CHAT_ID;

  try {
    if (fs.existsSync(DB_PATH)) {
      const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (db.configuracion?.comunicaciones?.telegram?.botToken) {
        botToken = db.configuracion.comunicaciones.telegram.botToken;
      }
      if (db.configuracion?.comunicaciones?.telegram?.chatId) {
        chatId = db.configuracion.comunicaciones.telegram.chatId;
      }
    }
  } catch (err) {
    // Usar defaults si hay error leyendo db
  }

  const textoMensaje = `🔴 *ALERTA ACTIVA* 🔴\n\n` +
                       `*Tipo:* ${alerta.tipo || 'Emergencia Sísmica'}\n` +
                       `*Intensidad:* ${alerta.intensidad || 'Crítica'}\n` +
                       `*Ubicación:* ${alerta.ubicacion || 'Chile'}\n\n` +
                       `Manténgase informado mediante canales oficiales.`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textoMensaje,
        parse_mode: "Markdown" // Permite usar negritas con los asteriscos
      })
    });
    
    if (respuesta.ok) {
      console.log(`[Telegram] Alerta ${alerta.id || ''} enviada al canal exitosamente.`);
      return true;
    } else {
      const errorText = await respuesta.text();
      console.error("[Telegram] Error en la respuesta:", errorText);
      return false;
    }
  } catch (error) {
    console.error("[Telegram] Error de conexión:", error.message);
    return false;
  }
}

/**
 * Función para enviar mensaje de prueba desde el panel de Configuración
 */
async function probarConexionTelegram(token, chat) {
  const botToken = token || DEFAULT_BOT_TOKEN;
  const chatId = chat || DEFAULT_CHAT_ID;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const textoPrueba = `⚡ *PRUEBA DE CONEXIÓN QUAKESIGNAL*\n\n` +
                      `El sistema de alertas tempranas se ha conectado exitosamente con el Bot de Telegram y este canal de difusión.\n\n` +
                      `_Fecha y hora: ${new Date().toLocaleString('es-CL')}_`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: textoPrueba,
      parse_mode: "Markdown"
    })
  });

  const data = await respuesta.json();
  return data;
}

module.exports = {
  enviarAlertaTelegram,
  probarConexionTelegram,
  DEFAULT_BOT_TOKEN,
  DEFAULT_CHAT_ID
};
