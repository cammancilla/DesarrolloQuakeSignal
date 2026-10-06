import Badge from "./Badge";
import { SeismicAlert } from "../types/types";

interface HistoryTableProps {
  alerts?: SeismicAlert[];
}

export default function HistoryTable({ alerts = [] }: HistoryTableProps) {
  const formatFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return fechaStr;
      return d.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return fechaStr;
    }
  };

  const getIntensidadColor = (intensidad: string) => {
    const lower = (intensidad || "").toLowerCase();
    if (
      lower.includes("crítica") ||
      lower.includes("critica") ||
      lower.includes("roja") ||
      lower.includes("evacuación") ||
      lower.includes("evacuacion") ||
      lower.includes("8.") ||
      lower.includes("7.")
    ) {
      return "red";
    }
    if (
      lower.includes("moderado") ||
      lower.includes("amarill") ||
      lower.includes("alto") ||
      lower.includes("riesgo") ||
      lower.includes("6.")
    ) {
      return "yellow";
    }
    if (lower.includes("leve") || lower.includes("verde") || lower.includes("bajo")) {
      return "green";
    }
    return "blue";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Últimas Alertas Registradas</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Eventos en tiempo real sincronizados con el backend</p>
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">
          {alerts.length} {alerts.length === 1 ? "registro" : "registros"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/80 text-left">
              {["ID / Fecha y hora", "Tipo", "Ubicación", "Intensidad", "Estado", "Canales"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                  No hay alertas registradas en el sistema.
                </td>
              </tr>
            ) : (
              alerts.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="font-mono font-bold text-gray-800 dark:text-slate-200 text-xs block">
                      #{row.id}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400 dark:text-slate-500">
                      {formatFecha(row.fecha)}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-slate-200">
                    {row.tipo}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 dark:text-slate-400 truncate max-w-[180px]">
                    {row.ubicacion || "Chile"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={getIntensidadColor(row.intensidad)}>
                      {row.intensidad}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={row.activa ? "red" : "gray"}>
                      {row.activa ? "● Activa" : "✓ Finalizada"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 dark:text-slate-400">
                    {row.despachada ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">Telegram + MQTT ✓</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">En cola de despacho</span>
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
