import Badge from "./Badge";

const HISTORY = [
  { dt: "25/08/2025 12:40:15", tipo: "Terremoto", int: "Moderado", estado: "Activa", canales: "Telegram + IoT" },
  { dt: "24/08/2025 08:15:22", tipo: "Lluvia intensa", int: "Leve", estado: "Finalizada", canales: "Telegram" },
  { dt: "23/08/2025 16:30:10", tipo: "Viento fuerte", int: "Leve", estado: "Finalizada", canales: "Telegram + IoT" },
  { dt: "22/08/2025 09:05:44", tipo: "Terremoto", int: "Leve", estado: "Finalizada", canales: "Telegram + IoT" },
  { dt: "20/08/2025 14:22:33", tipo: "Lluvia intensa", int: "Moderado", estado: "Finalizada", canales: "Telegram" },
];

export default function HistoryTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Historial de Alertas</h3>
        <span className="text-xs text-gray-400 font-mono">{HISTORY.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              {["Fecha y hora", "Tipo", "Intensidad", "Estado", "Canales"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{row.dt}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{row.tipo}</td>
                <td className="px-5 py-3">
                  <Badge color={row.int === "Moderado" ? "yellow" : "gray"}>{row.int}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge color={row.estado === "Activa" ? "red" : "green"}>
                    {row.estado === "Activa" ? "● " : "✓ "}{row.estado}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{row.canales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
