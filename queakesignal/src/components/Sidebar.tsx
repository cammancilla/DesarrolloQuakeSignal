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
  { id: "profile", label: "Perfil", icon: UsersIcon },
];



const CLICKABLE = ["dashboard", "devices", "historial", "mapa", "alertas", "profile", "usuarios", "configuracion"]; 

export default function Sidebar({
  active,
  onNavigate,
  onLogout,
}: {
  active: string;
  onNavigate: (id: string) => void;
  onLogout?: () => void;
}) {
  // Lógica del usuario dentro de la función
  const userStorage = typeof window !== "undefined"
    ? (sessionStorage.getItem("user") || localStorage.getItem("user"))
    : null;
  const user = userStorage ? JSON.parse(userStorage) : null;

  const userName = user?.name || user?.nombre || user?.email || "Usuario";
  const initialLetter = userName.charAt(0).toUpperCase();

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

      <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between gap-1">
        {/* Botón interactivo que llama a onNavigate("profile") */}
        <button
          onClick={() => onNavigate("profile")}
          className="flex-1 flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer group min-w-0"
          title="Ver perfil de usuario"
        >
          {/* Avatar dinámico */}
          <div className="w-7 h-7 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold group-hover:bg-blue-500 transition-colors">
            {initialLetter}
          </div>

          <div className="min-w-0 flex-1">
            {/* Nombre dinámico */}
            <div className="text-white text-xs font-medium truncate group-hover:text-blue-400 transition-colors">
              {userName}
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <StatusDot color="green" />
              <span className="text-white/40 text-[10px]">Sesión activa</span>
            </div>
          </div>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}