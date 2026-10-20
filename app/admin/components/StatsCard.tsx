'use client';

import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}

export default function StatsCard({ icon, label, value, color }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center gap-2.5 sm:gap-4 min-w-0">
      <div
        className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 text-sm sm:text-xl font-bold border transition-all"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}35`,
          color,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base sm:text-2xl font-extrabold tracking-tight leading-none truncate" style={{ color }}>
          {value.toLocaleString()}
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 truncate">
          {label}
        </div>
      </div>
    </div>
  );
}
