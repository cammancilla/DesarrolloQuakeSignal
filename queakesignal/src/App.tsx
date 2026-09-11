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

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  detail: "Alerta Activa — Detalles",
  devices: "Dispositivos",
  historial: "Historial de Alertas",
  mapa: "Mapa de Cobertura",
};

export default function App() {
  // 1. Estado para controlar si el usuario inició sesión
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const [screen, setScreen] = useState<Screen>("dashboard");
  const [navActive, setNavActive] = useState("dashboard");
  const [mode, setMode] = useState<CommMode>("normal");

  const navigate = (id: string) => {
    setNavActive(id);
    const screenMap: Record<string, Screen> = {
      dashboard: "dashboard",
      devices: "devices",
      historial: "historial",
      mapa: "mapa",
      alertas: "detail",
    };
    if (screenMap[id]) setScreen(screenMap[id]);
  };

  const openDetail = () => {
    setScreen("detail");
    setNavActive("alertas");
  };

// 1. Guard de autenticación
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
        onLogin={() => setIsAuthenticated(true)} 
        onGoToRegister={() => setAuthView("register")} 
      />
    );
  }
  // 3. Si SI está autenticado, renderiza la app completa
  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Sidebar active={navActive} onNavigate={navigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={TITLES[screen] || "Sistema"} onAlert={openDetail} mode={mode} />

        {/* Mode toggle bar */}
        <div
          className={`px-8 py-2 flex items-center gap-3 text-xs border-b ${
            mode === "contingencia" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
          }`}
        >
          <span className="text-gray-500 font-medium">Simular modo:</span>
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
            <span className="text-orange-600 font-medium ml-2">
              Internet no disponible — distribución activa vía canal RF
            </span>
          )}
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          {screen === "dashboard" && (
            <DashboardScreen
              mode={mode}
              onViewDetail={openDetail}
              onNavigateMap={() => {
                setScreen("mapa");
                setNavActive("mapa");
              }}
            />
          )}

          {screen === "detail" && <AlertDetailScreen mode={mode} />}
          {screen === "devices" && <DevicesScreen mode={mode} />}
          {screen === "historial" && <HistorialScreen />}
          {screen === "mapa" && <MapScreen />}
        </main>
      </div>
    </div>
  );
}

