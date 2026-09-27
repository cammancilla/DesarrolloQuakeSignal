export interface SismicAlert {
  id: string;
  tipo: string;
  intensidad: string;
  ubicacion: string;
  fecha: string;
  activa: boolean;
  despachada: boolean;
}

export type CommMode = "normal" | "contingencia";s