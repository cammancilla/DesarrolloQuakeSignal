import { useEffect, useMemo, useState } from "react";
import { CommMode, Alerta } from "../types";
import SantiagoMap from "../components/SantiagoMap.tsx";
import Badge from "../components/Badge.tsx";
import { AlertTriangleIcon, ZapIcon, SendIcon, CheckCircleIcon } from "../components/icons.tsx";
import { getApiUrl } from "../utils/auth";

export interface AlertCAPInfo {
  category?: string;
  event?: string;
  urgency?: string;
  severity?: string;
  certainty?: string;
  headline?: string;
  description?: string;
  instruction?: string;
  area?: {
    areaDesc?: string;
    circle?: string;
  };
  expires?: string;
}

export interface AlertCAP {
  alert?: {
    identifier?: string;
    sender?: string;
    sent?: string;
    status?: string;
    msgType?: string;
    scope?: string;
    note?: string;
    info?: AlertCAPInfo;
  };
}

export interface AlertDetailItem extends Partial<Alerta> {
  cap?: AlertCAP;
}

// Alerta base de respaldo para visualización inicial consistente
const DEFAULT_FALLBACK_ALERT: AlertDetailItem = {
  id: "ALERT-7100",
  tipo: "Terremoto",
  intensidad: "7.1 Mw",
  ubicacion: "Santiago Centro, Chile",
  fecha: new Date().toISOString(),
  activa: true,
  despachada: true,
  lat: -33.4429,
  lng: -70.6539,
  radioKm: 20,
};

// Formatea la intensidad asegurando el formato "7.1 Mw"
export function formatIntensidad(intensidad?: string, tipo?: string): string {
  if (!intensidad || intensidad === "—" || intensidad === "No especificada") {
    return "7.1 Mw";
  }
  const trimmed = intensidad.trim();

  // Reemplazar textos antiguos o genéricos ("Moderado", "Alerta Crítica")
  if (/^moderado$/i.test(trimmed) || /^alerta cr[ií]tica$/i.test(trimmed)) {
    return "7.1 Mw";
  }

  // Si es un número solo (ej: "7.1" o "7,1"), añadir "Mw"
  if (/^\d+([.,]\d+)?$/.test(trimmed)) {
    return `${trimmed.replace(",", ".")} Mw`;
  }

  // Si ya tiene formato Mw (ej: "7.1 Mw", "7.1Mw")
  const mwMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*mw$/i);
  if (mwMatch) {
    return `${mwMatch[1].replace(",", ".")} Mw`;
  }

  // Si es un evento sísmico (Terremoto o Sismo) y tiene número o es genérico
  if (/terremoto|sismo/i.test(tipo || "")) {
    const num = trimmed.match(/\d+([.,]\d+)?/);
    return num ? `${num[0].replace(",", ".")} Mw` : "7.1 Mw";
  }

  return trimmed;
}

// Formateador de fecha amigable (DD/MM/YYYY — HH:mm:ss)
function formatFecha(fechaStr?: string): string {
  if (!fechaStr) return "Sin fecha registrada";
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const seg = String(d.getSeconds()).padStart(2, "0");
    return `${dia}/${mes}/${anio} — ${hora}:${min}:${seg}`;
  } catch {
    return fechaStr;
  }
}

