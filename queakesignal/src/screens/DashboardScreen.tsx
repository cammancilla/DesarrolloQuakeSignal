import { useState } from "react";
import { CommMode } from "../types";
import StatCard from "../components/StatCard";
import CommStatusCard from "../components/CommStatusCard";
import SantiagoMap from "../components/SantiagoMap";
import HistoryTable from "../components/HistoryTable";
import Badge from "../components/Badge";
import { PhoneNotification, PhoneStatus } from "../components/PhoneMockups";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CpuIcon,
  BellIcon,
  RadioIcon,
  ExternalLinkIcon,
  MapIcon,
} from "../components/icons";

interface DashboardScreenProps {
  onViewDetail?: () => void;
  onNavigateMap?: () => void;
  mode: CommMode;
}

export default function DashboardScreen({
  onViewDetail,
  onNavigateMap,
  mode,
}: DashboardScreenProps) {
  const [panicPressed, setPanicPressed] = useState(false);
  const isContingencia = mode === "contingencia";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-5 transition-colors">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ActivityIcon />}
          label="Estado General"
          value="Normal"
          sub="Sistema funcionando correctamente"
          accent="green"
        />
        <StatCard
          icon={<AlertTriangleIcon />}
          label="Alertas Activas"
          value="1"
          sub="Requiere atención"
          accent="red"
        />
        <StatCard
          icon={<CpuIcon />}
          label="Nodos IoT"
          value={isContingencia ? "11" : "12"}
          sub={isContingencia ? "11/12 Online" : "Online"}
          accent="blue"
        />
        <StatCard
          icon={<ActivityIcon />}
          label="Usuarios / Destinatarios"
          value="248"
          sub="Destinatarios disponibles"
          accent="gray"
        />
      </div>

      <CommStatusCard mode={mode} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activación Rápida */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Activación Rápida</h3>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setPanicPressed(!panicPressed)}
              className={`w-full py-5 rounded-xl flex flex-col items-center gap-2 transition-all font-bold text-white text-sm tracking-wide shadow-lg cursor-pointer ${
                panicPressed
                  ? "bg-red-700 shadow-red-300 dark:shadow-red-950"
                  : "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-red-950"
              }`}
            >
              <BellIcon size={24} />
              BOTÓN DE PÁNICO
              <span className="text-xs font-normal opacity-80">Enviar alerta inmediata</span>
            </button>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center leading-relaxed">
              Al activar esta opción se distribuirá una alerta a los canales configurados.
            </p>
          </div>
        </div>

        {/* Última Alerta */}
        <div
          className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-5 transition-colors ${
            isContingencia ? "border-orange-200 dark:border-orange-800/60" : "border-gray-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Última Alerta</h3>
            <Badge color="red">● ACTIVA</Badge>
          </div>
          <div className="bg-red-50 dark:bg-rose-950/40 border border-red-100 dark:border-rose-900/40 rounded-lg p-3 mb-3">
            <div className="text-red-700 dark:text-rose-300 font-bold text-base mb-1">Terremoto</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-slate-400">
              <span>Intensidad:</span>
              <span className="font-medium text-gray-700 dark:text-slate-200">Moderada</span>
              <span>Ubicación:</span>
              <span className="font-medium text-gray-700 dark:text-slate-200">Santiago, Chile</span>
              <span>Fecha:</span>
              <span className="font-mono text-gray-700 dark:text-slate-200">25/08/2025</span>
              <span>Hora:</span>
              <span className="font-mono text-gray-700 dark:text-slate-200">12:40:15</span>
            </div>
          </div>
          <div className="space-y-1.5 mb-3">
            {isContingencia ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Telegram</span>
                  <span className="font-medium text-red-500 dark:text-rose-400 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">MQTT / Internet</span>
                  <span className="font-medium text-red-500 dark:text-rose-400 font-mono">No disponible</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-orange-100 dark:border-orange-900/40 pt-1.5">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-slate-300 font-medium">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400 font-mono">Distribución activa ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Nodos</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">11/12 recibieron</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Telegram</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">MQTT / IoT</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">Enviado ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                    <RadioIcon size={11} /> RF
                  </span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">Disponible ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Nodos</span>
                  <span className="font-medium text-green-600 dark:text-emerald-400">12/12 recibieron</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onViewDetail}
            className="w-full text-xs py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLinkIcon size={12} />
            Ver detalles
          </button>
        </div>

        {/* Mapa */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Mapa de Cobertura en Tiempo Real</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              GPS Activo
            </span>
          </div>
          <SantiagoMap compact mode={mode} height="290px" />
          <button
            onClick={onNavigateMap}
            className="w-full mt-2.5 text-xs py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MapIcon size={13} />
            Ver mapa interactivo completo
          </button>
        </div>
      </div>

      <HistoryTable />

      {/* Vistas móviles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Vistas Móviles</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">
          Representación de la notificación recibida por el usuario final
        </p>
        <div className="flex gap-8 justify-center flex-wrap">
          <div className="text-center">
            <PhoneNotification />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">Notificación de alerta</p>
          </div>
          <div className="text-center">
            <PhoneStatus />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">Estado del sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
}