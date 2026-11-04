// src/screens/NotFoundScreen.tsx
import React from 'react';

export default function NotFoundScreen({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-2">Página o Sección No Encontrada</h2>
      <p className="text-gray-500 mb-4">La ruta o vista a la que intentas acceder no existe.</p>
      {onGoHome && (
        <button 
          onClick={onGoHome}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver al Dashboard
        </button>
      )}
    </div>
  );
}