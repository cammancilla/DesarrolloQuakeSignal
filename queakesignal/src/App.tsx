
import { useState } from "react";
import { Screen, CommMode } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardScreen from "./screens/DashboardScreen";
import AlertDetailScreen from "./screens/AlertDetailScreen";
import DevicesScreen from "./screens/DevicesScreen";
import MapScreen from "./screens/MapScreen";
import HistorialScreen from "./screens/HistorialScreen";
import LoginScreen from "./screens/LoginScreen"; 
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen.tsx";
import UsersScreen from "./screens/UsersScreen";
import ConfiguracionScreen from "./screens/ConfiguracionScreen.tsx";
import { ConfigProvider, useConfig } from "./context/ConfigContext.tsx";
import SaveToast from "./components/SaveToast.tsx";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  detail: "Alerta Activa — Detalles",
  devices: "Dispositivos",
  historial: "Historial de Alertas",
  mapa: "Mapa de Cobertura",
  configuracion: "Configuración del Sistema",
  profile: "Perfil de Usuario",
  usuarios: "Gestión de Usuarios",
};

function AppContent() {
  const { config } = useConfig();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      // Limpiar residuos previos de localStorage para forzar inicio de sesión
      localStorage.removeItem("quakesignal_auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    return sessionStorage.getItem("quakesignal_auth") === "true";
  });
  
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const [screen, setScreen] = useState<Screen>(() => {
    try {
      const active = sessionStorage.getItem("quakesignal_active_screen");
      if (
        active &&
        ["dashboard", "detail", "devices", "historial", "mapa", "configuracion", "profile", "usuarios"].includes(active)
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
    } catch {}
    return "dashboard";
  });

  const [mode, setMode] = useState<CommMode>("normal");

  const handleLogin = () => {
    sessionStorage.setItem("quakesignal_auth", "true");
    setIsAuthenticated(true);
    const vista = config?.interfaz?.vistaInicial || "dashboard";
    setScreen(vista as Screen);
    setNavActive(vista);
    sessionStorage.setItem("quakesignal_active_screen", vista);
    sessionStorage.setItem("quakesignal_active_nav", vista);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("quakesignal_auth");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("quakesignal_active_screen");
    sessionStorage.removeItem("quakesignal_active_nav");
    localStorage.removeItem("quakesignal_auth");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
      profile: "profile",
      usuarios: "usuarios",
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

  // Guard de autenticación
  if (!isAuthenticated) {
    if (authView === "register") {
      return (
        <RegisterScreen 
          onRegisterSuccess={() => {
            alert("Cuenta creada con éxito. Ya puedes iniciar sesión.");
            setAuthView("login");
          }} 
          onGoToLogin={() => setAuthView("login")} 
        />
      );
    }

    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onGoToRegister={() => setAuthView("register")} 
      />
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <SaveToast />
      <Sidebar active={navActive} onNavigate={navigate} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Header title={TITLES[screen] || "Sistema"} onAlert={openDetail} mode={mode} />

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
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-green-300"
            }`}
          >
            🟢 Normal
          </button>
          <button
            onClick={() => setMode("contingencia")}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              mode === "contingencia"
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
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
          {screen === "configuracion" && <ConfiguracionScreen />}
          {screen === "mapa" && <MapScreen />}
          {screen === "profile" && <ProfileScreen onLogout={handleLogout} />}
          {screen === "usuarios" && <UsersScreen />}
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