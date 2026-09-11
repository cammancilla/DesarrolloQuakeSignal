import { useState } from "react";
import { Screen, CommMode } from "./types/index.ts";
import Sidebar from "./components/Sidebar.tsx";
import Header from "./components/Header.tsx";
import DashboardScreen from "./screens/DashboardScreen";
import AlertDetailScreen from "./screens/AlertDetailScreen.tsx";
import DevicesScreen from "./screens/DevicesScreen.tsx";
import MapScreen from "./screens/MapScreen.tsx";
import HistorialScreen from "./screens/HistorialScreen.tsx";
import LoginScreen from "./screens/LoginScreen";

const TITLES: Record<Screen, string> = {
  dashboard: "Dashboard",
  detail: "Alerta Activa — Detalles",
  devices: "Dispositivos",
  historial: "Historial de Alertas",
  mapa: "Mapa de Cobertura",
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [navActive, setNavActive] = useState("dashboard");
  const [mode, setMode] = useState<CommMode>("normal");

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const navigate = (id: string) => {
    setNavActive(id);
    const screenMap: Record<string, Screen> = {
      dashboard: "dashboard",
      devices: "devices",
      historial: "historial",
      mapa: "mapa",
      alertas: "detail", // This will be handled separately in the onAlert function
    };
    if (screenMap[id]) setScreen(screenMap[id]);
  };

  const openDetail = () => {
    setScreen("detail");
    setNavActive("alertas");
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active={navActive} onNavigate={navigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={TITLES[screen]} onAlert={openDetail} mode={mode} />

        {/* Mode toggle bar */}
        <div className={`px-8 py-2 flex items-center gap-3 text-xs border-b ${
          mode === "contingencia" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
        }`}>
          <span className="text-gray-500 font-medium">Simular modo:</span>
          <button
            onClick={() => setMode("normal")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              mode === "normal" ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-green-300"
            }`}
          >
            🟢 Normal
          </button>
          <button
            onClick={() => setMode("contingencia")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              mode === "contingencia" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"
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
          {/* Renderizado condicional de vistas */}
          {screen === "dashboard" && (
            <DashboardScreen
              mode={mode}
              onViewDetail={() => setScreen("detail")}
              onNavigateMap={() => setScreen("mapa")} 
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