// Extrae y complementa los campos bajo el estándar internacional CAP v1.2
function getCapData(alerta: AlertDetailItem | null) {
  if (!alerta) {
    return {
      headline: "Terremoto: 7.1 Mw",
      description: "No se registran alertas activas en el sistema actualmente.",
      instruction: "Mantenga la calma y revise periódicamente el estado de la red.",
      areaDesc: "Santiago Centro, Chile",
      circle: "-33.4429,-70.6539,20",
      urgency: "Past",
      severity: "Minor",
      certainty: "Unlikely",
      category: "Geo",
      identifier: "N/A",
    };
  }

  const capInfo = alerta.cap?.alert?.info;
  const esManual = alerta.manual || alerta.origen === "manual";
  const intensidadLimpia = formatIntensidad(alerta.intensidad, alerta.tipo);

  const headline =
    capInfo?.headline ||
    (esManual
      ? `[ALERTA MANUAL] ${alerta.tipo || "Terremoto"}: ${intensidadLimpia}`
      : `${alerta.tipo || "Terremoto"}: ${intensidadLimpia}`);

  const defaultDesc = `Se ha emitido una '${alerta.tipo || "Terremoto"}' con nivel '${intensidadLimpia}' para la zona de ${alerta.ubicacion || "Santiago Centro, Chile"}. Origen: ${esManual ? "Despacho Manual (Operador)" : "Detección Automática"}.`;
  const description = capInfo?.description || defaultDesc;

  let defaultInstruction = "Mantenga la calma y busque una zona de seguridad sismo-resistente.";
  const tipoNorm = String(alerta.tipo || "").toLowerCase();
  if (tipoNorm.includes("incendio") || tipoNorm.includes("fuego")) {
    defaultInstruction = "Evacúe las zonas cercanas al fuego siguiendo las instrucciones de CONAF y Bomberos. Cubra sus vías respiratorias.";
  } else if (tipoNorm.includes("tsunami")) {
    defaultInstruction = "Diríjase de inmediato a zonas en altura sobre la cota 30. No utilice vehículos salvo extrema necesidad.";
  } else if (tipoNorm.includes("aluv") || tipoNorm.includes("inunda") || tipoNorm.includes("desborde")) {
    defaultInstruction = "Evacúe de inmediato hacia zonas altas alejándose de cauces y quebradas. Nunca cruce áreas anegadas.";
  } else if (tipoNorm.includes("volc") || tipoNorm.includes("erupc")) {
    defaultInstruction = "Manténgase fuera del perímetro de exclusión volcánica y proteja ojos y vías respiratorias de las cenizas.";
  } else if (esManual) {
    defaultInstruction = "Alerta sísmica activada manualmente por personal de emergencia. Mantenga la calma, protéjase bajo un elemento resistente y proceda a zona segura.";
  }
  const instruction = capInfo?.instruction || defaultInstruction;

  const areaDesc = capInfo?.area?.areaDesc || alerta.ubicacion || "Santiago Centro, Chile";

  const lat = alerta.lat !== undefined && alerta.lat !== null ? alerta.lat : -33.4429;
  const lng = alerta.lng !== undefined && alerta.lng !== null ? alerta.lng : -70.6539;
  const radioKm = alerta.radioKm !== undefined && alerta.radioKm !== null ? alerta.radioKm : 20;
  const circle = capInfo?.area?.circle || `${lat},${lng},${radioKm}`;

  return {
    headline,
    description,
    instruction,
    areaDesc,
    circle,
    urgency: capInfo?.urgency || "Immediate",
    severity: capInfo?.severity || "Extreme",
    certainty: capInfo?.certainty || "Observed",
    category: capInfo?.category || "Geo",
    identifier: alerta.cap?.alert?.identifier || alerta.id || "N/A",
  };
}

