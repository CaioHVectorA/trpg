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
    gold: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    arton: 'bg-red-500/20 text-red-300 border-red-500/40',
    mana: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'bg-transparent text-slate-300 border-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
