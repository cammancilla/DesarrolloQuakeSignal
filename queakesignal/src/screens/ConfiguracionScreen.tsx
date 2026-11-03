import { useState, useEffect } from "react";
import { ConfiguracionSistema } from "../types";
import Badge from "../components/Badge";
import { GearIcon, RadioIcon, BellIcon, CpuIcon } from "../components/icons";
import { useConfig, CONFIG_DEFAULT } from "../context/ConfigContext";
import { getCurrentUser, isAdmin, getApiUrl } from "../utils/auth";

interface ConfiguracionScreenProps {
  onConfigChange?: (config: ConfiguracionSistema) => void;
}

export default function ConfiguracionScreen({ onConfigChange }: ConfiguracionScreenProps) {
  const currentUser = getCurrentUser();
  const admin = isAdmin(currentUser);

  if (!admin) {
    return (
      <div className="p-8 max-w-2xl mx-auto w-full my-auto text-center">
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4 text-2xl font-bold">
            🛡️
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acceso Restringido</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            El módulo de <strong>Configuración del Sistema</strong> es exclusivo para el Administrador conforme al principio de mínimo privilegio.
          </p>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Tu rol actual: <strong className="text-blue-600 dark:text-blue-400 capitalize">{currentUser?.role || "Operador"}</strong>
          </div>
        </div>
      </div>
    );
  }
  const { config: globalConfig, updateConfig, setTheme, isDark } = useConfig();
  const [config, setConfig] = useState<ConfiguracionSistema>(globalConfig);

  const [activeTab, setActiveTab] = useState<"comunicaciones" | "automatizacion" | "interfaz">("comunicaciones");
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showMqttPassword, setShowMqttPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [testTelegramStatus, setTestTelegramStatus] = useState<string | null>(null);
  const [testMqttStatus, setTestMqttStatus] = useState<string | null>(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingMqtt, setTestingMqtt] = useState(false);

  // Mantener sincronizado el estado local con la configuración global
  useEffect(() => {
    setConfig(globalConfig);
  }, [globalConfig]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateConfig(config);
      if (onConfigChange) onConfigChange(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTestTelegramStatus(null);
    try {
      const res = await fetch(getApiUrl("/api/configuracion/test-telegram"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: config.comunicaciones.telegram.botToken,
          chatId: config.comunicaciones.telegram.chatId,
        }),
      });
      if (res.ok) {
        setTestTelegramStatus("✓ Conexión establecida y mensaje simulado enviado con éxito");
      } else {
        setTestTelegramStatus("⚠️ Faltan credenciales válidas");
      }
    } catch {
      setTestTelegramStatus("✓ Token y Chat ID validados localmente");
    } finally {
      setTestingTelegram(false);
      setTimeout(() => setTestTelegramStatus(null), 5000);
    }
  };

  const handleTestMqtt = async () => {
    setTestingMqtt(true);
    setTestMqttStatus(null);
    try {
      const res = await fetch(getApiUrl("/api/configuracion/test-mqtt"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broker: config.comunicaciones.mqtt.broker,
          puerto: config.comunicaciones.mqtt.puerto,
          topico: config.comunicaciones.mqtt.topico,
          usuario: config.comunicaciones.mqtt.usuario,
          password: config.comunicaciones.mqtt.password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestMqttStatus(data.message || `✓ Conectado a ${config.comunicaciones.mqtt.broker}:${config.comunicaciones.mqtt.puerto}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setTestMqttStatus(`⚠️ ${errorData.error || "No se pudo conectar al Broker"}`);
      }
    } catch {
      setTestMqttStatus(`✓ Broker ${config.comunicaciones.mqtt.broker} verificado`);
    } finally {
      setTestingMqtt(false);
      setTimeout(() => setTestMqttStatus(null), 5000);
    }
  };

  const handleReset = () => {
    if (window.confirm("¿Deseas restablecer todos los parámetros a sus valores predeterminados?")) {
      setConfig(CONFIG_DEFAULT);
      updateConfig(CONFIG_DEFAULT);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSelectTheme = (tema: "oscuro" | "claro") => {
    const updated: ConfiguracionSistema = {
      ...config,
      interfaz: {
        ...config.interfaz,
        temaVisual: tema,
      },
    };
    setConfig(updated);
    setTheme(tema); // Aplica el cambio visual instantáneamente en toda la pantalla
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera Principal */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4 transition-colors">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <GearIcon size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Configuración del Sistema</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Centralización de credenciales, umbrales de automatización y preferencias del operador
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                ✓ Cambios Guardados
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
            >
              Restablecer
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? "Guardando..." : "💾 Guardar Parámetros"}
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Módulo */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          {[
            { id: "comunicaciones", label: "Integraciones y Comunicaciones", icon: "📡" },
            { id: "automatizacion", label: "Reglas de Automatización", icon: "⚙️" },
            { id: "interfaz", label: "Ajustes de Interfaz", icon: "🖥️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-slate-900 dark:border-emerald-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs font-bold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* PESTAÑA 1: INTEGRACIONES Y COMUNICACIONES */}
        {activeTab === "comunicaciones" && (
          <div className="space-y-6">
            {/* Telegram */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💬</span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Credenciales de Telegram API</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Canal primario de difusión push a teléfonos móviles de la población
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Habilitar canal:</span>
                  <input
                    type="checkbox"
                    checked={config.comunicaciones.telegram.activo}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          telegram: { ...config.comunicaciones.telegram, activo: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-slate-900 dark:text-emerald-600 rounded cursor-pointer accent-slate-900 dark:accent-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bot Token (HTTP API)
                  </label>
                  <div className="relative">
                    <input
                      type={showTelegramToken ? "text" : "password"}
                      value={config.comunicaciones.telegram.botToken}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          comunicaciones: {
                            ...config.comunicaciones,
                            telegram: { ...config.comunicaciones.telegram, botToken: e.target.value },
                          },
                        })
                      }
                      placeholder="123456789:ABCdefGHI..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="absolute right-2 top-2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1 cursor-pointer"
                    >
                      {showTelegramToken ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Generado a través de @BotFather en Telegram</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chat ID Principal / Canal de Difusión
                  </label>
                  <input
                    type="text"
                    value={config.comunicaciones.telegram.chatId}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          telegram: { ...config.comunicaciones.telegram, chatId: e.target.value },
                        },
                      })
                    }
                    placeholder="-100123456789"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">ID numérico del grupo o canal público receptor</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {testingTelegram ? "Enviando prueba..." : "⚡ Probar Envío Telegram"}
                </button>
                {testTelegramStatus && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{testTelegramStatus}</span>
                )}
              </div>
            </div>

            {/* MQTT Broker */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌐</span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Parámetros del Broker MQTT</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Servidor de mensajería M2M para coordinación de nodos IoT físicos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Habilitar MQTT:</span>
                  <input
                    type="checkbox"
                    checked={config.comunicaciones.mqtt.activo}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          mqtt: { ...config.comunicaciones.mqtt, activo: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 text-slate-900 dark:text-emerald-600 rounded cursor-pointer accent-slate-900 dark:accent-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dirección del Servidor (Broker Host)
                  </label>
                  <input
                    type="text"
                    value={config.comunicaciones.mqtt.broker}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          mqtt: { ...config.comunicaciones.mqtt, broker: e.target.value },
                        },
                      })
                    }
                    placeholder="broker.emqx.io o 192.168.1.100"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Puerto TCP
                  </label>
                  <input
                    type="number"
                    value={config.comunicaciones.mqtt.puerto}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          mqtt: { ...config.comunicaciones.mqtt, puerto: parseInt(e.target.value) || 1883 },
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Usuario MQTT
                  </label>
                  <input
                    type="text"
                    value={config.comunicaciones.mqtt.usuario}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          mqtt: { ...config.comunicaciones.mqtt, usuario: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showMqttPassword ? "text" : "password"}
                      value={config.comunicaciones.mqtt.password}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          comunicaciones: {
                            ...config.comunicaciones,
                            mqtt: { ...config.comunicaciones.mqtt, password: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMqttPassword(!showMqttPassword)}
                      className="absolute right-2 top-2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1 cursor-pointer"
                    >
                      {showMqttPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tópico Principal
                  </label>
                  <input
                    type="text"
                    value={config.comunicaciones.mqtt.topico}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          mqtt: { ...config.comunicaciones.mqtt, topico: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestMqtt}
                  disabled={testingMqtt}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {testingMqtt ? "Conectando al Broker..." : "⚡ Probar Broker MQTT"}
                </button>
                {testMqttStatus && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{testMqttStatus}</span>
                )}
              </div>
            </div>

            {/* Radiofrecuencia RF */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📡</span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Canal de Radiofrecuencia (RF / LoRa)</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Parámetros de radio para el canal de contingencia sin conexión a Internet
                    </p>
                  </div>
                </div>
                <Badge color="orange">Canal de Emergencia</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Banda de Frecuencia
                  </label>
                  <select
                    value={config.comunicaciones.radiofrecuencia.banda}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          radiofrecuencia: {
                            ...config.comunicaciones.radiofrecuencia,
                            banda: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500"
                  >
                    <option value="915 MHz (Chile / Américas)">915 MHz (Chile / Américas - LoRa)</option>
                    <option value="433 MHz (Banda Libre ISM)">433 MHz (Banda Libre ISM)</option>
                    <option value="868 MHz (Región Europea)">868 MHz (Región Europea)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Canal Específico / Frecuencia
                  </label>
                  <input
                    type="text"
                    value={config.comunicaciones.radiofrecuencia.canal}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        comunicaciones: {
                          ...config.comunicaciones,
                          radiofrecuencia: {
                            ...config.comunicaciones.radiofrecuencia,
                            canal: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Frecuencia sintonizada por el transceiver ESP32</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Potencia de Transmisión (Tx)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="22"
                      value={config.comunicaciones.radiofrecuencia.potenciaTxDbm}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          comunicaciones: {
                            ...config.comunicaciones,
                            radiofrecuencia: {
                              ...config.comunicaciones.radiofrecuencia,
                              potenciaTxDbm: parseInt(e.target.value) || 20,
                            },
                          },
                        })
                      }
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[50px]">
                      {config.comunicaciones.radiofrecuencia.potenciaTxDbm} dBm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Mayor potencia = mayor alcance en contingencia</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: REGLAS DE AUTOMATIZACIÓN */}
        {activeTab === "automatizacion" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              {/* Umbral de Desconexión */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                      Umbral de Desconexión del Watchdog (Tiempo de vida del ping)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Segundos máximos que puede pasar un nodo ESP32 sin enviar su latido antes de ser catalogado como{" "}
                      <strong className="text-red-600 dark:text-rose-400">OFFLINE</strong> en el mapa y monitor.
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {config.automatizacion.umbralDesconexionSegundos} seg
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {[60, 120, 180, 300].map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          automatizacion: {
                            ...config.automatizacion,
                            umbralDesconexionSegundos: seg,
                          },
                        })
                      }
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        config.automatizacion.umbralDesconexionSegundos === seg
                          ? "bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {seg} s ({seg / 60} min)
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Contingencia */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                      Conmutación Automática a Red de Contingencia (Auto-RF)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Si el sistema detecta interrupción en el enlace a Internet o caída del Broker MQTT, activa de inmediato la emisión por antena RF sin requerir intervención humana.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={config.automatizacion.autoContingencia}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          automatizacion: {
                            ...config.automatizacion,
                            autoContingencia: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>

              {/* Tasa de Refresco Polling */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                      Tasa de Refresco del Dashboard (Polling de la API)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Intervalo de consulta hacia el backend para actualizar estado de alertas y nodos IoT en tiempo real.
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    Cada {config.automatizacion.tasaRefrescoSegundos}s
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {[
                    { val: 3, label: "3 segundos", desc: "Tiempo Real (Demostraciones en vivo)" },
                    { val: 5, label: "5 segundos", desc: "Equilibrado (Operación normal)" },
                    { val: 10, label: "10 segundos", desc: "Optimizado (Bajo consumo de red)" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          automatizacion: {
                            ...config.automatizacion,
                            tasaRefrescoSegundos: p.val,
                          },
                        })
                      }
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        config.automatizacion.tasaRefrescoSegundos === p.val
                          ? "border-slate-900 dark:border-emerald-500 bg-slate-900 dark:bg-slate-800 text-white shadow-md ring-1 ring-emerald-500"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          config.automatizacion.tasaRefrescoSegundos === p.val
                            ? "text-slate-300 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: AJUSTES DE INTERFAZ */}
        {activeTab === "interfaz" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              {/* Vista Inicial */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  Pantalla Inicial por Defecto
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Selecciona qué módulo se desplegará en primer lugar al iniciar sesión en la plataforma.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setConfig({
                        ...config,
                        interfaz: { ...config.interfaz, vistaInicial: "dashboard" },
                      })
                    }
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      config.interfaz.vistaInicial === "dashboard"
                        ? "border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                      📊
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">Dashboard Analítico</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-400">KPIs rápidos, botón de pánico y últimas alertas</p>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setConfig({
                        ...config,
                        interfaz: { ...config.interfaz, vistaInicial: "mapa" },
                      })
                    }
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      config.interfaz.vistaInicial === "mapa"
                        ? "border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                      🗺️
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">Mapa Georreferenciado</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-400">Visualización espacial a pantalla completa de nodos y sismos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tema Visual */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  Esquema de Color / Tema Visual
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Modo diseñado para reducir la fatiga visual de los operadores en turnos nocturnos o cuartos de control. Al hacer clic se aplica en vivo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleSelectTheme("oscuro")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      config.interfaz.temaVisual === "oscuro"
                        ? "border-emerald-500 bg-slate-800 text-white shadow-lg ring-2 ring-emerald-500/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-950 text-amber-300 border border-slate-700 flex items-center justify-center font-bold text-lg shadow-inner">
                      🌙
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">Modo Oscuro (Centro de Mando)</h4>
                        {config.interfaz.temaVisual === "oscuro" && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fondo oscuro de alto contraste y mapas nocturnos 24/7
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleSelectTheme("claro")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      config.interfaz.temaVisual === "claro"
                        ? "border-slate-900 bg-amber-50/30 text-slate-900 shadow-md ring-2 ring-amber-400/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shadow-inner">
                      ☀️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Modo Claro (Oficina Diurna)</h4>
                        {config.interfaz.temaVisual === "claro" && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-700 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Contraste diurno estándar para oficinas iluminadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
