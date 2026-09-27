import { useState, useEffect } from "react";
import { Screen, CommMode } from "./types/index.ts";
import Sidebar from "./components/Sidebar.tsx";
import Header from "./components/Header.tsx";
import DashboardScreen from "./screens/DashboardScreen";
import AlertDetailScreen from "./screens/AlertDetailScreen.tsx";
import DevicesScreen from "./screens/DevicesScreen.tsx";
import MapScreen from "./screens/MapScreen.tsx";
import HistorialScreen from "./screens/HistorialScreen.tsx";
import LoginScreen from "./screens/LoginScreen";
import ConfiguracionScreen from "./screens/ConfiguracionScreen.tsx";
import { ConfigProvider, useConfig } from "./context/ConfigContext.tsx";
import SaveToast from "./components/SaveToast.tsx";

const TITLES: Record<Screen, string> = {
  dashboard: "Dashboard",
  detail: "Alerta Activa — Detalles",
  devices: "Dispositivos",
  historial: "Historial de Alertas",
  mapa: "Mapa de Cobertura",
  configuracion: "Configuración del Sistema",
};

function AppContent() {
  const { config } = useConfig();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("quakesignal_auth") === "true";
  });

  // Persistir la pantalla activa en sessionStorage para que el operador NUNCA pierda
  // su ubicación cuando el navegador se actualice o refresque.
  const [screen, setScreen] = useState<Screen>(() => {
    try {
      const active = sessionStorage.getItem("quakesignal_active_screen");
      if (
        active &&
        ["dashboard", "detail", "devices", "historial", "mapa", "configuracion"].includes(active)
      ) {
        return active as Screen;
      }
      const saved = localStorage.getItem("quakesignal_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.interfaz?.vistaInicial && ["dashboard", "mapa"].includes(parsed.interfaz.vistaInicial)) {
          return parsed.interfaz.vistaInicial as Screen;
        }
      }
    } catch {}
    return "dashboard";
  });

  const [navActive, setNavActive] = useState<string>(() => {
    try {
      const activeNav = sessionStorage.getItem("quakesignal_active_nav");
      if (activeNav) return activeNav;
      const activeScreen = sessionStorage.getItem("quakesignal_active_screen");
      if (activeScreen) return activeScreen;
      const saved = localStorage.getItem("quakesignal_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.interfaz?.vistaInicial && ["dashboard", "mapa"].includes(parsed.interfaz.vistaInicial)) {
          return parsed.interfaz.vistaInicial;
        }
      }
    } catch {}
    return "dashboard";
  });

  const [mode, setMode] = useState<CommMode>("normal");

  const handleLogin = () => {
    localStorage.setItem("quakesignal_auth", "true");
    setIsAuthenticated(true);
    // Al autenticarse por primera vez, respetar la vista inicial configurada
    const vista = config?.interfaz?.vistaInicial || "dashboard";
    setScreen(vista);
    setNavActive(vista);
    sessionStorage.setItem("quakesignal_active_screen", vista);
    sessionStorage.setItem("quakesignal_active_nav", vista);
  };

  const handleLogout = () => {
    localStorage.removeItem("quakesignal_auth");
    sessionStorage.removeItem("quakesignal_active_screen");
    sessionStorage.removeItem("quakesignal_active_nav");
    setIsAuthenticated(false);
  };

  const navigate = (id: string) => {
    setNavActive(id);
    sessionStorage.setItem("quakesignal_active_nav", id);
    const screenMap: Record<string, Screen> = {
      dashboard: "dashboard",
      devices: "devices",
      historial: "historial",
      mapa: "mapa",
      alertas: "detail",
      configuracion: "configuracion",
    };
    if (screenMap[id]) {
      setScreen(screenMap[id]);
      sessionStorage.setItem("quakesignal_active_screen", screenMap[id]);
    }
  };

  const openDetail = () => {
    setScreen("detail");
    setNavActive("alertas");
    sessionStorage.setItem("quakesignal_active_screen", "detail");
    sessionStorage.setItem("quakesignal_active_nav", "alertas");
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div
      className="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <SaveToast />
      <Sidebar active={navActive} onNavigate={navigate} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Header title={TITLES[screen]} onAlert={openDetail} mode={mode} />

        {/* Mode toggle bar */}
        <div
          className={`px-8 py-2 flex items-center gap-3 text-xs border-b transition-colors ${
            mode === "contingencia"
              ? "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60"
              : "bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800"
          }`}
        >
          <span className="text-gray-500 dark:text-slate-400 font-medium">Simular modo:</span>
          <button
            onClick={() => setMode("normal")}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              mode === "normal"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:border-green-300 dark:hover:border-emerald-500"
            }`}
          >
            🟢 Normal
          </button>
          <button
            onClick={() => setMode("contingencia")}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              mode === "contingencia"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-500"
            }`}
          >
            🟠 Contingencia (sin Internet)
          </button>
          {mode === "contingencia" && (
            <span className="text-orange-600 dark:text-orange-400 font-medium ml-2">
              Internet no disponible — distribución activa vía canal RF
            </span>
          )}
        </div>

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          {screen === "dashboard" && (
            <DashboardScreen
              mode={mode}
              onViewDetail={openDetail}
              onNavigateMap={() => navigate("mapa")}
            />
          )}

          {screen === "detail" && <AlertDetailScreen mode={mode} />}
          {screen === "devices" && <DevicesScreen mode={mode} />}
          {screen === "historial" && <HistorialScreen />}
          {screen === "mapa" && <MapScreen mode={mode} />}
          {screen === "configuracion" && <ConfiguracionScreen />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}