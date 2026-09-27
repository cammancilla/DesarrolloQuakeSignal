import StatusDot from "./StatusDot.tsx";
import { BellIcon, GridIcon, MapIcon, CpuIcon, ClockIcon, GearIcon, UsersIcon } from "./icons";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "alertas", label: "Alertas", icon: BellIcon },
  { id: "mapa", label: "Mapa", icon: MapIcon },
  { id: "devices", label: "Dispositivos", icon: CpuIcon },
  { id: "historial", label: "Historial", icon: ClockIcon },
  { id: "configuracion", label: "Configuración", icon: GearIcon },
  { id: "usuarios", label: "Usuarios", icon: UsersIcon },
];

const CLICKABLE = ["dashboard", "devices", "historial", "mapa", "alertas", "configuracion"]; 

export default function Sidebar({
  active,
  onNavigate,
  onLogout,
}: {
  active: string;
  onNavigate: (id: string) => void;
  onLogout?: () => void;
}) {
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
          return (
            <button
              key={id}
              onClick={() => CLICKABLE.includes(id) && onNavigate(id)}
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
        <div className="flex items-center justify-between">
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
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="text-white/40 hover:text-red-400 p-1 rounded transition-colors text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
