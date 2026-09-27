import { useConfig } from "../context/ConfigContext";

export default function SaveToast() {
  const { toastMessage } = useConfig();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-400 backdrop-blur-md">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-base shadow-sm">
          ✓
        </div>
        <div>
          <div className="font-bold text-sm leading-tight text-white tracking-wide">
            Cambios Guardados
          </div>
          <div className="text-xs text-emerald-100 font-medium mt-0.5">
            {toastMessage.includes(":") ? toastMessage.split(":")[1].trim() : toastMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
