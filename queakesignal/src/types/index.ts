
export type Screen = "dashboard" | "detail" | "devices" | "historial" | "mapa" | "configuracion" | "profile" | "usuarios" | "login" | "register" | "notFound";

export type UserRole = "admin" | "operador" | "destinatario";

export interface UserSession {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole | string;
}
export type CommMode = "normal" | "contingencia";

export interface Alerta {
  id: string;
  tipo: string;
  intensidad: string;
  ubicacion: string;
  fecha: string;
  activa: boolean;
  despachada: boolean;
  lat?: number;
  lng?: number;
  radioKm?: number;
}

export interface NodoIoT {
  id: string;
  zona: string;
  ubicacion?: string;
  online: boolean;
  last?: string;
  lastPing?: string;
  level?: number;
  lat: number;
  lng: number;
  status?: "online" | "offline";
}

export interface ConfiguracionSistema {
  comunicaciones: {
    telegram: {
      botToken: string;
      chatId: string;
      activo: boolean;
    };
    mqtt: {
      broker: string;
      puerto: number;
      usuario: string;
      password: string;
      topico: string;
      activo: boolean;
    };
    radiofrecuencia: {
      banda: string;
      canal: string;
      frecuenciaMhz: number;
      potenciaTxDbm: number;
      spreadingFactor: string;
    };
  };
  automatizacion: {
    umbralDesconexionSegundos: number;
    autoContingencia: boolean;
    tasaRefrescoSegundos: number;
  };
  interfaz: {
    vistaInicial: "dashboard" | "mapa";
    temaVisual: "oscuro" | "claro";
  };
}

