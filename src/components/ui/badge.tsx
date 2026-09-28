import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'arton' | 'mana' | 'emerald' | 'slate' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'gold',
  children,
  ...props
}) => {
  const variantStyles = {
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    arton: 'bg-red-500/10 text-red-400 border-red-500/30',
    mana: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border tracking-wide uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
