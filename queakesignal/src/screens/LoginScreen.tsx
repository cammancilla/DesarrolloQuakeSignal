import { useState, useEffect, FormEvent } from "react";
import { BellIcon } from "../components/icons";
import { getApiUrl } from "../utils/auth";

interface LoginScreenProps {
  onLogin: () => void;
  onGoToRegister: () => void;
  defaultEmail?: string;
}

export default function LoginScreen({ onLogin, onGoToRegister, defaultEmail }: LoginScreenProps) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para el modal de restablecimiento de contraseña
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
      setSuccessMsg(`Cuenta creada para ${defaultEmail}. Ingresa tu contraseña para acceder.`);
    }
  }, [defaultEmail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    try {
      // Petición al Backend Node.js
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales incorrectas.");
      }

      // Guardar token JWT y datos de sesión en sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("quakesignal_auth");

      onLogin(); // Entrar a la aplicación
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail("admin@quakesignal.com");
    setPassword("admin123");
    setError("");
    setSuccessMsg("Credenciales de Administrador cargadas.");
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetMsg(null);
    setResetError(null);
    setResetLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase(), newPassword: newPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "No se pudo restablecer la contraseña.");
      }

      setResetMsg("✓ Contraseña actualizada. Ya puedes iniciar sesión.");
      setEmail(resetEmail.trim().toLowerCase());
      setPassword(newPassword.trim());
      setTimeout(() => {
        setShowResetModal(false);
        setResetMsg(null);
      }, 2000);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100 relative">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-red-200">
            <BellIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">QuakeSignal</h1>
          <p className="text-sm text-slate-500 mt-1">Acceso al Sistema</p>
        </div>

        {/* Mensaje de Éxito */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center">
            {successMsg}
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium space-y-1">
            <p className="font-semibold text-center"> {error}</p>
            {error.toLowerCase().includes("contraseña") && (
              <p className="text-[11px] text-red-500 text-center">
                Presiona "¿Olvidaste tu contraseña?" para restablecerla.
              </p>
            )}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-red-600 hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-700 px-1 py-0.5 cursor-pointer"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Enlace para ir al Registro */}
        <p className="text-xs text-slate-500 text-center mt-5">
          ¿Eres nuevo operador?{" "}
          <button 
            onClick={onGoToRegister} 
            className="text-red-600 hover:underline font-semibold cursor-pointer"
          >
            Regístrate aquí
          </button>
        </p>

        {/* Acceso Rápido para Admin */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400"></span>
          <button
            type="button"
            onClick={handleFillAdmin}
            className="text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors cursor-pointer"
          >
             Cargar Admin por Defecto
          </button>
        </div>
      </div>

      {/* MODAL PARA RESTABLECER CONTRASEÑA */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Restablecer Contraseña</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ingresa el correo de tu cuenta de operador y define una nueva contraseña para actualizarla de inmediato.
            </p>

            {resetError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                Error: {resetError}
              </div>
            )}

            {resetMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tu_correo@quakesignal.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer font-semibold disabled:opacity-50"
                >
                  {resetLoading ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
