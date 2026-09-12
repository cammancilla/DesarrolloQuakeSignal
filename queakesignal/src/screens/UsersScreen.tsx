import { useEffect, useState } from "react";

interface UserData {
  _id: string;
  nombre?: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:3001/api/auth/users");

        if (!response.ok) {
          throw new Error("No se pudo obtener la lista de usuarios");
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
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-xs text-slate-400 mt-1">
            Lista general de cuentas registradas en MongoDB Atlas
          </p>
        </div>
        <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          Total: <strong className="text-white">{users.length}</strong>
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
        <div className="bg-slate-800 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuario / Nombre</th>
                  <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">ID MongoDB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">
                      No hay usuarios registrados aún.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const roleName = u.role || "Usuario";
                    const isAdmin = roleName.toLowerCase().includes("admin");

                    return (
                      <tr key={u._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                            {(u.nombre || u.email).charAt(0).toUpperCase()}
                          </div>
                          {u.nombre || u.email.split("@")[0]}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                              isAdmin
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
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