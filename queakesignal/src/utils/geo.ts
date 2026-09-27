import { Alerta, NodoIoT } from "../types";

export const UBICACIONES_GEO: Record<string, { lat: number; lng: number; radioKm?: number }> = {
  "Santiago Centro, Chile": { lat: -33.4429, lng: -70.6539, radioKm: 18 },
  "Santiago, Chile": { lat: -33.4429, lng: -70.6539, radioKm: 20 },
  "Santiago Centro, Metropolitana": { lat: -33.4429, lng: -70.6539, radioKm: 18 },
  "Providencia, Chile": { lat: -33.4255, lng: -70.6148, radioKm: 15 },
  "Las Condes, Chile": { lat: -33.4117, lng: -70.5802, radioKm: 15 },
  "San José de Maipo, Metropolitana": { lat: -33.6389, lng: -70.3503, radioKm: 12 },
  "San José de Maipo, Chile": { lat: -33.6389, lng: -70.3503, radioKm: 12 },
  "Viña del Mar, Chile": { lat: -33.0245, lng: -71.5518, radioKm: 16 },
  "Valparaíso, Chile": { lat: -33.0472, lng: -71.6127, radioKm: 16 },
  "Reserva Nacional Lago Peñuelas, Valparaíso": { lat: -33.1583, lng: -71.5333, radioKm: 14 },
  "Concepción, Chile": { lat: -36.8270, lng: -73.0503, radioKm: 30 },
  "Iquique, Chile": { lat: -20.2133, lng: -70.1503, radioKm: 25 },
  "Borde Costero, Coquimbo": { lat: -29.9533, lng: -71.3436, radioKm: 22 },
  "Volcán Villarrica, La Araucanía": { lat: -39.4203, lng: -71.9396, radioKm: 20 },
  "Zona Central, Chile": { lat: -33.4429, lng: -70.6539, radioKm: 25 }
};

// 12 Nodos IoT distribuidos con precisión en el Gran Santiago
export const NODOS_SANTIAGO: NodoIoT[] = [
  { id: "Nodo 01", zona: "Centro", ubicacion: "Santiago Centro — Hall Cívico", online: true, last: "12:40:10", level: 98, lat: -33.4429, lng: -70.6539 },
  { id: "Nodo 02", zona: "Providencia", ubicacion: "Providencia — Pedro de Valdivia", online: true, last: "12:40:12", level: 95, lat: -33.4255, lng: -70.6148 },
  { id: "Nodo 03", zona: "Las Condes", ubicacion: "Las Condes — Apoquindo / Manquehue", online: true, last: "12:40:09", level: 91, lat: -33.4117, lng: -70.5802 },
  { id: "Nodo 04", zona: "Pudahuel", ubicacion: "Pudahuel — Parque Enea / San Pablo", online: false, last: "10:15:33", level: 0, lat: -33.4427, lng: -70.7656 },
  { id: "Nodo 05", zona: "Maipú", ubicacion: "Maipú — Plaza Monumento", online: true, last: "12:40:11", level: 87, lat: -33.5110, lng: -70.7578 },
  { id: "Nodo 06", zona: "La Florida", ubicacion: "La Florida — Bellavista", online: true, last: "12:40:13", level: 93, lat: -33.5227, lng: -70.5983 },
  { id: "Nodo 07", zona: "Ñuñoa", ubicacion: "Ñuñoa — Plaza Ñuñoa Sur", online: true, last: "12:40:08", level: 89, lat: -33.4569, lng: -70.5976 },
  { id: "Nodo 08", zona: "Peñalolén", ubicacion: "Peñalolén — Quebrada de Macul", online: true, last: "12:40:14", level: 96, lat: -33.4831, lng: -70.5475 },
  { id: "Nodo 09", zona: "Recoleta", ubicacion: "Recoleta — Cerro Blanco / Dorsal", online: true, last: "12:40:07", level: 82, lat: -33.4072, lng: -70.6358 },
  { id: "Nodo 10", zona: "Quilicura", ubicacion: "Quilicura — Parque Industrial", online: true, last: "12:40:15", level: 90, lat: -33.3644, lng: -70.7297 },
  { id: "Nodo 11", zona: "Lo Barnechea", ubicacion: "Lo Barnechea — El Rodeo", online: true, last: "12:40:06", level: 78, lat: -33.3547, lng: -70.5186 },
  { id: "Nodo 12", zona: "San Bernardo", ubicacion: "San Bernardo — Plaza de Armas", online: true, last: "12:40:16", level: 94, lat: -33.5922, lng: -70.7047 },
];

/**
 * Retorna las coordenadas geográficas de una alerta, infiriéndolas por ubicación si no vienen en el payload.
 */
export function getCoordenadasAlerta(alerta: Partial<Alerta>): { lat: number; lng: number; radioKm: number } {
  if (alerta.lat !== undefined && alerta.lng !== undefined && !isNaN(alerta.lat) && !isNaN(alerta.lng)) {
    return {
      lat: alerta.lat,
      lng: alerta.lng,
      radioKm: alerta.radioKm || 18,
    };
  }

  const ubi = alerta.ubicacion || "";
  if (UBICACIONES_GEO[ubi]) {
    const geo = UBICACIONES_GEO[ubi];
    return { lat: geo.lat, lng: geo.lng, radioKm: geo.radioKm || 18 };
  }

  // Búsqueda aproximada por coincidencia parcial de texto
  const lower = ubi.toLowerCase();
  for (const [key, val] of Object.entries(UBICACIONES_GEO)) {
    if (lower.includes(key.toLowerCase().split(",")[0].trim())) {
      return { lat: val.lat, lng: val.lng, radioKm: val.radioKm || 18 };
    }
  }

  // Fallback por defecto: Santiago Centro
  return { lat: -33.4429, lng: -70.6539, radioKm: 18 };
}

/**
 * Fórmula de Haversine para calcular distancia en kilómetros entre dos coordenadas.
 */
export function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Encuentra el nodo más cercano a unas coordenadas dadas.
 */
export function obtenerNodoMasCercano(lat: number, lng: number, nodos: NodoIoT[] = NODOS_SANTIAGO) {
  if (!nodos.length) return null;
  let masCercano = nodos[0];
  let distMinima = calcularDistanciaKm(lat, lng, nodos[0].lat, nodos[0].lng);

  for (let i = 1; i < nodos.length; i++) {
    const d = calcularDistanciaKm(lat, lng, nodos[i].lat, nodos[i].lng);
    if (d < distMinima) {
      distMinima = d;
      masCercano = nodos[i];
    }
  }

  return { nodo: masCercano, distanciaKm: distMinima };
}
