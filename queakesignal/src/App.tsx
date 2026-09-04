import { useState, useEffect } from "react";

type Screen = "dashboard" | "detail" | "devices" | "historial" | "mapa";
type CommMode = "normal" | "contingencia";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "alertas", label: "Alertas", icon: BellIcon },
  { id: "mapa", label: "Mapa", icon: MapIcon },
  { id: "devices", label: "Dispositivos", icon: CpuIcon },
  { id: "historial", label: "Historial", icon: ClockIcon },
  { id: "configuracion", label: "Configuración", icon: GearIcon },
  { id: "usuarios", label: "Usuarios", icon: UsersIcon },
];

function GridIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function MapIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function CpuIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}
function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function GearIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function AlertTriangleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function ActivityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function WifiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}
function WifiOffIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}
function SendIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function RadioIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}
function ZapIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ExternalLinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function StatusDot({ color }: { color: "green" | "red" | "yellow" | "gray" | "orange" }) {
  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  };
  const glow: Record<string, string> = {
    green: "shadow-[0_0_6px_rgba(34,197,94,0.7)]",
    red: "shadow-[0_0_6px_rgba(239,68,68,0.8)]",
    orange: "shadow-[0_0_6px_rgba(249,115,22,0.7)]",
    yellow: "",
    gray: "",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[color]} ${glow[color]}`} />
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    red: "bg-red-100 text-red-700 border border-red-200",
    green: "bg-green-100 text-green-700 border border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border border-orange-200",
    gray: "bg-gray-100 text-gray-500 border border-gray-200",
    blue: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium font-mono ${styles[color]}`}>
      {children}
    </span>
  );
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#0f1b35" }}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#dc2626" }}>
            <BellIcon size={16} />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Sistema de</div>
            <div className="text-white font-semibold text-sm leading-tight">Alertas</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const clickable = ["dashboard", "devices", "historial", "mapa"].includes(id);
          return (
            <button
              key={id}
              onClick={() => clickable && onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/50 hover:text-white/80 hover:bg-white/8"
              }`}
            >
              <span className={isActive ? "text-white" : "text-white/40"}>
                <Icon size={16} />
              </span>
              {label}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">A</div>
          <div>
            <div className="text-white text-xs font-medium">Administrador</div>
            <div className="flex items-center gap-1 mt-0.5">
              <StatusDot color="green" />
              <span className="text-white/40 text-[10px]">Sesión activa</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ title, onAlert, mode }: { title: string; onAlert?: () => void; mode: CommMode }) {
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

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "green" | "red" | "blue" | "gray";
}) {
  const accentMap = {
    green: { bg: "bg-green-50", icon: "text-green-600", val: "text-green-700" },
    red: { bg: "bg-red-50", icon: "text-red-600", val: "text-red-700" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", val: "text-blue-700" },
    gray: { bg: "bg-gray-50", icon: "text-gray-500", val: "text-gray-700" },
  };
  const c = accentMap[accent];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
        <div className={`text-2xl font-bold font-mono ${c.val} mt-0.5`}>{value}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function CommStatusCard({ mode }: { mode: CommMode }) {
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

function SantiagoMap({ compact = false, mode = "normal" }: { compact?: boolean; mode?: CommMode }) {
  const rfActive = mode === "contingencia";
  const nodes = [
    { x: 52, y: 38, online: true },
    { x: 68, y: 25, online: true },
    { x: 80, y: 48, online: true },
    { x: 42, y: 55, online: true },
    { x: 60, y: 60, online: false },
    { x: 72, y: 68, online: true },
    { x: 35, y: 72, online: true },
    { x: 58, y: 78, online: true },
  ];
  return (
    <div className="relative w-full" style={{ paddingBottom: compact ? "62%" : "58%" }}>
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
        style={{ background: "#1e293b" }}
      >
        {[20, 40, 60, 80].map((v) => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={80} stroke="#334155" strokeWidth="0.3" />
            <line x1={0} y1={v} x2={100} y2={v} stroke="#334155" strokeWidth="0.3" />
          </g>
        ))}
        <path
          d="M25,15 L35,10 L55,12 L72,18 L85,30 L88,45 L82,60 L70,72 L55,78 L38,75 L25,65 L18,50 L20,32 Z"
          fill="#1e3a5f" stroke="#2563eb" strokeWidth="0.6" opacity="0.7"
        />
        <path d="M35,30 L55,28 L60,42 L45,50 L32,45 Z" fill="#1d4ed8" opacity="0.25" />
        <path d="M55,28 L72,30 L75,48 L60,42 Z" fill="#1d4ed8" opacity="0.15" />
        <line x1={20} y1={42} x2={85} y2={42} stroke="#475569" strokeWidth="0.5" />
        <line x1={50} y1={10} x2={52} y2={78} stroke="#475569" strokeWidth="0.5" />
        <circle cx={60} cy={42} r={10} fill="#ef4444" opacity="0.12">
          <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.18;0.04;0.18" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={60} cy={42} r={3} fill="#ef4444" />
        <circle cx={60} cy={42} r={1.5} fill="white" />
        {nodes.filter((n) => n.online).map((n, i) => (
          <circle
            key={i}
            cx={n.x} cy={n.y}
            r={rfActive ? 9 : 7}
            fill="none"
            stroke={rfActive ? "#f97316" : "#22c55e"}
            strokeWidth={rfActive ? "0.6" : "0.4"}
            opacity={rfActive ? 0.5 : 0.35}
            strokeDasharray="1.5 1"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            {n.online && <circle cx={n.x} cy={n.y} r={4} fill={rfActive ? "#f97316" : "#22c55e"} opacity="0.15" />}
            <circle cx={n.x} cy={n.y} r={1.8} fill={n.online ? (rfActive ? "#f97316" : "#22c55e") : "#6b7280"} />
            <circle cx={n.x} cy={n.y} r={0.8} fill="white" />
          </g>
        ))}
        <text x={44} y={40} fontSize="3" fill="#94a3b8">Santiago Centro</text>
        <text x={62} y={35} fontSize="2.5" fill="#94a3b8">Providencia</text>
        <text x={28} y={60} fontSize="2.5" fill="#94a3b8">Pudahuel</text>
        <text x={64} y={65} fontSize="2.5" fill="#94a3b8">La Florida</text>
      </svg>
    </div>
  );
}

const HISTORY = [
  { dt: "25/08/2025 12:40:15", tipo: "Terremoto", int: "Moderado", estado: "Activa", canales: "Telegram + IoT" },
  { dt: "24/08/2025 08:15:22", tipo: "Lluvia intensa", int: "Leve", estado: "Finalizada", canales: "Telegram" },
  { dt: "23/08/2025 16:30:10", tipo: "Viento fuerte", int: "Leve", estado: "Finalizada", canales: "Telegram + IoT" },
  { dt: "22/08/2025 09:05:44", tipo: "Terremoto", int: "Leve", estado: "Finalizada", canales: "Telegram + IoT" },
  { dt: "20/08/2025 14:22:33", tipo: "Lluvia intensa", int: "Moderado", estado: "Finalizada", canales: "Telegram" },
];

function HistoryTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Historial de Alertas</h3>
        <span className="text-xs text-gray-400 font-mono">{HISTORY.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha y hora</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Intensidad</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Canales</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{row.dt}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{row.tipo}</td>
                <td className="px-4 py-3">
                  <Badge color={row.int === "Moderado" ? "yellow" : "gray"}>{row.int}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge color={row.estado === "Activa" ? "red" : "green"}>
                    {row.estado === "Activa" ? "● " : "✓ "}{row.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{row.canales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PhoneNotification() {
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

function PhoneStatus() {
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

function DashboardScreen({ onViewDetail, mode }: { onViewDetail: () => void; mode: CommMode }) {
  const [panicPressed, setPanicPressed] = useState(false);
  const isContingencia = mode === "contingencia";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<ActivityIcon />} label="Estado General" value="Normal" sub="Sistema funcionando correctamente" accent="green" />
        <StatCard icon={<AlertTriangleIcon />} label="Alertas Activas" value="1" sub="Requiere atención" accent="red" />
        <StatCard icon={<CpuIcon />} label="Nodos IoT" value={isContingencia ? "11" : "12"} sub={isContingencia ? "11/12 Online" : "Online"} accent="blue" />
        <StatCard icon={<ActivityIcon />} label="Usuarios / Destinatarios" value="248" sub="Destinatarios disponibles" accent="gray" />
      </div>

      <CommStatusCard mode={mode} />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Activación Rápida</h3>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setPanicPressed(!panicPressed)}
              className={`w-full py-5 rounded-xl flex flex-col items-center gap-2 transition-all font-bold text-white text-sm tracking-wide shadow-lg ${
                panicPressed ? "bg-red-700 shadow-red-300" : "bg-red-600 hover:bg-red-700 shadow-red-200"
              }`}
            >
              <BellIcon size={24} />
              BOTÓN DE PÁNICO
              <span className="text-xs font-normal opacity-80">Enviar alerta inmediata</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Al activar esta opción se distribuirá una alerta a los canales configurados.
            </p>
          </div>
        </div>

        <div className={`bg-white rounded-xl border shadow-sm p-5 ${isContingencia ? "border-orange-200" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Última Alerta</h3>
            <Badge color="red">● ACTIVA</Badge>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
            <div className="text-red-700 font-bold text-base mb-1">Terremoto</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-500">
              <span>Intensidad:</span><span className="font-medium text-gray-700">Moderada</span>
              <span>Ubicación:</span><span className="font-medium text-gray-700">Santiago, Chile</span>
              <span>Fecha:</span><span className="font-mono text-gray-700">25/08/2025</span>
              <span>Hora:</span><span className="font-mono text-gray-700">12:40:15</span>
            </div>
          </div>
          <div className="space-y-1.5 mb-3">
            {isContingencia ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Telegram</span>
                  <span className="font-medium text-red-500 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">MQTT / Internet</span>
                  <span className="font-medium text-red-500 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-100 pt-1.5">
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-semibold text-orange-600 font-mono">Distribución activa ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Nodos</span>
                  <span className="font-medium text-green-600">11/12 recibieron</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Telegram</span>
                  <span className="font-medium text-green-600">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">MQTT / IoT</span>
                  <span className="font-medium text-green-600">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-medium text-green-600">Disponible ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Nodos</span>
                  <span className="font-medium text-green-600">12/12 recibieron</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onViewDetail}
            className="w-full text-xs py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-1.5"
          >
            <ExternalLinkIcon size={12} />
            Ver detalles
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Mapa de Cobertura</h3>
          </div>
          <SantiagoMap compact mode={mode} />
          <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 flex-wrap justify-center">
            <span>🔴 Alerta activa</span>
            <span>🟢 Nodo online</span>
            <span>⚪ Nodo offline</span>
            <span className="flex items-center gap-0.5">
              <span className="inline-block w-3 border-t border-dashed border-green-400" />
              <span> Cob. RF</span>
            </span>
          </div>
          <button className="w-full mt-2 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1.5">
            <MapIcon size={12} />
            Ver mapa completo
          </button>
        </div>
      </div>

      <HistoryTable />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Vistas Móviles</h3>
        <p className="text-xs text-gray-400 mb-5">Representación de la notificación recibida por el usuario final</p>
        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <PhoneNotification />
            <p className="text-xs text-gray-400 mt-3">Notificación de alerta</p>
          </div>
          <div className="text-center">
            <PhoneStatus />
            <p className="text-xs text-gray-400 mt-3">Estado del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertDetailScreen({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4">
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <SendIcon size={14} />
            Estado de Difusión
          </h3>
          <div className="space-y-3">
            {isContingencia ? (
              <>
                {[
                  { channel: "Telegram", status: "No disponible", detail: "Sin conexión a Internet", ok: false, icon: "💬" },
                  { channel: "MQTT / Internet", status: "No disponible", detail: "Sin conexión a Internet", ok: false, icon: "🌐" },
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
              <>
                {[
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
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Cobertura de distribución</h3>
        <SantiagoMap mode={mode} />
        <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
          <span>🔴 Alerta activa — Santiago centro</span>
          <span>{isContingencia ? "🟠 11 nodos activos vía RF" : "🟢 7 nodos online"}</span>
          <span>⚪ 1 nodo offline</span>
          <span className="flex items-center gap-1">
            <RadioIcon size={11} />
            <span>Cobertura RF</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function DevicesScreen({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  const devices = [
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
        {devices.map((d) => (
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

function MapScreen({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Mapa de Cobertura — Santiago</h2>
            <p className="text-xs text-gray-400 mt-0.5">Vista completa de distribución de nodos y alertas activas</p>
          </div>
          <div className="flex items-center gap-2">
            {isContingencia && <Badge color="orange"><RadioIcon size={10} /> RF activo</Badge>}
            <Badge color="red">● 1 alerta activa</Badge>
          </div>
        </div>
        <SantiagoMap mode={mode} />
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">🔴 <span>Alerta activa</span></span>
          <span className="flex items-center gap-1.5">{isContingencia ? "🟠" : "🟢"} <span>Nodo {isContingencia ? "(RF)" : "online"}</span></span>
          <span className="flex items-center gap-1.5">⚪ <span>Nodo offline</span></span>
          <span className="flex items-center gap-1.5">
            <RadioIcon size={11} />
            <span>Cobertura RF</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function HistorialScreen() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <HistoryTable />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [navActive, setNavActive] = useState("dashboard");
  const [mode, setMode] = useState<CommMode>("normal");

  const navigate = (id: string) => {
    setNavActive(id);
    if (id === "dashboard") setScreen("dashboard");
    else if (id === "devices") setScreen("devices");
    else if (id === "historial") setScreen("historial");
    else if (id === "mapa") setScreen("mapa");
  };

  const titles: Record<Screen, string> = {
    dashboard: "Dashboard",
    detail: "Alerta Activa — Detalles",
    devices: "Dispositivos",
    historial: "Historial de Alertas",
    mapa: "Mapa de Cobertura",
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active={navActive} onNavigate={navigate} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={titles[screen]}
          onAlert={() => { setScreen("detail"); setNavActive("alertas"); }}
          mode={mode}
        />
        <div className={`px-8 py-2 flex items-center gap-3 text-xs border-b ${
          mode === "contingencia" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
        }`}>
          <span className="text-gray-500 font-medium">Simular modo:</span>
          <button
            onClick={() => setMode("normal")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              mode === "normal" ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-green-300"
            }`}
          >
            🟢 Normal
          </button>
          <button
            onClick={() => setMode("contingencia")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              mode === "contingencia" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
            }`}
          >
            🟠 Contingencia (sin Internet)
          </button>
          {mode === "contingencia" && (
            <span className="text-orange-600 font-medium ml-2">
              Internet no disponible — distribución activa vía canal RF
            </span>
          )}
        </div>
        {screen === "dashboard" && <DashboardScreen onViewDetail={() => { setScreen("detail"); setNavActive("alertas"); }} mode={mode} />}
        {screen === "detail" && <AlertDetailScreen mode={mode} />}
        {screen === "devices" && <DevicesScreen mode={mode} />}
        {screen === "historial" && <HistorialScreen />}
        {screen === "mapa" && <MapScreen mode={mode} />}
      </div>
    </div>
  );
}
