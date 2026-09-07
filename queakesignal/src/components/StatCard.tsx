export default function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "green" | "red" | "blue" | "gray";
}) {
  const accentMap = {
    green: { bg: "bg-green-50", icon: "text-green-600", val: "text-green-700" },
    red: { bg: "bg-red-50", icon: "text-red-600", val: "text-red-700" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", val: "text-blue-700" },
    gray: { bg: "bg-gray-50", icon: "text-gray-500", val: "text-gray-700" },
  };
  const c = accentMap[accent];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
        <div className={`text-2xl font-bold font-mono ${c.val} mt-0.5`}>{value}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
