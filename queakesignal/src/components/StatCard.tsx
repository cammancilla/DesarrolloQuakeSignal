import React from "react";

export default function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "green" | "red" | "blue" | "gray";
}) {
  const accentMap = {
    green: {
      bg: "bg-green-50 dark:bg-emerald-950/50",
      icon: "text-green-600 dark:text-emerald-400",
      val: "text-green-700 dark:text-emerald-300",
    },
    red: {
      bg: "bg-red-50 dark:bg-rose-950/50",
      icon: "text-red-600 dark:text-rose-400",
      val: "text-red-700 dark:text-rose-300",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      icon: "text-blue-600 dark:text-blue-400",
      val: "text-blue-700 dark:text-blue-300",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-slate-800",
      icon: "text-gray-500 dark:text-slate-400",
      val: "text-gray-700 dark:text-slate-200",
    },
  };
  const c = accentMap[accent];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4 transition-colors">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</div>
        <div className={`text-2xl font-bold font-mono ${c.val} mt-0.5`}>{value}</div>
        <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
