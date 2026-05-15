// features/reportes/components/KpiCard.tsx

import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   text: 'text-blue-600'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  text: 'text-green-600'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    text: 'text-red-600'    },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600' },
};

export function KpiCard({ label, value, sub, icon: Icon, color }: KpiCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`${c.bg} rounded-xl p-5 flex items-center gap-4 shadow-sm border border-white`}>
      <div className={`${c.icon} p-3 rounded-lg shrink-0`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
