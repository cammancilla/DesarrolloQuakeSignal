export default function StatusDot({ color }: { color: "green" | "red" | "yellow" | "gray" | "orange" }) {
  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  };
  const glow: Record<string, string> = {
    green: "shadow-[0_0_6px_rgba(34,197,94,0.7)]",
    red: "shadow-[0_0_6px_rgba(239,68,68,0.8)]",
    orange: "shadow-[0_0_6px_rgba(249,115,22,0.7)]",
    yellow: "",
    gray: "",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[color]} ${glow[color]}`} />
  );
}
