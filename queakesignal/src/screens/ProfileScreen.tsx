interface ProfileScreenProps {
  onLogout?: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  // Obtenemos la información guardada del usuario
  const userStorage = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStorage ? JSON.parse(userStorage) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const userRole = user?.role || user?.rol || "Usuario";

  return (
    <div className="p-10 max-w-4xl mx-auto w-full">
      <div className="bg-slate-800 text-white rounded-2xl p-8 shadow-2xl border border-slate-700/80">
        
        {/* Cabecera del Perfil */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Perfil de Usuario
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Gestiona tu información personal y credenciales de acceso.
            </p>
          </div>
          
          {/* Insignia / Badge del Rol */}
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
            userRole.toLowerCase().includes("admin")
              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}>
            {userRole}
          </span>
        </div>

        {/* Rejilla de Información del Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Nombre / Usuario */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Nombre de Usuario
            </label>
            <p className="text-xl text-slate-100 font-medium">
              {user?.nombre || user?.email?.split('@')[0] || "Usuario no identificado"}
            </p>
          </div>

          {/* Correo Electrónico */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Correo Electrónico
            </label>
            <p className="text-xl text-slate-100 font-medium truncate">
              {user?.email || "Sin correo disponible"}
            </p>
          </div>

          {/* Rol en el Sistema */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Rol Asignado
            </label>
            <p className="text-xl text-slate-100 font-medium capitalize">
              {userRole}
            </p>
          </div>

          {/* Estado de la cuenta */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Estado del Sistema
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xl text-emerald-400 font-medium">Activo</p>
            </div>
          </div>

        </div>

        {/* Zona Inferior: Botón de Salida */}
        <div className="pt-6 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-xl transition-all border border-red-500/30 shadow-lg cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}