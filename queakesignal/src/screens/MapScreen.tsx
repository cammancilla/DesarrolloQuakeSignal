import { useState } from "react";
import SantiagoMap, { MapLegend } from "../components/SantiagoMap.tsx";

type CommMode = "normal" | "contingencia";

export default function MapScreen() {
  const [mode, setMode] = useState<CommMode>("normal");

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Mapa de Cobertura - Santiago</h2>
          
          {/* Selector de Modo */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setMode("normal")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                mode === "normal"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Modo Normal
            </button>
            <button
              onClick={() => setMode("contingencia")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                mode === "contingencia"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Modo Contingencia (RF)
            </button>
          </div>
        </div>

        {/* Componente del Mapa */}
        <div className="w-full">
          <SantiagoMap compact={false} mode={mode} />
          <MapLegend mode={mode} />
        </div>
      </div>
    </div>
  );
}