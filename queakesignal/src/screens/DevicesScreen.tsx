import { CommMode } from "../types";
import StatusDot from "../components/StatusDot.tsx";
import Badge from "../components/Badge.tsx";
import { RadioIcon } from "../components/icons.tsx";

const DEVICES = [
  { id: "Nodo 01", zona: "Centro", online: true, last: "12:40:10", level: 98 },
  { id: "Nodo 02", zona: "Providencia", online: true, last: "12:40:12", level: 95 },
  { id: "Nodo 03", zona: "Las Condes", online: true, last: "12:40:09", level: 91 },
  { id: "Nodo 04", zona: "Pudahuel", online: false, last: "10:15:33", level: 0 },
  { id: "Nodo 05", zona: "Maipú", online: true, last: "12:40:11", level: 87 },
  { id: "Nodo 06", zona: "La Florida", online: true, last: "12:40:13", level: 93 },
  { id: "Nodo 07", zona: "Ñuñoa", online: true, last: "12:40:08", level: 89 },
  { id: "Nodo 08", zona: "Peñalolén", online: true, last: "12:40:14", level: 96 },
  { id: "Nodo 09", zona: "Recoleta", online: true, last: "12:40:07", level: 82 },
  { id: "Nodo 10", zona: "Quilicura", online: true, last: "12:40:15", level: 90 },
  { id: "Nodo 11", zona: "Lo Barnechea", online: true, last: "12:40:06", level: 78 },
  { id: "Nodo 12", zona: "San Bernardo", online: true, last: "12:40:16", level: 94 },
];

export default function DevicesScreen({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900">Dispositivos registrados</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isContingencia ? "11 online vía RF · 1 offline" : "11 online · 1 offline"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isContingencia && (
            <Badge color="orange">
              <RadioIcon size={10} /> Canal RF activo
            </Badge>
          )}
          <Badge color="blue">12 total</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {DEVICES.map((d) => (
          <div
            key={d.id}
            className={`bg-white rounded-xl border shadow-sm p-4 ${
              !d.online ? "border-red-100 bg-red-50/30" : isContingencia ? "border-orange-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusDot color={d.online ? (isContingencia ? "orange" : "green") : "red"} />
                <span className="font-semibold text-sm text-gray-800">{d.id}</span>
              </div>
              <Badge color={d.online ? (isContingencia ? "orange" : "green") : "red"}>
                {d.online ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Zona</span>
                <span className="text-gray-700 font-medium">{d.zona}</span>
              </div>
              {d.online && (
                <div className="flex justify-between">
                  <span>Canal</span>
                  <span className={`font-semibold flex items-center gap-1 ${isContingencia ? "text-orange-600" : "text-blue-600"}`}>
                    <RadioIcon size={10} /> RF
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Última conexión</span>
                <span className="font-mono text-gray-700">{d.last}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Disponibilidad</span>
                <span className="font-mono text-gray-700">{d.level}%</span>
              </div>
              {d.online && (
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full transition-all ${isContingencia ? "bg-orange-400" : "bg-green-500"}`}
                    style={{ width: `${d.level}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
