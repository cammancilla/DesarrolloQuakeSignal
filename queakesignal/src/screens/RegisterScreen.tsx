import { useState, FormEvent } from "react";
import { BellIcon } from "../components/icons";
import { getApiUrl } from "../utils/auth";

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onGoToLogin }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Petición al backend Express (Registrando como Operador por mínimo privilegio)
      const res = await fetch(getApiUrl("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "operador" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar cuenta.");
      }

      // Registro exitoso, redirige al Login
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-red-200">
            <BellIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">QuakeSignal</h1>
          <p className="text-sm text-slate-500 mt-1">Crear cuenta de Operador</p>
          <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-0.5 mt-2 font-medium">
            Rol: Operador de Monitoreo
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@quakesignal.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Registrarse como Operador"}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          ¿Ya tienes cuenta?{" "}
          <button 
            onClick={onGoToLogin} 
            className="text-red-600 hover:underline font-semibold cursor-pointer"
          >
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
}
