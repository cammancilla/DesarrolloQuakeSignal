import { useState, useEffect } from "react";
import { CommMode } from "../types";
import StatusDot from "./StatusDot.tsx";
import { BellIcon } from "./icons.tsx";

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

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <StatusDot color="green" />
          <span className="text-sm text-gray-600 font-medium">Sistema Operativo</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
            mode === "normal"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-orange-50 border-orange-200 text-orange-700"
          }`}
        >
          <StatusDot color={mode === "normal" ? "green" : "orange"} />
          {mode === "normal" ? "Modo Normal" : "Modo Contingencia"}
        </div>
        <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
          <span>{timeStr}</span>
          <span className="text-gray-300">|</span>
          <span>{dateStr}</span>
        </div>
        <button
          className="relative w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          onClick={onAlert}
        >
          <BellIcon size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
