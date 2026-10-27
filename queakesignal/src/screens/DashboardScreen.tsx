import { useState, useEffect } from "react";
import { CommMode, SeismicAlert } from "../types/types";
import StatCard from "../components/StatCard";
import CommStatusCard from "../components/CommStatusCard";
import SantiagoMap from "../components/SantiagoMap";
import HistoryTable from "../components/HistoryTable";
import Badge from "../components/Badge";
import { PhoneNotification, PhoneStatus } from "../components/PhoneMockups";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CpuIcon,
  BellIcon,
  RadioIcon,
  ExternalLinkIcon,
  MapIcon
} from "../components/icons";

interface DashboardScreenProps {
  onViewDetail?: () => void;
  onNavigateMap?: () => void;
  mode: CommMode;
}

export default function DashboardScreen({
  onViewDetail,
  onNavigateMap,
  mode,
}: DashboardScreenProps) {
  const [panicPressed, setPanicPressed] = useState(false);
  const [sendingPanic, setSendingPanic] = useState(false);
  const [alerts, setAlerts] = useState<SeismicAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isContingencia = mode === "contingencia";
  const HistoryTableWithAlerts = HistoryTable as any;

  const getApiUrl = (endpoint: string) => {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const base = isLocal ? "http://localhost:3001" : "https://quakesignal.duckdns.org";
    return `${base}${endpoint}`;
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(getApiUrl("/api/alertas"));
      console.log("Respuesta servidor HTTP Status:", response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener las alertas`);
      }

      const data: SeismicAlert[] = await response.json();
      console.log("Alertas recibidas:", data);

      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error("Detalle del error:", err);
      setError(err.message || "Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };
 
  //  FUNCIÓN DEL BOTÓN DE PÁNICO
  const handlePanicButton = async () => {
    setSendingPanic(true);
    try {
      const response = await fetch(getApiUrl("/api/alertas/panico"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "Terremoto (Manual)",
          intensidad: "Alerta Crítica",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al activar la alerta de pánico");
      }

      const data = await response.json();
      console.log("Alerta enviada correctamente:", data);

      setPanicPressed(true);
      fetchAlerts(); // Refresca las alertas inmediatamente
    } catch (err: any) {
      console.error(" Error al activar botón de pánico:", err);
      alert("No se pudo enviar la alerta de pánico.");
    } finally {
      setSendingPanic(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Polling cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Datos procesados en tiempo real
  const activeAlert = alerts.find((a) => a.activa);
  const latestAlert = activeAlert || alerts[0];

  const formattedDate = latestAlert?.fecha
    ? new Date(latestAlert.fecha).toLocaleDateString("es-CL")
    : "--/--/----";

  const formattedTime = latestAlert?.fecha
    ? new Date(latestAlert.fecha).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">
      {/* Stat cards dinámicas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<ActivityIcon />}
          label="Estado General"
          value={activeAlert ? "Alerta" : "Normal"}
          sub={activeAlert ? "Evento en progreso" : "Sistema funcionando correctamente"}
          accent={activeAlert ? "red" : "green"}
        />
        <StatCard
          icon={<AlertTriangleIcon />}
          label="Alertas Activas"
          value={activeAlert ? "1" : "0"}
          sub={activeAlert ? "Requiere atención" : "Sin emergencias"}
          accent={activeAlert ? "red" : "green"}
        />
        <StatCard
          icon={<CpuIcon />}
          label="Nodos IoT"
          value={isContingencia ? "11" : "12"}
          sub={isContingencia ? "11/12 Online" : "Online"}
          accent="blue"
        />
        <StatCard
          icon={<ActivityIcon />}
          label="Usuarios / Destinatarios"
          value="248"
          sub="Destinatarios disponibles"
          accent="gray"
        />
      </div>

      <CommStatusCard mode={mode} />

      <div className="grid grid-cols-3 gap-4">
       {/* Activación Rápida */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Activación Rápida</h3>
          <div className="flex flex-col items-center gap-3">
            <button
              disabled={sendingPanic}
              onClick={handlePanicButton}
              className={`w-full py-5 rounded-xl flex flex-col items-center gap-2 transition-all font-bold text-white text-sm tracking-wide shadow-lg cursor-pointer ${
                sendingPanic
                  ? "bg-red-800 opacity-70 cursor-wait"
                  : panicPressed
                  ? "bg-red-700 shadow-red-300"
                  : "bg-red-600 hover:bg-red-700 shadow-red-200"
              }`}
            >
              <BellIcon size={24} />
              {sendingPanic ? "ENVIANDO ALERTA..." : "BOTÓN DE PÁNICO"}
              <span className="text-xs font-normal opacity-80">
                {sendingPanic ? "Conectando con Backend Core..." : "Enviar alerta inmediata"}
              </span>
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Al activar esta opción se distribuirá una alerta a los canales configurados.
            </p>
          </div>
        </div>
       

  
        <div className={`bg-white rounded-xl border shadow-sm p-5 ${isContingencia ? "border-orange-200" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Última Alerta</h3>
            {latestAlert?.activa ? (
              <Badge color="red">● ACTIVA</Badge>
            ) : (
              <Badge color="gray">FINALIZADA</Badge>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-xs text-gray-400 text-center">Cargando datos de la API...</div>
          ) : error ? (
            <div className="p-3 text-xs text-red-600 bg-red-50 rounded border border-red-100">⚠️ {error}</div>
          ) : !latestAlert ? (
            <div className="p-4 text-xs text-gray-400 text-center">No hay registros en la API.</div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
              <div className="text-red-700 font-bold text-base mb-1">{latestAlert.tipo}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span>Intensidad:</span>
                <span className="font-medium text-gray-700">{latestAlert.intensidad}</span>
                <span>Ubicación:</span>
                <span className="font-medium text-gray-700 truncate">{latestAlert.ubicacion}</span>
                <span>Fecha:</span>
                <span className="font-mono text-gray-700">{formattedDate}</span>
                <span>Hora:</span>
                <span className="font-mono text-gray-700">{formattedTime}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5 mb-3">
            {isContingencia ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Telegram</span>
                  <span className="font-medium text-red-500 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">MQTT / Internet</span>
                  <span className="font-medium text-red-500 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-100 pt-1.5">
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-semibold text-orange-600 font-mono">Distribución activa ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Nodos</span>
                  <span className="font-medium text-green-600">11/12 recibieron</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Telegram</span>
                  <span className="font-medium text-green-600">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">MQTT / IoT</span>
                  <span className="font-medium text-green-600">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-medium text-green-600">Disponible ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Nodos</span>
                  <span className="font-medium text-green-600">12/12 recibieron</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onViewDetail}
            className="w-full text-xs py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLinkIcon size={12} />
            Ver detalles
          </button>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Mapa de Cobertura</h3>
          <SantiagoMap compact mode={mode} />
          <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 flex-wrap justify-center">
            <span>🔴 Alerta activa</span>
            <span>🟢 Nodo online</span>
            <span>⚪ Nodo offline</span>
            <span className="flex items-center gap-0.5">
              <span className="inline-block w-3 border-t border-dashed border-green-400" />
              <span> Cob. RF</span>
            </span>
          </div>
          <button 
            onClick={onNavigateMap}
            className="w-full mt-2 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapIcon size={12} />
            Ver mapa completo
          </button>
        </div>
      </div>

      <HistoryTableWithAlerts alerts={alerts.slice(0, 5)} />

      {/* Vistas móviles */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Vistas Móviles</h3>
        <p className="text-xs text-gray-400 mb-5">Representación de la notificación recibida por el usuario final</p>
        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <PhoneNotification />
            <p className="text-xs text-gray-400 mt-3">Notificación de alerta</p>
          </div>
          <div className="text-center">
            <PhoneStatus />
            <p className="text-xs text-gray-400 mt-3">Estado del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}