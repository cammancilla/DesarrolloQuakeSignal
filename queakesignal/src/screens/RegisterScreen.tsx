import { useState, FormEvent } from "react";
import { BellIcon } from "../components/icons";
import { getApiUrl } from "../utils/auth";

interface RegisterScreenProps {
  onRegisterSuccess: (email: string) => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onGoToLogin }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (cleanPassword.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (cleanPassword !== confirmPassword.trim()) {
      setError("Las contraseñas no coinciden. Por favor escríbelas de forma idéntica.");
      return;
    }

    setLoading(true);

    try {
      // Petición al backend Express (Registrando como Operador por mínimo privilegio)
      const res = await fetch(getApiUrl("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          password: cleanPassword,
          role: "operador",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar cuenta.");
      }

      // Registro exitoso, redirige al Login pasando el correo recién creado
      onRegisterSuccess(cleanEmail);
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
            ⚠️ {error}
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
              placeholder="Ej: Camila Mancilla"
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
              placeholder="tu_correo@quakesignal.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? "Ocultar clave" : "Ver clave"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Confirmar Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña exactamente"
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
