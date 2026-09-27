import { useState, useEffect } from "react";
import { CommMode, NodoIoT } from "../types";
import StatusDot from "../components/StatusDot.tsx";
import Badge from "../components/Badge.tsx";
import { RadioIcon } from "../components/icons.tsx";
import { NODOS_SANTIAGO } from "../utils/geo";

export default function DevicesScreen({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  const [nodos, setNodos] = useState<NodoIoT[]>(NODOS_SANTIAGO);

  // Consultar al backend si está levantado para actualizar en tiempo real
  useEffect(() => {
    const fetchNodos = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/nodos/status");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.detalle) && data.detalle.length > 0) {
            // Mapear con datos de geolocalización
            const actualizados = data.detalle.map((d: any) => {
              const base = NODOS_SANTIAGO.find((n) => n.id === d.id);
              return {
                id: d.id,
                zona: d.zona || base?.zona || "Sector Central",
                ubicacion: d.ubicacion || base?.ubicacion || "Ubicación asignada",
                online: d.status === "online",
                last: d.lastPing ? new Date(d.lastPing).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : (base?.last || "12:40:10"),
                level: base?.level || (d.status === "online" ? 95 : 0),
                lat: d.lat || base?.lat || -33.4429,
                lng: d.lng || base?.lng || -70.6539,
              };
            });
            setNodos(actualizados);
          }
        }
      } catch {
        // Usa los 12 nodos por defecto de NODOS_SANTIAGO
      }
    };

    fetchNodos();
    const interval = setInterval(fetchNodos, 5000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = nodos.filter((n) => n.online).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">Dispositivos y Nodos IoT</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isContingencia
              ? `${onlineCount} online vía RF · ${nodos.length - onlineCount} offline`
              : `${onlineCount} online · ${nodos.length - onlineCount} offline`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isContingencia && (
            <Badge color="orange">
              <RadioIcon size={10} /> Canal RF activo
            </Badge>
          )}
          <Badge color="blue">{nodos.length} total registrados</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodos.map((d) => (
          <div
            key={d.id}
            className={`bg-white rounded-xl border shadow-sm p-4 ${
              !d.online
                ? "border-red-100 bg-red-50/30"
                : isContingencia
                ? "border-orange-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusDot color={d.online ? (isContingencia ? "orange" : "green") : "red"} />
                <span className="font-semibold text-sm text-gray-800">{d.id}</span>
              </div>
              <Badge color={d.online ? (isContingencia ? "orange" : "green") : "red"}>
                {d.online ? (isContingencia ? "RF ONLINE" : "ONLINE") : "OFFLINE"}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Zona</span>
                <span className="text-gray-700 font-medium">{d.zona}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordenadas</span>
                <span className="font-mono text-gray-600 text-[11px]">
                  {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                </span>
              </div>
              {d.online && (
                <div className="flex justify-between">
                  <span>Canal</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isContingencia ? "text-orange-600" : "text-blue-600"
                    }`}
                  >
                    <RadioIcon size={10} /> RF
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Último reporte</span>
                <span className="font-mono text-gray-700">{d.last || "En línea"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Disponibilidad</span>
                <span className="font-mono text-gray-700">{d.level}%</span>
              </div>
              {d.online && (
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      isContingencia ? "bg-orange-400" : "bg-green-500"
                    }`}
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