export default function AlertDetailScreen({
  mode,
  alerts = [],
}: {
  mode: CommMode;
  alerts?: AlertDetailItem[];
}) {
  const isContingencia = mode === "contingencia";

  // Estado local para alertas obtenidas dinámicamente desde el backend
  const [localAlerts, setLocalAlerts] = useState<AlertDetailItem[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // Reloj en tiempo real
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Carga y polling de alertas desde la API (/api/alertas)
  useEffect(() => {
    // Si ya recibimos alertas por props y no están vacías, las usamos
    if (alerts && alerts.length > 0) {
      setLocalAlerts(alerts);
      return;
    }

    const fetchAlertas = async () => {
      try {
        const res = await fetch(getApiUrl("/api/alertas"));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLocalAlerts(data);
          }
        }
      } catch (err) {
        console.error("Error al obtener alertas en AlertDetailScreen:", err);
      }
    };

    fetchAlertas();
    const pollInterval = setInterval(fetchAlertas, 5000);
    return () => clearInterval(pollInterval);
  }, [alerts]);

  // Lista efectiva de alertas (o respaldo inicial con Terremoto 7.1 Mw)
  const effectiveAlerts = useMemo(() => {
    if (alerts && alerts.length > 0) return alerts;
    if (localAlerts && localAlerts.length > 0) return localAlerts;
    return [DEFAULT_FALLBACK_ALERT];
  }, [alerts, localAlerts]);

  // Obtiene la alerta activa (o la más reciente según la fecha)
  const latestAlert = useMemo<AlertDetailItem | null>(() => {
    if (!effectiveAlerts || effectiveAlerts.length === 0) return DEFAULT_FALLBACK_ALERT;

    // Busca primero si hay alguna activa; si no, toma la de fecha más reciente
    const activeAlert = effectiveAlerts.find((alerta) => alerta.activa);
    if (activeAlert) return activeAlert;

    return [...effectiveAlerts].sort(
      (a, b) => new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime()
    )[0];
  }, [effectiveAlerts]);

  // Intensidad procesada y formateada (ej: "7.1 Mw")
  const displayIntensidad = useMemo(() => {
    return formatIntensidad(latestAlert?.intensidad, latestAlert?.tipo);
  }, [latestAlert]);

  // Datos CAP calculados/extraídos
  const capData = useMemo(() => getCapData(latestAlert), [latestAlert]);

  // Hora de emisión formateada para el panel de difusión
  const alertTimeFormatted = useMemo(() => {
    if (!latestAlert?.fecha) return "12:40:18";
    try {
      const d = new Date(latestAlert.fecha);
      if (isNaN(d.getTime())) return "12:40:18";
      return d.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "12:40:18";
    }
  }, [latestAlert]);

  // Filas de detalle dinámicas
  const detailRows = useMemo(() => {
    if (!latestAlert) {
      return [
        { label: "Tipo de alerta", value: "Terremoto" },
        { label: "Intensidad", value: "7.1 Mw" },
        { label: "Fecha y hora", value: "—", mono: true },
        { label: "Fuente de datos", value: "—" },
        { label: "Zona afectada ", value: "Santiago Centro, Chile" },
        { label: "Geocírculo ", value: "-33.4429,-70.6539,20", mono: true },
      ];
    }

    const fuente = latestAlert.manual
      ? "Botón de Pánico (Despacho Manual)"
      : latestAlert.origen === "manual"
      ? "Manual (Operador de Turno)"
      : "Detección Automática (Simulación IoT)";

    return [
      { label: "Tipo de alerta", value: latestAlert.tipo || "Terremoto" },
      { label: "Intensidad", value: displayIntensidad },
      { label: "Fecha y hora", value: formatFecha(latestAlert.fecha), mono: true },
      { label: "Fuente de datos", value: fuente },
      { label: "Zona afectada ", value: capData.areaDesc },
      { label: "Geocírculo ", value: capData.circle, mono: true },
    ];
  }, [latestAlert, displayIntensidad, capData]);

  // Estilo dinámico del banner según si hay alerta activa o finalizada
  const bannerBg = latestAlert?.activa
    ? "bg-red-600 shadow-red-100 dark:shadow-red-950"
    : latestAlert
    ? "bg-amber-600 shadow-amber-100 dark:shadow-amber-950"
    : "bg-slate-700 shadow-slate-100 dark:shadow-slate-900";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-4 transition-colors">
      {/* Banner */}
      <div className={`${bannerBg} rounded-xl p-5 flex items-center justify-between text-white shadow-lg transition-colors`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <AlertTriangleIcon size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  latestAlert?.activa
                    ? "bg-white text-red-600"
                    : latestAlert
                    ? "bg-white text-amber-700"
                    : "bg-white/20 text-white"
                }`}
              >
                {latestAlert?.activa ? "ACTIVA" : latestAlert ? "FINALIZADA" : "SIN EVENTO"}
              </span>
              {isContingencia && (
                <span className="bg-orange-400/80 text-white text-xs font-semibold px-2 py-0.5 rounded">
                  VÍA RF
                </span>
              )}
              {capData.identifier && capData.identifier !== "N/A" && (
                <span className="bg-black/30 text-white font-mono text-[11px] px-2 py-0.5 rounded">
                  {capData.identifier}
                </span>
              )}
            </div>
            <div className="text-white font-bold text-lg mt-0.5">
              {latestAlert ? `${latestAlert.tipo} — ${displayIntensidad}` : "Sin eventos registrados"}
            </div>
          </div>
        </div>

        <div className="text-right text-white/90">
          <div className="text-[13px] uppercase tracking-[0.18em] text-white/80">
            Última actualización
          </div>
          <div className="font-mono text-sm font-semibold mt-1">
            {now.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-[12px] text-white/80 capitalize">
            {now.toLocaleDateString("es-CL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Grid: 50% y 50% (grid-cols-1 md:grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información del Evento (50%) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <ZapIcon size={14} />
              Información del Evento
            </h3>
          </div>

          <div className="space-y-3">
            {detailRows.map(({ label, value, mono }) => (
              <div
                key={label}
                className="flex items-start justify-between border-b border-gray-50 dark:border-slate-800/80 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-xs text-gray-400 dark:text-slate-400 pt-0.5">{label}</span>
                <span
                  className={`text-sm font-medium text-gray-800 dark:text-slate-100 text-right max-w-[62%] break-words ${
                    mono ? "font-mono text-xs" : ""
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* Descripción CAP (description) */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Descripción Oficial 
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-slate-300 mt-1 leading-relaxed bg-blue-50/70 dark:bg-blue-950/40 rounded-lg p-2.5 border border-blue-100 dark:border-blue-900/40 font-normal">
                {capData.description}
              </p>
            </div>

            {/* Instrucción CAP (instruction) */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                   Medidas de Seguridad 
                </span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 mt-1 leading-relaxed bg-amber-50/80 dark:bg-amber-950/40 rounded-lg p-2.5 border border-amber-200 dark:border-amber-900/50 font-medium">
                {capData.instruction}
              </p>
            </div>

            {/* Área CAP (area: areaDesc, circle) */}
           
          </div>
        </div>

        {/* Estado de Difusión (50%) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <SendIcon size={14} />
              Estado de Difusión
            </h3>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
              {isContingencia ? "Vía RF Autónoma" : "Red 100% Operativa"}
            </span>
          </div>

          <div className="space-y-3">
            {isContingencia ? (
              <>
                {[
                  { channel: "Telegram", status: "No disponible", detail: "Sin conexión a Internet", icon: "💬" },
                  { channel: "MQTT / Internet", status: "No disponible", detail: "Sin conexión a Internet", icon: "🌐" },
                ].map(({ channel, status, detail, icon }) => (
                  <div
                    key={channel}
                    className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-rose-950/40 border border-red-100 dark:border-rose-900/40"
                  >
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{channel}</span>
                        <Badge color="red">🔴 {status}</Badge>
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-400 font-mono mt-0.5">{detail}</div>
                    </div>
                  </div>
                ))}
                {[
                  { channel: "Comunicación RF (LoRa)", status: "Operativa", detail: "Distribución activa independiente", icon: "📡" },
                  { channel: "Dispositivos en Terreno", status: "11/12 recibieron", detail: "Estado de recepción: 91.7%", icon: "🔌" },
                ].map(({ channel, status, detail, icon }) => (
                  <div
                    key={channel}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-emerald-950/40 border border-green-100 dark:border-emerald-900/40"
                  >
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{channel}</span>
                        <Badge color="green">🟢 {status}</Badge>
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-400 font-mono mt-0.5">{detail}</div>
                    </div>
                  </div>
                ))}
                <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 rounded-lg px-3 py-2 mt-2">
                  <p className="text-[10px] text-orange-700 dark:text-orange-300 leading-relaxed font-medium">
                    El sistema opera en modo contingencia. La alerta está siendo distribuida a través del canal RF independiente de Internet.
                  </p>
                </div>
              </>
            ) : (
              [
                { channel: "Telegram", status: "Enviado", detail: `Hora de envío: ${alertTimeFormatted}`, icon: "💬" },
                { channel: "MQTT / IoT", status: "Enviado", detail: `Hora de publicación: ${alertTimeFormatted}`, icon: "📡" },
                { channel: "Comunicación RF", status: "Operativa", detail: "Estado de distribución: Activo", icon: "📡" },
                { channel: "Dispositivos", status: "12/12 Online", detail: "Estado de recepción: Completo", icon: "🔌" },
                { channel: "Teléfonos", status: "248 notificados", detail: "Estado de distribución: Completo", icon: "📱" },
              ].map(({ channel, status, detail, icon }) => (
                <div
                  key={channel}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-emerald-950/40 border border-green-100 dark:border-emerald-900/40"
                >
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{channel}</span>
                      <Badge color="green">🟢 {status}</Badge>
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-400 font-mono mt-0.5">{detail}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Cobertura de distribución georreferenciada
          </h3>
          {latestAlert && (
            <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <CheckCircleIcon size={14} className="text-green-500" />
              Centrado en epicentro ({capData.areaDesc})
            </span>
          )}
        </div>
        <SantiagoMap
          mode={mode}
          alerta={latestAlert ? (latestAlert as Alerta) : undefined}
          height="420px"
        />
      </div>
    </div>
  );
}
