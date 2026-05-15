// features/reportes/components/TablaNoAptos.tsx

import { useState, useEffect } from 'react';
import { UserX, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { api } from '@/app/services/apiClient';

interface DeportistaNoApto {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento?: string;
  tipo_deporte?: string;
  disciplina?: string;
  tipo_aptitud?: string;
  restricciones?: string;
  fecha_historia?: string;
  medico?: string;
  [key: string]: any;
}

interface Props {
  count: number; // conteo ya conocido del dashboard
}

export function TablaNoAptos({ count }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [lista, setLista] = useState<DeportistaNoApto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargado, setCargado] = useState(false);

  const cargar = async () => {
    if (cargado) return;
    try {
      setCargando(true);
      const { data } = await api.get('/reportes/deportistas/no-aptos');
      setLista(Array.isArray(data) ? data : data?.items ?? []);
      setCargado(true);
    } catch (err) {
      console.error('Error cargando no aptos:', err);
    } finally {
      setCargando(false);
    }
  };

  const toggle = () => {
    if (!abierto && !cargado) cargar();
    setAbierto((v) => !v);
  };

  if (count === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-100">
      {/* Header clickeable */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-red-50 transition rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Deportistas no aptos
            </p>
            <p className="text-xs text-gray-500">
              {count} {count === 1 ? 'deportista' : 'deportistas'} con restricción médica activa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            {count}
          </span>
          {abierto
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Tabla expandible */}
      {abierto && (
        <div className="border-t border-red-100 px-5 pb-5">
          {cargando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
            </div>
          ) : lista.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin datos disponibles</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Deportista</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Documento</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Disciplina</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo aptitud</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Restricciones</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((d, i) => (
                    <tr key={d.id ?? i} className="border-b border-gray-50 hover:bg-red-50 transition">
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {d.nombres ?? ''} {d.apellidos ?? ''}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {d.numero_documento ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {d.tipo_deporte ?? d.disciplina ?? '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          {d.tipo_aptitud ?? 'No apto'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 max-w-xs truncate">
                        {d.restricciones ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                        {d.fecha_historia
                          ? new Date(d.fecha_historia).toLocaleDateString('es-CO')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}