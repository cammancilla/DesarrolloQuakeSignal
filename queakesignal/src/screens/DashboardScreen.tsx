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
import { getCurrentUser, isAdmin, getAuthHeaders } from "../utils/auth";

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

  // Mínimo privilegio: Validar si el usuario actual es Administrador
  const currentUser = getCurrentUser();
  const admin = isAdmin(currentUser);

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
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener las alertas`);
      }

      const data: SeismicAlert[] = await response.json();
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error("Detalle del error:", err);
      setError(err.message || "Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };
 
  // FUNCIÓN DEL BOTÓN DE PÁNICO (Solo Administrador)
  const handlePanicButton = async () => {
    if (!admin) {
      alert("Acceso denegado: El Botón de Pánico es exclusivo para usuarios con rol de Administrador.");
      return;
    }

    setSendingPanic(true);
    try {
      const response = await fetch(getApiUrl("/api/alertas/panico"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tipo: "Terremoto (Manual)",
          intensidad: "Alerta Crítica",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Error al activar la alerta de pánico");
      }

      const data = await response.json();
      console.log("Alerta enviada correctamente:", data);

      setPanicPressed(true);
      fetchAlerts(); // Refresca las alertas inmediatamente
    } catch (err: any) {
      console.error(" Error al activar botón de pánico:", err);
      alert(`No se pudo enviar la alerta de pánico: ${err.message}`);
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
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-5 transition-colors">
      {/* Stat cards dinámicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Cuadrícula adaptable: 3 columnas si es Administrador (con botón de pánico), 2 columnas si es Operador */}
      <div className={`grid gap-4 ${admin ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>
        {/* Activación Rápida - EXCLUSIVO PARA ADMINISTRADOR (Mínimo privilegio) */}
        {admin && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Activación Rápida</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Admin
              </span>
            </div>
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
              <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center leading-relaxed">
                Al activar esta opción se distribuirá una alerta a los canales configurados.
              </p>
            </div>
          </div>
        )}
       
        {/* Última Alerta */}
        <div className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-5 transition-colors ${
          isContingencia ? "border-orange-200 dark:border-orange-900/60" : "border-gray-200 dark:border-slate-800"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Última Alerta</h3>
            {latestAlert?.activa ? (
              <Badge color="red">● ACTIVA</Badge>
            ) : (
              <Badge color="gray">FINALIZADA</Badge>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-xs text-gray-400 text-center">Cargando datos de la API...</div>
          ) : error ? (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded border border-red-100 dark:border-red-900">⚠️ {error}</div>
          ) : !latestAlert ? (
            <div className="p-4 text-xs text-gray-400 text-center">No hay registros en la API.</div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-lg p-3 mb-3">
              <div className="text-red-700 dark:text-red-400 font-bold text-base mb-1">{latestAlert.tipo}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-slate-400">
                <span>Intensidad:</span>
                <span className="font-medium text-gray-700 dark:text-slate-200">{latestAlert.intensidad}</span>
                <span>Ubicación:</span>
                <span className="font-medium text-gray-700 dark:text-slate-200 truncate">{latestAlert.ubicacion}</span>
                <span>Fecha:</span>
                <span className="font-mono text-gray-700 dark:text-slate-200">{formattedDate}</span>
                <span>Hora:</span>
                <span className="font-mono text-gray-700 dark:text-slate-200">{formattedTime}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5 mb-3">
            {isContingencia ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Telegram</span>
                  <span className="font-medium text-red-500 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">MQTT / Internet</span>
                  <span className="font-medium text-red-500 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-100 dark:border-orange-900/40 pt-1.5">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-slate-300 font-medium">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400 font-mono">Distribución activa ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Nodos</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">11/12 recibieron</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Telegram</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">MQTT / IoT</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">Disponible ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Nodos</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">12/12 recibieron</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onViewDetail}
            className="w-full text-xs py-2 rounded-lg border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLinkIcon size={12} />
            Ver detalles
          </button>
        </div>

        {/* Mapa */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Mapa de Cobertura</h3>
          <SantiagoMap compact mode={mode} />
          <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 dark:text-slate-400 flex-wrap justify-center">
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
            className="w-full mt-2 text-xs py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapIcon size={12} />
            Ver mapa completo
          </button>
        </div>
      </div>

      <HistoryTableWithAlerts alerts={alerts.slice(0, 5)} />

      {/* Vistas móviles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Vistas Móviles</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">Representación de la notificación recibida por el usuario final</p>
        <div className="flex gap-8 justify-center flex-wrap">
          <div className="text-center">
            <PhoneNotification />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">Notificación de alerta</p>
          </div>
          <div className="text-center">
            <PhoneStatus />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">Estado del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}
