import React, { useState, useEffect, useMemo } from "react";
import { getApiUrl } from "../utils/auth";

type SeismicAlert = {
  id: number | string;
  fecha: string;
  tipo: string;
  ubicacion: string;
  intensidad: string | number;
  activa: boolean;
};

// Función auxiliar para determinar si una alerta sigue activa (menos de 1 hora de emitida)
export const isAlertaActiva = (alerta: SeismicAlert): boolean => {
  if (!alerta.activa) return false;
  const fechaMs = new Date(alerta.fecha).getTime();
  if (isNaN(fechaMs)) return false;
  const UMBRAL_UNA_HORA = 60 * 60 * 1000; // 1 hora exacta (3600 segundos)
  return Date.now() - fechaMs < UMBRAL_UNA_HORA;
};

// Componente secundario para renderizar la tabla
interface HistoryTableProps {
  alerts?: SeismicAlert[];
}

function HistoryTable({ alerts = [] }: HistoryTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
          <tr>
            <th className="px-5 py-3">ID / Fecha</th>
            <th className="px-5 py-3">Tipo de Evento</th>
            <th className="px-5 py-3">Ubicación</th>
            <th className="px-5 py-3">Intensidad</th>
            <th className="px-5 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                No se encontraron alertas con los filtros aplicados.
              </td>
            </tr>
          ) : (
            alerts.map((alerta) => {
              const activaEfectiva = isAlertaActiva(alerta);
              return (
                <tr key={alerta.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                      #{alerta.id}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(alerta.fecha).toLocaleString("es-CL")}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                    {alerta.tipo}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {alerta.ubicacion || "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                      {alerta.intensidad}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {activaEfectiva ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        ACTIVA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        ✓ FINALIZADA
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Componente Principal de la Pantalla
export default function HistorialScreen() {
  const [alerts, setAlerts] = useState<SeismicAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIntensidad, setSelectedIntensidad] = useState<string>("todas");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchHistorial = async () => {
    try {
      const response = await fetch(getApiUrl("/api/alertas"));
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar el historial`);
      }
      const data: SeismicAlert[] = await response.json();
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error("Error al obtener historial:", err);
      setError(err.message || "Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
    const interval = setInterval(fetchHistorial, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return alerts.filter((alerta) => {
      const idText = String(alerta.id).toLowerCase();
      const ubicacionText = (alerta.ubicacion || "").toLowerCase();
      const tipoText = (alerta.tipo || "").toLowerCase();
      const intensidadText = String(alerta.intensidad || "").toLowerCase();

      const matchSearch =
        !normalizedSearchTerm ||
        ubicacionText.includes(normalizedSearchTerm) ||
        tipoText.includes(normalizedSearchTerm) ||
        idText.includes(normalizedSearchTerm);

      const matchIntensidad =
        selectedIntensidad === "todas" ||
        intensidadText.includes(selectedIntensidad.toLowerCase());

      const activaEfectiva = isAlertaActiva(alerta);
      const matchEstado =
        selectedEstado === "todos" ||
        (selectedEstado === "activa" && activaEfectiva) ||
        (selectedEstado === "inactiva" && !activaEfectiva);

      const alertDate = new Date(alerta.fecha).getTime();
      const start = startDate ? new Date(startDate).getTime() : null;
      const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

      const matchDate =
        (!start || alertDate >= start) && (!end || alertDate <= end);

      return matchSearch && matchIntensidad && matchEstado && matchDate;
    });
  }, [alerts, searchTerm, selectedIntensidad, selectedEstado, startDate, endDate]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Historial de Alertas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro cronológico de eventos sísmicos (las alertas pasan a estado inactivo tras 1 hora de emitidas)
          </p>
        </div>
        <span className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
          Total: <strong className="text-slate-900 dark:text-white">{filteredAlerts.length}</strong>
        </span>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
        {/* Búsqueda por texto */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por ID, tipo o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro por Estado */}
        <div>
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activa">Activas (&lt; 1 hora)</option>
            <option value="inactiva">Finalizadas (&gt; 1 hora)</option>
          </select>
        </div>

        {/* Filtro por Intensidad */}
        <div>
          <select
            value={selectedIntensidad}
            onChange={(e) => setSelectedIntensidad(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas las Intensidades</option>
            <option value="8.">Mayor a 8.0 Mw</option>
            <option value="7.">Entre 7.0 y 7.9 Mw</option>
            <option value="6.">Entre 6.0 y 6.9 Mw</option>
            <option value="crítica">Crítica / Evacuación</option>
            <option value="moderado">Moderado</option>
          </select>
        </div>

        {/* Filtro por Rango de Fecha */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400 text-xs">a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botón para Limpiar Filtros */}
        {(searchTerm || selectedIntensidad !== "todas" || selectedEstado !== "todos" || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedIntensidad("todas");
              setSelectedEstado("todos");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Mensajes de Estado */}
      {loading && (
        <div className="text-center py-12 text-slate-400 text-sm">
          Cargando historial de alertas...
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Tabla con Alertas Filtradas */}
      {!loading && !error && <HistoryTable alerts={filteredAlerts} />}
    </div>
  );
}
