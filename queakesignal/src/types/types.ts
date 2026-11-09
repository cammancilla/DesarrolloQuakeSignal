export interface SeismicAlert {
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
  manual?: boolean;
  origen?: string;
  cap?: any;
}

export type CommMode = "normal" | "contingencia";
