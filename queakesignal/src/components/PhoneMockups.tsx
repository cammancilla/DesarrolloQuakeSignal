import StatusDot from "./StatusDot.tsx";
import { WifiIcon, BellIcon } from "./icons";

export function PhoneNotification() {
  return (
    <div className="mx-auto" style={{ width: 200 }}>
      <div className="rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl" style={{ background: "#1c1c1e" }}>
        <div className="flex justify-between items-center px-4 pt-2 pb-1">
          <span className="text-white text-[9px] font-semibold">9:41</span>
          <div className="flex gap-1 items-center">
            <WifiIcon size={8} />
            <span className="text-white text-[9px]">●●●</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#2a2a2e" }}>
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
            <BellIcon size={11} />
          </div>
          <div>
            <div className="text-white text-[10px] font-semibold">Sistema de Alertas</div>
            <div className="text-green-400 text-[8px]">en línea</div>
          </div>
        </div>
        <div className="px-3 py-3 space-y-3" style={{ background: "#121212" }}>
          <div className="bg-red-950/60 border border-red-700/50 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-red-400 text-[10px]">🔴</span>
              <span className="text-red-300 text-[10px] font-bold tracking-wide">ALERTA ACTIVA</span>
            </div>
            <div className="text-white text-[11px] font-semibold mb-1">Terremoto Moderado</div>
            <div className="text-gray-300 text-[9px] space-y-0.5">
              <div>Intensidad: <span className="text-white font-medium">Moderado</span></div>
              <div>Zona: <span className="text-white font-medium">Santiago, Chile</span></div>
              <div className="font-mono">Fecha: 25/08/2025</div>
              <div className="font-mono">Hora: 12:40:15</div>
            </div>
            <p className="text-gray-400 text-[8px] mt-2 leading-relaxed">Manténgase informado mediante nuestros canales oficiales.</p>
            <div className="flex gap-1.5 mt-2">
              <button className="bg-red-600 text-white text-[8px] font-medium px-2 py-1 rounded-md flex-1">Ver detalles</button>
              <button className="bg-white/10 text-white text-[8px] font-medium px-2 py-1 rounded-md flex-1">Mapa</button>
            </div>
          </div>
          <div className="text-center text-gray-600 text-[8px]">25/08/2025 · 12:40</div>
        </div>
      </div>
    </div>
  );
}

export function PhoneStatus() {
  return (
    <div className="mx-auto" style={{ width: 200 }}>
      <div className="rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl" style={{ background: "#f8fafc" }}>
        <div className="flex justify-between items-center px-4 pt-2 pb-1" style={{ background: "#0f1b35" }}>
          <span className="text-white text-[9px] font-semibold">9:41</span>
          <div className="flex gap-1 items-center text-white">
            <WifiIcon size={8} />
            <span className="text-[9px]">●●●</span>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3" style={{ background: "#0f1b35" }}>
          <div className="text-white text-xs font-bold">Sistema de Alertas</div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <StatusDot color="green" />
              <span className="text-white text-[11px] font-semibold">Sistema Operativo</span>
            </div>
            <div className="text-gray-300 text-[9px] mb-2">Última alerta:</div>
            <div className="bg-red-900/40 border border-red-600/40 rounded-lg px-2.5 py-1.5 mb-3">
              <div className="text-red-300 text-[9px] font-semibold">● Terremoto — Moderado</div>
              <div className="text-gray-400 text-[8px] font-mono">25/08/2025 12:40:15</div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Telegram conectado", ok: true },
                { label: "IoT conectado", ok: true },
                { label: "Estado del sistema OK", ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`text-[9px] ${ok ? "text-green-400" : "text-red-400"}`}>{ok ? "🟢" : "🔴"}</span>
                  <span className="text-white text-[9px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
