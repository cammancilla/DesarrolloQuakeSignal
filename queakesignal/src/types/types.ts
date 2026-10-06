export interface SeismicAlert {
  id: string;
  tipo: string;
  intensidad: string;
  ubicacion: string;
  fecha: string;
  activa: boolean;
  despachada: boolean;
}

export type CommMode = "normal" | "contingencia";