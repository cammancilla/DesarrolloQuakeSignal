export type Screen = "dashboard" | "detail" | "devices" | "historial" | "mapa";
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