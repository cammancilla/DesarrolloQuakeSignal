import { CommMode } from "../types";
import { RadioIcon } from "./icons";

const NODES = [
  { x: 52, y: 38, online: true },
  { x: 68, y: 25, online: true },
  { x: 80, y: 48, online: true },
  { x: 42, y: 55, online: true },
  { x: 60, y: 60, online: false },
  { x: 72, y: 68, online: true },
  { x: 35, y: 72, online: true },
  { x: 58, y: 78, online: true },
];

export default function SantiagoMap({ compact = false, mode = "normal" }: { compact?: boolean; mode?: CommMode }) {
  const rfActive = mode === "contingencia";
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

        {/* Alert pulse */}
        <circle cx={60} cy={42} r={10} fill="#ef4444" opacity="0.12">
          <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.18;0.04;0.18" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={60} cy={42} r={3} fill="#ef4444" />
        <circle cx={60} cy={42} r={1.5} fill="white" />

        {/* RF coverage rings */}
        {NODES.filter((n) => n.online).map((n, i) => (
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

        {/* Nodes */}
        {NODES.map((n, i) => (
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

export function MapLegend({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  return (
    <div className="flex items-center gap-5 mt-3 text-xs text-gray-500 flex-wrap">
      <span>🔴 Alerta activa</span>
      <span>{isContingencia ? "🟠" : "🟢"} Nodo {isContingencia ? "(RF)" : "online"}</span>
      <span>⚪ Nodo offline</span>
      <span className="flex items-center gap-1"><RadioIcon size={11} /> Cobertura RF</span>
    </div>
  );
}
