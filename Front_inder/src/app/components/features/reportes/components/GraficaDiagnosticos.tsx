// features/reportes/components/GraficaDiagnosticos.tsx

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { DiagnosticoTop } from '../types';

interface Props { data: DiagnosticoTop[] }

const COLORES = ['#0369A1','#0284C7','#0EA5E9','#38BDF8','#7DD3FC'];

export function GraficaDiagnosticos({ data }: Props) {
  const chartData = (data ?? []).map((d) => {
    const nombre = d?.nombre ?? d?.descripcion ?? d?.diagnostico ?? String(d?.codigo ?? '');
    return {
      name: d?.codigo ?? '—',
      label: nombre.length > 30 ? nombre.slice(0, 28) + '…' : nombre,
      value: d?.cantidad ?? 0,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top diagnósticos (CIE-11)</h3>
      {chartData.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={44} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v: number, _: string, props: any) => [v, props?.payload?.label ?? '']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}