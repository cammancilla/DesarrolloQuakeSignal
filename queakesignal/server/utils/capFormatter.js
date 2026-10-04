/**
 * Convierte un objeto de alerta nativo de QuakeSignal al estándar CAP v1.2 (JSON).
 * @param {Object} alerta - Objeto proveniente de db.json
 */
const formatToCAP = (alerta) => {
  if (!alerta) return null;

  const esTsunami = alerta.tipo ? alerta.tipo.toLowerCase().includes("tsunami") : false;
  const esCritica = alerta.intensidad 
    ? (alerta.intensidad.toLowerCase().includes("evacuación") || 
       alerta.intensidad.toLowerCase().includes("crítica") ||
       alerta.intensidad.toLowerCase().includes("mayor"))
    : false;

  return {
    alert: {
      identifier: alerta.id,
      sender: "quakesignal-core@onemi.cl",
      sent: alerta.fecha,
      status: "Actual",       // Actual | Exercise | System | Test
      msgType: "Alert",       // Alert | Update | Cancel
      scope: "Public",        // Public | Restricted | Private
      info: {
        category: esTsunami ? "Met" : "Geo",
        event: alerta.tipo || "Evento Sísmico",
        urgency: "Immediate",
        severity: esCritica ? "Extreme" : "Severe",
        certainty: "Observed",
        eventCode: {
          valueName: "SAME",
          value: esTsunami ? "TSW" : "EQW"
        },
        expires: new Date(new Date(alerta.fecha).getTime() + 30 * 60 * 1000).toISOString(),
        headline: `${alerta.tipo}: ${alerta.intensidad}`,
        description: `Se ha emitido una '${alerta.tipo}' con nivel '${alerta.intensidad}' para la zona de ${alerta.ubicacion}.`,
        instruction: esTsunami 
          ? "Diríjase de inmediato a zonas en altura sobre la cota 30." 
          : "Mantenga la calma y busque una zona de seguridad.",
        area: {
          areaDesc: alerta.ubicacion,
          // Formato estándar CAP (Lat,Lng,Radio):
          circle: `${alerta.lat},${alerta.lng},${alerta.radioKm}`
        }
      }
    }
  };
};

module.exports = { formatToCAP };