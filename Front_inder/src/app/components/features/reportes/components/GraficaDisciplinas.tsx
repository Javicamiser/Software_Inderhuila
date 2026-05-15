// features/reportes/components/GraficaDisciplinas.tsx

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { ChartPoint } from '../types';

const COLORES = ['#0369A1','#16A34A','#DC2626','#D97706','#7C3AED','#DB2777','#0891B2','#65A30D'];

interface Props { data: ChartPoint[] }

export function GraficaDisciplinas({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Deportistas por disciplina</h3>
      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              outerRadius={80}
              dataKey="value"
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v: number, _: string, props: any) => [v, props.payload.name]}
            />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => value.length > 18 ? value.slice(0, 16) + '…' : value}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
