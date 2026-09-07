export default function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    red: "bg-red-100 text-red-700 border border-red-200",
    green: "bg-green-100 text-green-700 border border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border border-orange-200",
    gray: "bg-gray-100 text-gray-500 border border-gray-200",
    blue: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium font-mono ${styles[color]}`}>
      {children}
    </span>
  );
}