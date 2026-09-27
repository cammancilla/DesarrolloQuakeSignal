import HistoryTable from "../components/HistoryTable.tsx";

export default function HistorialScreen() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <HistoryTable />
    </div>
  );
}
