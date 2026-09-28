import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'alert' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-slate-800 hover:border-slate-700',
    alert: 'border-amber-800/60 bg-amber-950/20',
    success: 'border-emerald-800/60 bg-emerald-950/20',
  }[variant];

  const valueColors = {
    default: 'text-slate-100',
    alert: 'text-amber-400',
    success: 'text-emerald-400',
  }[variant];

  return (
    <div
      id={id}
      className={`bg-slate-900/90 border rounded-lg p-4 transition-all duration-150 ${borderColors}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      </div>
      <div className={`text-2xl font-mono font-bold tracking-tight ${valueColors}`}>
        {value}
      </div>
      {subtext && (
        <div className="mt-1 text-xs text-slate-400 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
