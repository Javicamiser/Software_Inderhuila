// features/reportes/components/TablaMedicos.tsx

import type { MedicoCarga } from '../types';

interface Props { data: MedicoCarga[] }

export function TablaMedicos({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Carga de trabajo por médico</h3>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Médico</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Historias</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Citas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-2.5 px-3 font-medium text-gray-800">{m.medico}</td>
                  <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">{m.historias}</td>
                  <td className="py-2.5 px-3 text-right text-green-600 font-semibold">{m.citas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
