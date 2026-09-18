import { useState, useEffect } from 'react';

// Definimos la estructura de los datos (Si usas JS puro, puedes borrar esta interface)
interface Nodo {
  id: string;
  ubicacion: string;
  status: 'online' | 'offline';
  lastPing: string;
}

export default function Dispositivos() {
  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [estadisticas, setEstadisticas] = useState({ total: 0, online: 0 });
  const [loading, setLoading] = useState(true);

  const fetchNodos = async () => {
    try {
      // Consumimos el endpoint real de nuestro backend
      const response = await fetch('http://localhost:3001/api/nodos/status');
      if (!response.ok) throw new Error('Error al conectar con la API');
      
      const data = await response.json();
      setNodos(data.detalle || []);
      setEstadisticas({ total: data.total, online: data.online });
    } catch (error) {
      console.error("[Dispositivos] Fallo en la lectura:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchNodos();

    // Auto-recarga cada 5 segundos para ver los "pings" en tiempo real
    const interval = setInterval(fetchNodos, 5000);
    return () => clearInterval(interval); // Limpieza al desmontar el componente
  }, []);

  if (loading) return <div className="p-6">Cargando estado de la red IoT...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Monitor de Dispositivos IoT</h1>
        
        {/* Tarjeta de Estadísticas Rápidas */}
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex gap-4">
          <span className="text-slate-600">Total: <strong>{estadisticas.total}</strong></span>
          <span className="text-green-600">Online: <strong>{estadisticas.online}</strong></span>
          <span className="text-red-500">Offline: <strong>{estadisticas.total - estadisticas.online}</strong></span>
        </div>
      </div>

      {/* Grilla de Nodos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodos.map((nodo) => (
          <div key={nodo.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{nodo.id}</h3>
                <p className="text-sm text-slate-500">{nodo.ubicacion}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                nodo.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {nodo.status.toUpperCase()}
              </span>
            </div>
            
            <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
              <span>Último reporte:</span>
              <span>
                {nodo.lastPing 
                  ? new Date(nodo.lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                  : 'Sin datos'}
              </span>
            </div>
          </div>
        ))}

        {nodos.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">
            No hay dispositivos registrados en la red.
          </div>
        )}
      </div>
    </div>
  );
}