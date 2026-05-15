// features/reportes/components/GraficaCitasMes.tsx

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { ChartPoint } from '../types';

interface Props { data: ChartPoint[] }

export function GraficaCitasMes({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Citas por mes</h3>
      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0369A1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0369A1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: number) => [v, 'Citas']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0369A1"
              strokeWidth={2}
              fill="url(#gradCitas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
