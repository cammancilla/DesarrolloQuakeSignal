import { useEffect, useRef, useState, useMemo } from "react";
import * as L from "leaflet";

// Corregir rutas de iconos por defecto de Leaflet en Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import "leaflet/dist/leaflet.css";
import { CommMode, Alerta, NodoIoT } from "../types";
import { RadioIcon } from "./icons";
import {
  NODOS_SANTIAGO,
  getCoordenadasAlerta,
  calcularDistanciaKm,
  obtenerNodoMasCercano,
} from "../utils/geo";

import { useConfig } from "../context/ConfigContext";

interface SantiagoMapProps {
  compact?: boolean;
  mode?: CommMode;
  alerta?: Alerta;
  alertas?: Alerta[];
  nodos?: NodoIoT[];
  height?: string;
  onSelectAlerta?: (alerta: Alerta) => void;
}

// Alerta predeterminada en Santiago Centro para visualización consistente
const ALERTA_DEFAULT: Alerta = {
  id: "ALERT-ACTIVA",
  tipo: "Terremoto",
  intensidad: "Sismo Mayor 7.8 Mw",
  ubicacion: "Santiago Centro, Chile",
  fecha: new Date().toISOString(),
  activa: true,
  despachada: true,
  lat: -33.4429,
  lng: -70.6539,
  radioKm: 18,
};

