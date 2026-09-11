import { useState, FormEvent } from "react";
import { BellIcon } from "../components/icons";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  // Prellenamos con los datos del Administrador para facilitar las pruebas
  const [email, setEmail] = useState("admin@quakesignal.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación de usuario Administrador
    if (email === "admin@quakesignal.com" && password === "admin123") {
      onLogin();
    } else {
      setError("Credenciales incorrectas. Acceso permitido solo para Administrador.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-red-200">
            <BellIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">QuakeSignal</h1>
          <p className="text-sm text-slate-500 mt-1">Acceso Administrativo al Sistema</p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Correo del Administrador
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@quakesignal.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2 cursor-pointer"
          >
            Iniciar Sesión como Administrador
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          Credenciales de prueba: <span className="font-mono text-slate-600">admin@quakesignal.com</span> / <span className="font-mono text-slate-600">admin123</span>
        </p>
      </div>
    </div>
  );
}