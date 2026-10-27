/**
 * Convierte un objeto de alerta nativo de QuakeSignal al estándar CAP v1.2 (JSON).
 * Reconoce alertas manuales (Botón de Pánico) y automáticas/simuladas.
 * Reconoce múltiples tipos de eventos: Terremoto, Tsunami, Incendio Forestal,
 * Aluvión, Erupción Volcánica, etc.
 * Normaliza textos para evitar fallos por codificación de tildes o caracteres corruptos (? o \uFFFD).
 * @param {Object} alerta - Objeto proveniente de db.json o memoria
 */

// Helper para normalizar cadenas: remueve acentos y pasa a minúsculas
const normalizar = (str) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const formatToCAP = (alerta) => {
  if (!alerta) return null;

  const tipoNorm = normalizar(alerta.tipo);
  const intensidadNorm = normalizar(alerta.intensidad);
  const idStr = String(alerta.id || "");

  // Detectar si la alerta es de origen MANUAL (Botón de Pánico / Operador)
  const esManual = 
    alerta.manual === true || 
    alerta.origen === "manual" || 
    tipoNorm.includes("manual") || 
    (!idStr.includes("SIM") && !idStr.startsWith("ALERT-00"));

  // 1. Detección de Severidad
  // Extreme: Sismos >= 7.0 Mw, evacuación, crítica, alerta roja, catástrofe, alto riesgo, o manual de pánico
  // Severe: Sismos >= 5.0 Mw, moderado, alerta amarilla, alerta naranja
  // Moderate: eventos menores o de precaución
  const esExtrema = 
    esManual ||
    /evacuaci.?n/i.test(intensidadNorm) ||
    /cr.?tic/i.test(intensidadNorm) ||
    intensidadNorm.includes("mayor") ||
    intensidadNorm.includes("roja") ||
    /8\.\d*/.test(intensidadNorm) ||
    /7\.\d*/.test(intensidadNorm) ||
    intensidadNorm.includes("alto riesgo") ||
    /cat.?strof/i.test(intensidadNorm);

  const esSevera = 
    esExtrema ||
    intensidadNorm.includes("moderado") ||
    intensidadNorm.includes("amarill") ||
    intensidadNorm.includes("naranja") ||
    /6\.\d*/.test(intensidadNorm) ||
    /5\.\d*/.test(intensidadNorm);

  const severity = esExtrema ? "Extreme" : esSevera ? "Severe" : "Moderate";

  // 2. Clasificación por Tipo de Emergencia
  let category = "Geo";
  let event = alerta.tipo || "Evento Sísmico";
  let sameCode = "EQW";
  let instruction = "Mantenga la calma y busque una zona de seguridad sismo-resistente.";

  if (tipoNorm.includes("tsunami")) {
    category = "Met";
    event = "Alerta de Tsunami";
    sameCode = "TSW";
    instruction = "Diríjase de inmediato a zonas en altura sobre la cota 30. No utilice vehículos salvo extrema necesidad.";
  } else if (tipoNorm.includes("incendio") || tipoNorm.includes("fuego")) {
    category = "Fire";
    event = "Incendio Forestal";
    sameCode = "FRW";
    instruction = "Evacúe las zonas cercanas al fuego siguiendo las instrucciones de CONAF y Bomberos. Cubra sus vías respiratorias.";
  } else if (/aluvi.?n/i.test(tipoNorm) || /inundaci.?n/i.test(tipoNorm) || tipoNorm.includes("desborde")) {
    category = "Met";
    event = "Aluvión / Inundación";
    sameCode = "FFW";
    instruction = "Evacúe de inmediato hacia zonas altas alejándose de cauces y quebradas. Nunca cruce áreas anegadas.";
  } else if (/volc.?n/i.test(tipoNorm) || /erupci.?n/i.test(tipoNorm)) {
    category = "Geo";
    event = "Erupción Volcánica";
    sameCode = "VOW";
    instruction = "Manténgase fuera del perímetro de exclusión volcánica y proteja ojos y vías respiratorias de las cenizas.";
  } else if (tipoNorm.includes("terremoto") || tipoNorm.includes("sismo")) {
    category = "Geo";
    event = tipoNorm.includes("mayor") ? "Sismo Mayor" : (alerta.tipo || "Terremoto");
    sameCode = "EQW";
    instruction = esManual
      ? "Alerta sísmica activada manualmente por personal de emergencia. Mantenga la calma, protéjase bajo un elemento resistente y proceda a zona segura."
      : "Mantenga la calma, aléjese de ventanales y objetos colgantes. Busque una zona de seguridad sismo-resistente.";
  }

  // 3. Validación de Fechas
  let fechaSent;
  try {
    const d = new Date(alerta.fecha);
    fechaSent = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
  } catch {
    fechaSent = new Date().toISOString();
  }

  const fechaExpires = new Date(new Date(fechaSent).getTime() + 30 * 60 * 1000).toISOString();

  // 4. Coordenadas y Radio
  const lat = alerta.lat !== undefined && alerta.lat !== null ? alerta.lat : -33.4429;
  const lng = alerta.lng !== undefined && alerta.lng !== null ? alerta.lng : -70.6539;
  const radioKm = alerta.radioKm !== undefined && alerta.radioKm !== null ? alerta.radioKm : 20;
  const ubicacion = alerta.ubicacion || "Chile";

  // 5. Estado y Tipo de Mensaje según estándar CAP v1.2
  const status = "Actual";
  const msgType = alerta.activa === false ? "Cancel" : "Alert";

  // Limpieza de caracteres extraños en intensidad para presentación limpia
  const intensidadLimpia = String(alerta.intensidad || severity)
    .replace(/cr.?tic[ao]?/i, 'Crítica')
    .replace(/evacuaci.?n/i, 'Evacuación')
    .replace(/\?/g, '')
    .trim();

  return {
    alert: {
      identifier: alerta.id || `ALERT-${Date.now().toString().slice(-4)}`,
      sender: "quakesignal-core@onemi.cl",
      sent: fechaSent,
      status: status,         // Actual | Exercise | System | Test
      msgType: msgType,       // Alert | Update | Cancel
      scope: "Public",        // Public | Restricted | Private
      note: esManual 
        ? "Alerta emitida manualmente por el operador de turno mediante Botón de Pánico." 
        : "Alerta generada por el sistema de detección y simulación.",
      info: {
        category: category,
        event: event,
        urgency: "Immediate",
        severity: severity,
        certainty: "Observed",
        audience: esManual ? "Población general y equipos de rescate" : "Población general",
        eventCode: {
          valueName: "SAME",
          value: sameCode
        },
        expires: fechaExpires,
        headline: esManual 
          ? `[ALERTA MANUAL] ${alerta.tipo || event}: ${intensidadLimpia}`
          : `${alerta.tipo || event}: ${intensidadLimpia}`,
        description: `Se ha emitido una '${alerta.tipo || event}' con nivel '${intensidadLimpia}' para la zona de ${ubicacion}. Origen: ${esManual ? "Despacho Manual (Operador)" : "Detección Automática"}.`,
        instruction: instruction,
        area: {
          areaDesc: ubicacion,
          // Formato estándar CAP (Lat,Lng,Radio):
          circle: `${lat},${lng},${radioKm}`
        }
      }
    }
  };
};

module.exports = { formatToCAP };