export default function SantiagoMap({
  compact = false,
  mode = "normal",
  alerta,
  alertas,
  nodos = NODOS_SANTIAGO,
  height,
}: SantiagoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const { isDark } = useConfig();
  const [mapTheme, setMapTheme] = useState<"dark" | "voyager">(() => isDark ? "dark" : "voyager");
  const [showRFCoverage, setShowRFCoverage] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setMapTheme(isDark ? "dark" : "voyager");
  }, [isDark]);

  const isContingencia = mode === "contingencia";

  // Determinar la alerta activa principal
  const alertaActiva: Alerta = useMemo(() => {
    if (alerta) return alerta;
    if (alertas && alertas.length > 0) {
      const encontrada = alertas.find((a) => a.activa) || alertas[0];
      return encontrada;
    }
    return ALERTA_DEFAULT;
  }, [alerta, alertas]);

  const geoAlerta = useMemo(() => {
    return getCoordenadasAlerta(alertaActiva);
  }, [alertaActiva]);

  // Nodo más cercano y proximidad
  const infoProximidad = useMemo(() => {
    return obtenerNodoMasCercano(geoAlerta.lat, geoAlerta.lng, nodos);
  }, [geoAlerta, nodos]);

  // Nodos dentro del radio de impacto
  const nodosEnImpacto = useMemo(() => {
    return nodos.filter((n) => {
      const dist = calcularDistanciaKm(geoAlerta.lat, geoAlerta.lng, n.lat, n.lng);
      return dist <= geoAlerta.radioKm;
    });
  }, [geoAlerta, nodos]);

  // 1. Inicialización del mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-33.448, -70.65],
        zoom: compact ? 11 : 12,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: !compact,
        attributionControl: false,
      });

      // Añadir capa de tiles con la API Key oficial de CARTO (?key=)
      const CARTO_KEY = "cb1_40kj_1_0f712efa28ebcb1947fa1a84";
      const tileUrl =
        mapTheme === "dark"
          ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`
          : `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`;

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      // Si es pantalla completa y zoomControl no está, agregarlo abajo a la derecha
      if (!compact) {
        L.control.zoom({ position: "bottomright" }).addTo(map);
      }

      const layerGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layersGroupRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // 2. Cambio dinámico de capa de mapa (Dark / Voyager) con API Key
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Buscar y reemplazar layer de tile
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const CARTO_KEY = "cb1_40kj_1_0f712efa28ebcb1947fa1a84";
    const tileUrl =
      mapTheme === "dark"
        ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`
        : `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`;

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);
  }, [mapTheme]);

  // 3. Dibujar nodos y alertas en el mapa
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    // A. Radio de impacto de la alerta (Círculo rojo suave)
    if (alertaActiva) {
      const radioMetros = (geoAlerta.radioKm || 18) * 1000;

      const circleImpacto = L.circle([geoAlerta.lat, geoAlerta.lng], {
        radius: radioMetros,
        color: "#ef4444",
        weight: 1.5,
        fillColor: "#ef4444",
        fillOpacity: 0.08,
        dashArray: "4, 6",
      });

      circleImpacto.bindTooltip(
        `Radio estimado de impacto / percepción (${geoAlerta.radioKm} km)`,
        { direction: "top", className: "bg-slate-900 text-white text-xs px-2 py-1 rounded" }
      );
      layerGroup.addLayer(circleImpacto);
    }

    // B. Marcadores de Nodos IoT (Puntos verdes / naranja en contingencia)
    nodos.forEach((nodo) => {
      const isOnline = nodo.online;
      const dist = calcularDistanciaKm(geoAlerta.lat, geoAlerta.lng, nodo.lat, nodo.lng);

      // Círculos de cobertura RF (si está online y está activada la capa)
      if (isOnline && showRFCoverage) {
        const rfCircle = L.circle([nodo.lat, nodo.lng], {
          radius: isContingencia ? 3200 : 2200,
          color: isContingencia ? "#ea580c" : "#16a34a",
          weight: isContingencia ? 1.4 : 1,
          dashArray: "4, 4",
          fillColor: isContingencia ? "#f97316" : "#22c55e",
          fillOpacity: isContingencia ? 0.12 : 0.07,
        });
        layerGroup.addLayer(rfCircle);
      }

      // Marcador visual HTML personalizado
      const colorClase = isOnline
        ? isContingencia
          ? "bg-orange-500 ring-orange-300"
          : "bg-emerald-500 ring-emerald-300"
        : "bg-red-500 ring-red-300";

      const nodeHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 28px; height: 28px; transform: translate(-14px, -14px);">
          ${
            isOnline
              ? `<div class="absolute inset-0 rounded-full ${
                  isContingencia ? "bg-orange-400" : "bg-emerald-400"
                } opacity-30 animate-ping"></div>`
              : ""
          }
          <div class="w-4 h-4 rounded-full ${colorClase} ring-2 shadow-md flex items-center justify-center transition-transform hover:scale-125">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const nodeIcon = L.divIcon({
        html: nodeHtml,
        className: "custom-div-icon",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([nodo.lat, nodo.lng], { icon: nodeIcon });

      const popupHtml = `
        <div class="p-1 space-y-1 text-xs">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1 gap-3">
            <span class="font-bold text-white text-sm">${nodo.id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              isOnline
                ? isContingencia
                  ? "bg-orange-950 text-orange-400 border border-orange-800"
                  : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : "bg-red-950 text-red-400 border border-red-800"
            }">
              ${isOnline ? (isContingencia ? "RF ONLINE" : "ONLINE") : "OFFLINE"}
            </span>
          </div>
          <div class="text-slate-300 font-medium">${nodo.ubicacion || nodo.zona}</div>
          <div class="flex justify-between text-slate-400 pt-1">
            <span>Distancia a la alerta:</span>
            <span class="font-mono text-white font-bold">${dist} km</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Batería / Nivel:</span>
            <span class="font-mono text-emerald-400 font-semibold">${nodo.level || 90}%</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Última conexión:</span>
            <span class="font-mono text-slate-300">${nodo.last || "En línea"}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      layerGroup.addLayer(marker);
    });

    // C. Marcador de la Alerta Activa (Punto Rojo con Radar Pulsante)
    if (alertaActiva) {
      const alertHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="width: 60px; height: 60px; transform: translate(-30px, -30px);">
          <div class="absolute inset-0 rounded-full bg-red-500 opacity-40 radar-wave-1"></div>
          <div class="absolute inset-0 rounded-full bg-red-600 opacity-30 radar-wave-2"></div>
          <div class="relative w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center z-10 transition-transform hover:scale-125">
            <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
      `;

      const alertIcon = L.divIcon({
        html: alertHtml,
        className: "custom-div-icon",
        iconSize: [60, 60],
        iconAnchor: [30, 30],
      });

      const alertMarker = L.marker([geoAlerta.lat, geoAlerta.lng], {
        icon: alertIcon,
        zIndexOffset: 1000,
      });

      const alertPopupHtml = `
        <div class="p-1 space-y-1.5 text-xs min-w-[210px]">
          <div class="flex items-center justify-between border-b border-red-900/60 pb-1.5">
            <span class="font-bold text-red-400 text-sm flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              ${alertaActiva.tipo}
            </span>
            <span class="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
              ACTIVA
            </span>
          </div>
          <div class="text-white font-semibold text-xs">${alertaActiva.intensidad}</div>
          <div class="text-slate-300 text-[11px]">${alertaActiva.ubicacion}</div>
          <div class="bg-slate-800/80 p-1.5 rounded border border-slate-700/60 text-[11px] text-slate-300">
            <div>📍 Coordenadas: <span class="font-mono text-white">${geoAlerta.lat.toFixed(4)}, ${geoAlerta.lng.toFixed(4)}</span></div>
            <div>⚡ Radio estimado: <span class="font-mono text-amber-400 font-bold">${geoAlerta.radioKm} km</span></div>
            ${
              infoProximidad
                ? `<div class="mt-1 pt-1 border-t border-slate-700">Nodo más cercano: <span class="text-emerald-400 font-semibold">${infoProximidad.nodo.id}</span> (${infoProximidad.distanciaKm} km)</div>`
                : ""
            }
          </div>
        </div>
      `;

      alertMarker.bindPopup(alertPopupHtml);
      layerGroup.addLayer(alertMarker);
    }
  }, [isMapReady, alertaActiva, geoAlerta, nodos, showRFCoverage, isContingencia, infoProximidad]);

  // Funciones de Zoom y Navegación
  const handleZoomAlerta = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([geoAlerta.lat, geoAlerta.lng], 14, {
      duration: 1.4,
    });
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([-33.448, -70.65], compact ? 11 : 12, {
      duration: 1.2,
    });
  };

  return (
    <div className="relative w-full flex flex-col rounded-xl overflow-hidden border border-slate-700/70 shadow-lg bg-slate-900">
      {/* Barra de Proximidad y Controles del Mapa */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="truncate">{alertaActiva.tipo}: {alertaActiva.ubicacion}</span>
          </span>
          {infoProximidad && (
            <span className="hidden sm:inline-block text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              Proximidad: {infoProximidad.distanciaKm} km ({infoProximidad.nodo.id})
            </span>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Botón ZOOM A LA ALERTA */}
          <button
            onClick={handleZoomAlerta}
            title="Hacer zoom directo al punto donde se genera la alerta"
            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <span>🎯</span>
            <span>Zoom a la alerta</span>
          </button>

          {/* Botón Ver Red Completa */}
          <button
            onClick={handleResetView}
            title="Restablecer vista a la red general de Santiago"
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Vista General
          </button>

          {/* Alternar Cobertura RF */}
          <button
            onClick={() => setShowRFCoverage(!showRFCoverage)}
            title="Alternar círculos de cobertura de radiofrecuencia"
            className={`px-2 py-1 rounded-lg font-medium text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
              showRFCoverage
                ? isContingencia
                  ? "bg-orange-950/80 text-orange-300 border-orange-700"
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <RadioIcon size={12} />
            <span className="hidden md:inline">Cobertura RF</span>
          </button>

          {/* Alternar Tema del Mapa (Oscuro / Claro) */}
          <button
            onClick={() => setMapTheme(mapTheme === "dark" ? "voyager" : "dark")}
            title="Cambiar capa de mapa (Oscuro / Claro)"
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            {mapTheme === "dark" ? "🌙 Modo Oscuro" : "🗺️ Calles (Voyager)"}
          </button>
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div
        ref={mapContainerRef}
        className={`w-full quakesignal-map-container ${mapTheme === "dark" ? "dark-tiles" : ""}`}
        style={{
          height: height || (compact ? "320px" : "540px"),
          zIndex: 1,
        }}
      />

      {/* Leyenda interactiva inferior */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-400/40 animate-pulse"></span>
            <span>Alerta activa ({alertaActiva.tipo})</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isContingencia ? "bg-orange-500" : "bg-emerald-500"
              }`}
            ></span>
            <span>Nodo {isContingencia ? "RF (Contingencia)" : "Online"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 border border-slate-600"></span>
            <span>Nodo Offline</span>
          </span>
          {showRFCoverage && (
            <span className="flex items-center gap-1 text-slate-400">
              <span
                className={`inline-block w-3 border-t-2 border-dashed ${
                  isContingencia ? "border-orange-400" : "border-emerald-400"
                }`}
              ></span>
              <span>Rango Cobertura RF (~2.2 km)</span>
            </span>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          Nodos en rango de impacto: {nodosEnImpacto.length} de {nodos.length}
        </div>
      </div>
    </div>
  );
}

export function MapLegend({ mode }: { mode: CommMode }) {
  const isContingencia = mode === "contingencia";
  return (
    <div className="flex items-center gap-5 mt-3 text-xs text-gray-500 flex-wrap">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        <span>Alerta activa</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${isContingencia ? "bg-orange-500" : "bg-emerald-500"}`}></span>
        <span>Nodo {isContingencia ? "(RF)" : "online"}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
        <span>Nodo offline</span>
      </span>
      <span className="flex items-center gap-1">
        <RadioIcon size={11} /> Cobertura RF
      </span>
    </div>
  );
}
