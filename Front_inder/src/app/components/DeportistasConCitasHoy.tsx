import React from 'react';
import { useCitasDelDia } from '../hooks/useCitasDelDia';
import { Deportista, citasService } from '../services/apiClient';
import { Clock, Activity, CheckCircle } from 'lucide-react';

/**
 * Componente que muestra los deportistas que tienen citas agendadas para hoy
 * con opción de iniciar historia clínica directamente
 */
interface DeportistasConCitasHoyProps {
  onSelectDeportista?: (deportista: Deportista) => void;
}

export const DeportistasConCitasHoy: React.FC<DeportistasConCitasHoyProps> = ({ 
  onSelectDeportista 
}) => {
  const { deportistas, loading, error } = useCitasDelDia();

  console.log("🔍 DeportistasConCitasHoy renderizado - loading:", loading, "deportistas:", deportistas?.length, "error:", error);

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-600">Cargando deportistas con citas para hoy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (deportistas.length === 0) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700">No hay deportistas con citas agendadas para hoy</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        📅 Deportistas con Citas Hoy ({deportistas.length})
      </h3>
      <div className="space-y-3">
        {deportistas.map((dep) => (
          <div
            key={dep.id}
            className="border border-blue-300 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 transition-all cursor-pointer group"
            onClick={() => onSelectDeportista?.(dep)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {dep.apellidos}, {dep.nombres}
                </p>
                <p className="text-sm text-gray-600">
                  Doc: {dep.numero_documento}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDeportista?.(dep);
                }}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
              >
                Iniciar Historia
              </button>
            </div>
            
            {/* Información de la cita */}
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-xs">Hora</p>
                  <p className="font-medium text-gray-800">{dep.cita_hora || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-xs">Tipo de cita</p>
                  <p className="font-medium text-gray-800">{dep.cita_tipo || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-xs">Deporte</p>
                  <p className="font-medium text-gray-800">{dep.cita_deporte || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
