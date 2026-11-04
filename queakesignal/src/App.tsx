import { useState, useEffect } from "react";
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
import { getCurrentUser, isAdmin, canAccessScreen } from "./utils/auth";
import NotFoundScreen from "./screens/NotFoundScreen.tsx";

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

// Mapa inverso para saber qué navActive corresponde a cada Screen
const SCREEN_TO_NAV: Record<Screen, string> = {
  dashboard: "dashboard",
  devices: "devices",
  historial: "historial",
  mapa: "mapa",
  detail: "alertas",
  configuracion: "configuracion",
  profile: "profile",
  usuarios: "usuarios",
  login: "login",
  register: "register",
  notFound: "dashboard", 
};

function AppContent() {
  const { config } = useConfig();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      localStorage.removeItem("quakesignal_auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    return sessionStorage.getItem("quakesignal_auth") === "true";
  });
  
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const [screen, setScreen] = useState<Screen>(() => {
    const user = getCurrentUser();
    const admin = isAdmin(user);
    try {
      const active = sessionStorage.getItem("quakesignal_active_screen");
      if (
        active &&
        ["dashboard", "detail", "devices", "historial", "mapa", "configuracion", "profile", "usuarios"].includes(active)
      ) {
        // Mínimo privilegio: Si no es admin y la pantalla guardada era configuracion o usuarios, volver a dashboard
        if (!admin && (active === "configuracion" || active === "usuarios")) {
          return "dashboard";
        }
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
    const user = getCurrentUser();
    const admin = isAdmin(user);
    try {
      const activeNav = sessionStorage.getItem("quakesignal_active_nav");
      if (activeNav) {
        if (!admin && (activeNav === "configuracion" || activeNav === "usuarios")) {
          return "dashboard";
        }
        return activeNav;
      }
      const activeScreen = sessionStorage.getItem("quakesignal_active_screen");
      if (activeScreen) {
        if (!admin && (activeScreen === "configuracion" || activeScreen === "usuarios")) {
          return "dashboard";
        }
        return activeScreen;
      }
    } catch {}
    return "dashboard";
  });

  const [mode, setMode] = useState<CommMode>("normal");

  const user = getCurrentUser();
  const admin = isAdmin(user);

  // 1. Manejo del evento de retroceso / avance en el navegador y ratón
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        const targetScreen = event.state.screen as Screen;
        const currentUser = getCurrentUser();

        // Mínimo privilegio: Bloquear navegación hacia atrás/adelante si el rol no tiene permiso
        if (!canAccessScreen(targetScreen, currentUser)) {
          setScreen("dashboard");
          setNavActive("dashboard");
          sessionStorage.setItem("quakesignal_active_screen", "dashboard");
          sessionStorage.setItem("quakesignal_active_nav", "dashboard");
          return;
        }

        const targetNav = event.state.navActive || SCREEN_TO_NAV[targetScreen] || targetScreen;

        setScreen(targetScreen);
        setNavActive(targetNav);

        sessionStorage.setItem("quakesignal_active_screen", targetScreen);
        sessionStorage.setItem("quakesignal_active_nav", targetNav);
      }
    };

    // Guardar el estado inicial en history si la página se recarga por primera vez
    if (!window.history.state) {
      window.history.replaceState({ screen, navActive }, "", `#${screen}`);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem("quakesignal_auth", "true");
    setIsAuthenticated(true);

    const loggedUser = getCurrentUser();
    const isLoggedAdmin = isAdmin(loggedUser);

    let vista = (config?.interfaz?.vistaInicial || "dashboard") as Screen;
    // Si la vista inicial configurada fuera restringida y no es admin, forzar dashboard
    if (!isLoggedAdmin && (vista === "configuracion" || vista === "usuarios")) {
      vista = "dashboard";
    }
    const nav = SCREEN_TO_NAV[vista] || vista;

    setScreen(vista);
    setNavActive(nav);
    sessionStorage.setItem("quakesignal_active_screen", vista);
    sessionStorage.setItem("quakesignal_active_nav", nav);

    // Registrar en el historial del navegador
    window.history.pushState({ screen: vista, navActive: nav }, "", `#${vista}`);
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

  // 2. Función navigate protegida por principio de mínimo privilegio y soporte 404/History
  const navigate = (id: string) => {
  // Mapa de aliases a pantallas válidas
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

  // 1. Verificar si la pantalla solicitada existe en el mapa
  const targetScreen = screenMap[id];

  //  CASO 404: Si la pantalla no existe en el mapa
  if (!targetScreen) {
    setScreen("notFound");
    setNavActive("");
    sessionStorage.setItem("quakesignal_active_screen", "notFound");
    sessionStorage.setItem("quakesignal_active_nav", "");
    
    // Sincronizar el historial para que la URL refleje el 404 y funcionen las flechas del ratón
    window.history.pushState({ screen: "notFound", navActive: "" }, "", "#notFound");
    return;
  }

  //  OBTENER USUARIO ACTUAL (Para evitar error de variable no definida)
  const currentUser = getCurrentUser(); // O la fuente que utilices para leer el usuario activo

  // 2. Mínimo privilegio: Bloquear acceso si el rol no tiene autorización
  if (!canAccessScreen(targetScreen, currentUser)) {
    console.warn(`Acceso restringido: El rol actual no tiene autorización para acceder a "${targetScreen}".`);
    
    setScreen("dashboard");
    setNavActive("dashboard");
    sessionStorage.setItem("quakesignal_active_nav", "dashboard");
    sessionStorage.setItem("quakesignal_active_screen", "dashboard");
    
    window.history.pushState({ screen: "dashboard", navActive: "dashboard" }, "", "#dashboard");
    return;
  }

  // 3. Caso Exitoso: Navegar a la pantalla permitida
  setNavActive(id);
  setScreen(targetScreen);

  sessionStorage.setItem("quakesignal_active_nav", id);
  sessionStorage.setItem("quakesignal_active_screen", targetScreen);

  // Push al historial del navegador (Navegación con ratón y flechas)
  window.history.pushState({ screen: targetScreen, navActive: id }, "", `#${targetScreen}`);
};

useEffect(() => {
  // Función para leer la URL al cargar o cambiar el hash manualmente
  const syncRouteWithHash = () => {
    // Obtener lo que está después de # (por ejemplo "ola")
    const hashRoute = window.location.hash.replace("#", "");

    if (hashRoute) {
      // Usar tu función navigate configurada para validar la ruta
      navigate(hashRoute);
    }
  };

  // 1. Ejecutar al cargar la página por primera vez
  syncRouteWithHash();

  // 2. Escuchar si el usuario cambia la URL manualmente en la barra de direcciones
  window.addEventListener("hashchange", syncRouteWithHash);
  return () => window.removeEventListener("hashchange", syncRouteWithHash);
}, []);

  // 3. Función openDetail actualizada
  const openDetail = () => {
    setScreen("detail");
    setNavActive("alertas");
    sessionStorage.setItem("quakesignal_active_screen", "detail");
    sessionStorage.setItem("quakesignal_active_nav", "alertas");

    window.history.pushState({ screen: "detail", navActive: "alertas" }, "", "#detail");
  };

  // Guard de autenticación
  if (!isAuthenticated) {
    if (authView === "register") {
      return (
        <RegisterScreen 
          onRegisterSuccess={(newEmail: string) => {
            setRegisteredEmail(newEmail);
            setAuthView("login");
          }} 
          onGoToLogin={() => setAuthView("login")} 
        />
      );
    }

    return (
      <LoginScreen 
        defaultEmail={registeredEmail}
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
          {screen === "configuracion" && (
            admin ? (
              <ConfiguracionScreen />
            ) : (
              <DashboardScreen
                mode={mode}
                onViewDetail={openDetail}
                onNavigateMap={() => navigate("mapa")}
              />
            )
          )}
          {screen === "mapa" && <MapScreen />}
          {screen === "profile" && <ProfileScreen onLogout={handleLogout} />}
          {screen === "usuarios" && (
            admin ? (
              <UsersScreen />
            ) : (
              <DashboardScreen
                mode={mode}
                onViewDetail={openDetail}
                onNavigateMap={() => navigate("mapa")}
              />
            )
          )}
          {screen === "notFound" && (
          <NotFoundScreen onGoHome={() => setScreen("dashboard")} />)}
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
