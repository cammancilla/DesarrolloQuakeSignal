import { useEffect, useState } from "react";
import { getCurrentUser, isAdmin, getApiUrl, getAuthHeaders } from "../utils/auth";

interface UserData {
  _id: string;
  name?: string;
  nombre?: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export default function UsersScreen() {
  const currentUser = getCurrentUser();
  const admin = isAdmin(currentUser);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(getApiUrl("/api/auth/users"), {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "No se pudo obtener la lista de usuarios");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [admin]);

  // Si un operador intenta cargar directamente esta vista, se le presenta la pantalla de acceso restringido
  if (!admin) {
    return (
      <div className="p-8 max-w-2xl mx-auto w-full my-auto text-center">
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4 text-2xl font-bold">
            🛡️
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acceso Restringido</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            El módulo de <strong>Gestión de Usuarios</strong> es exclusivo para el usuario Administrador conforme al principio de mínimo privilegio.
          </p>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Tu rol actual: <strong className="text-blue-600 dark:text-blue-400 capitalize">{currentUser?.role || "Operador"}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lista general de cuentas registradas en MongoDB Atlas (Vista de Administrador)
          </p>
        </div>
        <span className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
          Total: <strong className="text-slate-900 dark:text-white">{users.length}</strong>
        </span>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="text-center py-12 text-slate-400 text-sm">
          Cargando usuarios desde la base de datos...
        </div>
      )}

      {/* Estado de Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Tabla de Usuarios */}
      {!loading && !error && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuario / Nombre</th>
                  <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">ID MongoDB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">
                      No hay usuarios registrados aún.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const roleName = u.role || "operador";
                    const isUserAdmin = roleName.toLowerCase().includes("admin");

                    return (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isUserAdmin ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
                          }`}>
                            {(u.name || u.nombre || u.email).charAt(0).toUpperCase()}
                          </div>
                          {u.name || u.nombre || u.email.split("@")[0]}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                              isUserAdmin
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400 dark:text-slate-500">
                          {u._id}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

