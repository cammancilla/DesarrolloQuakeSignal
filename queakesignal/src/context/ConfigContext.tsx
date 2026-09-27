import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ConfiguracionSistema } from "../types";

export const CONFIG_DEFAULT: ConfiguracionSistema = {
  comunicaciones: {
    telegram: {
      botToken: "7198234821:AAH8Fq2Pz89_qkSignalBot",
      chatId: "-1002938472910",
      activo: true,
    },
    mqtt: {
      broker: "broker.emqx.io",
      puerto: 1883,
      usuario: "quakesignal_core",
      password: "qs_secure_pwd_2026",
      topico: "chile/alertas",
      activo: true,
    },
    radiofrecuencia: {
      banda: "915 MHz (Chile / Américas)",
      canal: "CH-04 (915.2 MHz)",
      frecuenciaMhz: 915.2,
      potenciaTxDbm: 20,
      spreadingFactor: "SF7",
    },
  },
  automatizacion: {
    umbralDesconexionSegundos: 180,
    autoContingencia: true,
    tasaRefrescoSegundos: 3,
  },
  interfaz: {
    vistaInicial: "dashboard",
    temaVisual: "oscuro",
  },
};

interface ConfigContextType {
  config: ConfiguracionSistema;
  updateConfig: (newConfig: ConfiguracionSistema) => Promise<boolean>;
  isDark: boolean;
  setTheme: (tema: "oscuro" | "claro") => void;
  toastMessage: string | null;
  triggerSaveToast: (msg?: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracionSistema>(() => {
    const saved = localStorage.getItem("quakesignal_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.comunicaciones && parsed.interfaz) {
          return parsed;
        }
      } catch {}
    }
    return CONFIG_DEFAULT;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isDark = config.interfaz.temaVisual === "oscuro";

  // Sincronizar clase .dark en <html> inmediatamente al montar y al cambiar de tema
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Cargar configuración inicial del backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/configuracion");
        if (res.ok) {
          const data = await res.json();
          if (data && data.comunicaciones && data.interfaz) {
            setConfig(data);
            localStorage.setItem("quakesignal_config", JSON.stringify(data));
          }
        }
      } catch {
        // Usa la guardada en localStorage
      }
    };
    fetchConfig();
  }, []);

  const triggerSaveToast = (msg?: string) => {
    setToastMessage(msg || "Cambios Guardados: Configuración y parámetros aplicados.");
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateConfig = async (newConfig: ConfiguracionSistema): Promise<boolean> => {
    setConfig(newConfig);
    localStorage.setItem("quakesignal_config", JSON.stringify(newConfig));

    // Aplicar clase dark al instante
    if (newConfig.interfaz.temaVisual === "oscuro") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    triggerSaveToast("Cambios Guardados: Configuración y parámetros aplicados.");

    // Sincronizar con backend si está disponible
    try {
      const res = await fetch("http://localhost:3001/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      return res.ok;
    } catch {
      return true; // Persistido en localStorage
    }
  };

  const setTheme = (tema: "oscuro" | "claro") => {
    const updated: ConfiguracionSistema = {
      ...config,
      interfaz: {
        ...config.interfaz,
        temaVisual: tema,
      },
    };
    updateConfig(updated);
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        isDark,
        setTheme,
        toastMessage,
        triggerSaveToast,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig debe ser usado dentro de un ConfigProvider");
  }
  return ctx;
}
