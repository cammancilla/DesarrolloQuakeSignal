import React, { useState, useEffect, useMemo } from "react";

type SeismicAlert = {
  id: number | string;
  fecha: string;
  tipo: string;
  ubicacion: string;
  intensidad: string | number;
  activa: boolean;
};

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

  // Función para consultar las alertas desde la API Node.js
  const fetchHistorial = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/alertas");
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

  // Lógica de filtrado en tiempo real usando useMemo
  const filteredAlerts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return alerts.filter((alerta) => {
      const idText = String(alerta.id).toLowerCase();
      const ubicacionText = alerta.ubicacion.toLowerCase();
      const tipoText = alerta.tipo.toLowerCase();
      const intensidadText = String(alerta.intensidad).toLowerCase();

      // 1. Búsqueda por texto (Ubicación, Tipo o ID)
      const matchSearch =
        !normalizedSearchTerm ||
        ubicacionText.includes(normalizedSearchTerm) ||
        tipoText.includes(normalizedSearchTerm) ||
        idText.includes(normalizedSearchTerm);

      // 2. Filtro por Intensidad
      const matchIntensidad =
        selectedIntensidad === "todas" ||
        intensidadText.includes(selectedIntensidad.toLowerCase());

      // 3. Filtro por Estado (Activa / Inactiva)
      const matchEstado =
        selectedEstado === "todos" ||
        (selectedEstado === "activa" && alerta.activa) ||
        (selectedEstado === "inactiva" && !alerta.activa);

      // 4. Filtro por Rango de Fechas
      const alertDate = new Date(alerta.fecha).getTime();
      const start = startDate ? new Date(startDate).getTime() : null;
      const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

      const matchDate =
        (!start || alertDate >= start) && (!end || alertDate <= end);

      return matchSearch && matchIntensidad && matchEstado && matchDate;
    });
  }, [alerts, searchTerm, selectedIntensidad, selectedEstado, startDate, endDate]);

  // Limpiar todos los filtros
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedIntensidad("todas");
    setSelectedEstado("todos");
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-500">
        Cargando historial de alertas...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-8 flex-1 overflow-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Historial de Alertas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro cronológico y filtrado de todas las alertas emitidas
          </p>
        </div>
        <button
          onClick={fetchHistorial}
          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* 🔍 Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mb-6 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Buscar por texto */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500">Búsqueda</label>
            <input
              type="text"
              placeholder="Ubicación, tipo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500">Estado</label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activa">Solo Activas</option>
              <option value="inactiva">Solo Inactivas</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Botón Limpiar */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Mostrando <b>{filteredAlerts.length}</b> de <b>{alerts.length}</b> alertas registradas.
        </div>
      </div>

      {/* Tabla de Resultados */}
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
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No se encontraron alertas con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                      {alerta.id}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(alerta.fecha).toLocaleString("es-CL")}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                    {alerta.tipo}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {alerta.ubicacion}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-semibold text-[11px]">
                      {alerta.intensidad}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {alerta.activa ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ACTIVA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        INACTIVA
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}