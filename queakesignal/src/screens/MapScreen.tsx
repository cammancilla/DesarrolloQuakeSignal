import { useState, useEffect } from "react";
import SantiagoMap from "../components/SantiagoMap.tsx";
import { CommMode, Alerta } from "../types";
import { NODOS_SANTIAGO, getCoordenadasAlerta, obtenerNodoMasCercano } from "../utils/geo";
import Badge from "../components/Badge";
import { RadioIcon, AlertTriangleIcon, CpuIcon } from "../components/icons";

interface MapScreenProps {
  mode?: CommMode;
}

const ALERTAS_EJEMPLO: Alerta[] = [
  {
    id: "ALERT-001",
    tipo: "Terremoto",
    intensidad: "Sismo Mayor 7.8 Mw",
    ubicacion: "Santiago Centro, Chile",
    fecha: "2026-09-27T15:00:00Z",
    activa: true,
    despachada: true,
    lat: -33.4429,
    lng: -70.6539,
    radioKm: 20,
  },
  {
    id: "ALERT-002",
    tipo: "Incendio Forestal",
    intensidad: "Alerta Roja — Foco Activo",
    ubicacion: "Viña del Mar, Chile",
    fecha: "2026-09-27T14:30:00Z",
    activa: true,
    despachada: true,
    lat: -33.0245,
    lng: -71.5518,
    radioKm: 14,
  },
  {
    id: "ALERT-003",
    tipo: "Aluvión",
    intensidad: "Alto Riesgo — Desborde",
    ubicacion: "San José de Maipo, Chile",
    fecha: "2026-09-27T12:15:00Z",
    activa: true,
    despachada: true,
    lat: -33.6389,
    lng: -70.3503,
    radioKm: 12,
  },
];

export default function MapScreen({ mode: modeProp }: MapScreenProps) {
  const [internalMode, setInternalMode] = useState<CommMode>("normal");
  const mode = modeProp || internalMode;

  const [alertas, setAlertas] = useState<Alerta[]>(ALERTAS_EJEMPLO);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alerta>(ALERTAS_EJEMPLO[0]);

  // Intentar cargar alertas vivas del backend si está encendido
  useEffect(() => {
    const fetchBackendAlertas = async () => {
      try {
        const res = await fetch("https://quakesignal.duckdns.org/api/alertas");
        if (res.ok) {
          const data = await res.json();
          const lista = Array.isArray(data) ? data : data.alertas;
          if (Array.isArray(lista) && lista.length > 0) {
            setAlertas(lista);
            const activa = lista.find((a: Alerta) => a.activa) || lista[0];
            setAlertaSeleccionada(activa);
          }
        }
      } catch {
        // Backend no disponible, se usan alertas dummy con geocodes precisos
      }
    };

    fetchBackendAlertas();
  }, []);

  const isContingencia = mode === "contingencia";
  const geo = getCoordenadasAlerta(alertaSeleccionada);
  const proximidad = obtenerNodoMasCercano(geo.lat, geo.lng, NODOS_SANTIAGO);
  const nodosOnline = NODOS_SANTIAGO.filter((n) => n.online).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Cabecera y Resumen de Proximidad */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                  Centro Geográfico de Cobertura y Nodos IoT
                </h1>
                <Badge color={isContingencia ? "orange" : "blue"}>
                  {isContingencia ? "Canal RF Activo" : "Red Mixta (IP/RF)"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Monitoreo espacial en tiempo real de nodos de telecomunicación y epicentros de emergencia
              </p>
            </div>

            {/* Selector de Modo */}
            {!modeProp && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setInternalMode("normal")}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    mode === "normal"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  🟢 Modo Normal
                </button>
                <button
                  onClick={() => setInternalMode("contingencia")}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    mode === "contingencia"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  🟠 Modo Contingencia (RF)
                </button>
              </div>
            )}
          </div>

          {/* Tarjetas métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <div className="text-slate-400 dark:text-slate-400 font-medium">Alerta Activa Foco</div>
              <div className="text-slate-800 dark:text-white font-bold text-sm mt-0.5 flex items-center gap-1.5">
                <AlertTriangleIcon size={16} />
                <span className="truncate">{alertaSeleccionada.tipo}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {alertaSeleccionada.ubicacion}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <div className="text-slate-400 dark:text-slate-400 font-medium">Coordenadas Exactas</div>
              <div className="text-slate-800 dark:text-white font-bold font-mono text-sm mt-0.5">
                {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Radio de alerta: ~{geo.radioKm} km
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <div className="text-slate-400 dark:text-slate-400 font-medium">Nodo Más Próximo</div>
              <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm mt-0.5">
                {proximidad ? proximidad.nodo.id : "N/A"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {proximidad ? `A solo ${proximidad.distanciaKm} km del foco` : "-"}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
              <div className="text-slate-400 dark:text-slate-400 font-medium">Estado Red IoT</div>
              <div className="text-slate-800 dark:text-white font-bold text-sm mt-0.5 flex items-center gap-1">
                <CpuIcon size={16} />
                <span>{nodosOnline} de {NODOS_SANTIAGO.length} Online</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isContingencia ? "Cobertura de rescate RF activada" : "Enlace IP estándar disponible"}
              </div>
            </div>
          </div>

          {/* Selector de Alertas Disponibles */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Seleccionar Alerta a enfocar en el mapa:
            </span>
            {alertas.slice(0, 5).map((a) => (
              <button
                key={a.id}
                onClick={() => setAlertaSeleccionada(a)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                  alertaSeleccionada.id === a.id
                    ? "bg-red-50 dark:bg-rose-950/60 text-red-700 dark:text-rose-300 border-red-300 dark:border-rose-700 ring-2 ring-red-200 dark:ring-rose-800 shadow-xs font-semibold"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                🔴 {a.tipo} — {a.ubicacion.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Mapa Leaflet interactivo optimizado */}
        <div className="w-full">
          <SantiagoMap
            compact={false}
            mode={mode}
            alerta={alertaSeleccionada}
            alertas={alertas}
            height="580px"
          />
        </div>
      </div>
    </div>
  );
}