import { useState, useEffect } from "react";
import { CommMode } from "../types";
import StatusDot from "./StatusDot.tsx";
import { BellIcon } from "./icons.tsx";
import { useConfig } from "../context/ConfigContext";

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Header({
  title,
  onAlert,
  mode,
}: {
  title: string;
  onAlert?: () => void;
  mode: CommMode;
}) {
  const now = useTime();
  const timeStr = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  const { isDark, setTheme } = useConfig();

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {isDark && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            🌙 Modo Nocturno
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <StatusDot color="green" />
          <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">Sistema Operativo</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
            mode === "normal"
              ? "bg-green-50 dark:bg-emerald-950/50 border-green-200 dark:border-emerald-800 text-green-700 dark:text-emerald-300"
              : "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
          }`}
        >
          <StatusDot color={mode === "normal" ? "green" : "orange"} />
          {mode === "normal" ? "Modo Normal" : "Modo Contingencia"}
        </div>
        <div className="flex items-center gap-2 text-sm font-mono text-gray-500 dark:text-slate-400">
          <span>{timeStr}</span>
          <span className="text-gray-300 dark:text-slate-600">|</span>
          <span>{dateStr}</span>
        </div>

        {/* Botón rápido de cambio de tema Claro / Oscuro */}
        <button
          onClick={() => setTheme(isDark ? "claro" : "oscuro")}
          title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs text-gray-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>{isDark ? "☀️" : "🌙"}</span>
          <span className="hidden sm:inline font-medium text-[11px]">
            {isDark ? "Claro" : "Oscuro"}
          </span>
        </button>

        <button
          className="relative w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 transition-colors cursor-pointer"
          onClick={onAlert}
          title="Ver Alerta Activa"
        >
          <BellIcon size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
