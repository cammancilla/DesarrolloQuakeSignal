import { CommMode } from "../types";
import StatusDot from "./StatusDot.tsx";
import { RadioIcon, WifiIcon, WifiOffIcon, CpuIcon } from "./icons.tsx";

export default function CommStatusCard({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-5 transition-colors ${
        isContingencia ? "border-orange-200 dark:border-orange-800/60" : "border-gray-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <span className={isContingencia ? "text-orange-500" : "text-blue-500"}>
            <RadioIcon size={14} />
          </span>
          Estado de Comunicaciones
        </h3>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono tracking-wide ${
            isContingencia
              ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
              : "bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-green-200 dark:border-emerald-800"
          }`}
        >
          MODO: {isContingencia ? "CONTINGENCIA" : "NORMAL"}
        </span>
      </div>

      <div className="space-y-2">
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg ${
            isContingencia ? "bg-red-50 dark:bg-rose-950/40" : "bg-gray-50 dark:bg-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-2">
            {isContingencia ? <WifiOffIcon size={13} /> : <WifiIcon size={13} />}
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Internet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot color={isContingencia ? "red" : "green"} />
            <span
              className={`text-xs font-mono font-semibold ${
                isContingencia ? "text-red-600 dark:text-rose-400" : "text-green-600 dark:text-emerald-400"
              }`}
            >
              {isContingencia ? "No disponible" : "Disponible"}
            </span>
          </div>
        </div>

        {isContingencia && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 dark:bg-rose-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xs">💬</span>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Telegram</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot color="red" />
              <span className="text-xs font-mono font-semibold text-red-600 dark:text-rose-400">No disponible</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <RadioIcon size={13} />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Canal RF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot color="green" />
            <span className="text-xs font-mono font-semibold text-green-600 dark:text-emerald-400">Operativo</span>
          </div>
        </div>

        {isContingencia && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2">
              <CpuIcon size={13} />
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Nodos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot color="green" />
              <span className="text-xs font-mono font-semibold text-green-600 dark:text-emerald-400">11/12 disponibles</span>
            </div>
          </div>
        )}
      </div>

      {isContingencia && (
        <p className="text-[10px] text-orange-600 dark:text-orange-300 mt-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-md px-2.5 py-1.5 leading-relaxed">
          Distribución de alertas activa vía canal RF independiente. El sistema continúa operativo.
        </p>
      )}
    </div>
  );
}
