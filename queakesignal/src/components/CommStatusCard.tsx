import { CommMode } from "../types";
import StatusDot from "./StatusDot.tsx";
import { RadioIcon, WifiIcon, WifiOffIcon, CpuIcon } from "./icons.tsx";



export default function CommStatusCard({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${isContingencia ? "border-orange-200" : "border-gray-200"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span className={isContingencia ? "text-orange-500" : "text-blue-500"}>
            <RadioIcon size={14} />
          </span>
          Estado de Comunicaciones
        </h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono tracking-wide ${
          isContingencia
            ? "bg-orange-100 text-orange-700 border border-orange-200"
            : "bg-green-100 text-green-700 border border-green-200"
        }`}>
          MODO: {isContingencia ? "CONTINGENCIA" : "NORMAL"}
        </span>
      </div>

      <div className="space-y-2">
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${isContingencia ? "bg-red-50" : "bg-gray-50"}`}>
          <div className="flex items-center gap-2">
            {isContingencia ? <WifiOffIcon size={13} /> : <WifiIcon size={13} />}
            <span className="text-xs font-medium text-gray-700">Internet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot color={isContingencia ? "red" : "green"} />
            <span className={`text-xs font-mono font-semibold ${isContingencia ? "text-red-600" : "text-green-600"}`}>
              {isContingencia ? "No disponible" : "Disponible"}
            </span>
          </div>
        </div>

        {isContingencia && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50">
            <div className="flex items-center gap-2">
              <span className="text-xs">💬</span>
              <span className="text-xs font-medium text-gray-700">Telegram</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot color="red" />
              <span className="text-xs font-mono font-semibold text-red-600">No disponible</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50">
          <div className="flex items-center gap-2">
            <RadioIcon size={13} />
            <span className="text-xs font-medium text-gray-700">Canal RF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot color="green" />
            <span className="text-xs font-mono font-semibold text-green-600">Operativo</span>
          </div>
        </div>

        {isContingencia && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <CpuIcon size={13} />
              <span className="text-xs font-medium text-gray-700">Nodos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot color="green" />
              <span className="text-xs font-mono font-semibold text-green-600">11/12 disponibles</span>
            </div>
          </div>
        )}
      </div>

      {isContingencia && (
        <p className="text-[10px] text-orange-600 mt-2.5 bg-orange-50 border border-orange-100 rounded-md px-2.5 py-1.5 leading-relaxed">
          Distribución de alertas activa vía canal RF independiente. El sistema continúa operativo.
        </p>
      )}
    </div>
  );
}
