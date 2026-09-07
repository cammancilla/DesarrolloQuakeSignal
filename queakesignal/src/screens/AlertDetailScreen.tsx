import { CommMode } from "../types";
import SantiagoMap, { MapLegend } from "../components/SantiagoMap.tsx";
import Badge from "../components/Badge.tsx";
import { AlertTriangleIcon, ZapIcon, SendIcon, RadioIcon } from "../components/icons.tsx";

export default function AlertDetailScreen({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4">
      {/* Banner */}
      <div className="bg-red-600 rounded-xl p-5 flex items-center justify-between text-white shadow-lg shadow-red-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <AlertTriangleIcon size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded">ACTIVA</span>
              {isContingencia && (
                <span className="bg-orange-400/80 text-white text-xs font-semibold px-2 py-0.5 rounded">VÍA RF</span>
              )}
            </div>
            <div className="text-white font-bold text-lg mt-0.5">Terremoto — Moderado</div>
          </div>
        </div>
        <div className="text-right font-mono text-sm opacity-80">
          <div>25/08/2025</div>
          <div className="text-base font-semibold">12:40:15</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Información del Evento */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <ZapIcon size={14} />
            Información del Evento
          </h3>
          <div className="space-y-3">
            {[
              { label: "Tipo de alerta", value: "Terremoto" },
              { label: "Intensidad", value: "Moderado" },
              { label: "Fecha y hora", value: "25/08/2025 — 12:40:15", mono: true },
              { label: "Fuente de datos", value: "API externa" },
              { label: "Ubicación", value: "Santiago, Chile" },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-start justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <span className="text-xs text-gray-400 pt-0.5">{label}</span>
                <span className={`text-sm font-medium text-gray-800 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2">
              <span className="text-xs text-gray-400">Descripción</span>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                Evento recibido desde la fuente de datos y preparado para distribución.
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Difusión */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <SendIcon size={14} />
            Estado de Difusión
          </h3>
          <div className="space-y-3">
            {isContingencia ? (
              <>
                {[
                  { channel: "Telegram", status: "No disponible", detail: "Sin conexión a Internet", icon: "💬", ok: false },
                  { channel: "MQTT / Internet", status: "No disponible", detail: "Sin conexión a Internet", icon: "🌐", ok: false },
                ].map(({ channel, status, detail, icon }) => (
                  <div key={channel} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{channel}</span>
                        <Badge color="red">🔴 {status}</Badge>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{detail}</div>
                    </div>
                  </div>
                ))}
                {[
                  { channel: "Comunicación RF", status: "Operativa", detail: "Distribución activa — canal independiente", icon: "📡" },
                  { channel: "Dispositivos", status: "11/12 recibieron", detail: "Estado de recepción: 91.7%", icon: "🔌" },
                ].map(({ channel, status, detail, icon }) => (
                  <div key={channel} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{channel}</span>
                        <Badge color="green">🟢 {status}</Badge>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{detail}</div>
                    </div>
                  </div>
                ))}
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                    El sistema opera en modo contingencia. La alerta está siendo distribuida a través del canal RF independiente de Internet.
                  </p>
                </div>
              </>
            ) : (
              [
                { channel: "Telegram", status: "Enviado", detail: "Hora de envío: 12:40:18", icon: "💬" },
                { channel: "MQTT / IoT", status: "Enviado", detail: "Hora de publicación: 12:40:17", icon: "📡" },
                { channel: "Comunicación RF", status: "Operativa", detail: "Estado de distribución: Activo", icon: "📡" },
                { channel: "Dispositivos", status: "12/12 Online", detail: "Estado de recepción: Completo", icon: "🔌" },
                { channel: "Teléfonos", status: "248 notificados", detail: "Estado de distribución: Completo", icon: "📱" },
              ].map(({ channel, status, detail, icon }) => (
                <div key={channel} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{channel}</span>
                      <Badge color="green">🟢 {status}</Badge>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{detail}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Cobertura de distribución</h3>
        <SantiagoMap mode={mode} />
        <MapLegend mode={mode} />
      </div>
    </div>
  );
}
