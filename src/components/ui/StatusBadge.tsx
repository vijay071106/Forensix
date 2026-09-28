import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'healthy' | 'warning' | 'critical' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  showIcon = true,
}) => {
  // Determine variant if not explicitly provided
  let computedVariant = variant;
  if (!computedVariant) {
    const s = status.toUpperCase();
    if (s.includes('VERIFIED') || s.includes('HEALTHY') || s.includes('RECOVERED') || s.includes('CONSISTENT')) {
      computedVariant = 'healthy';
    } else if (s.includes('REVIEW') || s.includes('WARNING') || s.includes('DRIFT') || s.includes('INCONSISTENCY')) {
      computedVariant = 'warning';
    } else if (s.includes('CORRUPTED') || s.includes('CRITICAL') || s.includes('BREACH') || s.includes('ANOMALY')) {
      computedVariant = 'critical';
    } else if (s.includes('ANALYSIS') || s.includes('PROGRESS') || s.includes('ACTIVE')) {
      computedVariant = 'info';
    } else {
      computedVariant = 'neutral';
    }
  }

  const colorStyles = {
    healthy: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    critical: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    info: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  }[computedVariant];

  const iconMap = {
    healthy: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-emerald-400" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-400" />,
    critical: <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-rose-400" />,
    info: <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0 text-sky-400" />,
    neutral: <Info className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-400" />,
  }[computedVariant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      id={`badge-${status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center rounded border tracking-wide uppercase font-mono whitespace-nowrap ${colorStyles} ${sizeStyles}`}
    >
      {showIcon && iconMap}
      {status}
    </span>
  );
};
