import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'arton' | 'mana' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      gold: 'bg-gradient-to-b from-amber-500 to-amber-700 text-slate-950 font-semibold border border-amber-400 shadow hover:brightness-110 active:brightness-95 focus-visible:outline-amber-400',
      arton:
        'bg-gradient-to-b from-red-600 to-red-800 text-white font-semibold border border-red-500 shadow hover:brightness-110 active:brightness-95 focus-visible:outline-red-400',
      mana: 'bg-gradient-to-b from-blue-600 to-blue-800 text-white font-semibold border border-blue-400 shadow hover:brightness-110 active:brightness-95 focus-visible:outline-blue-400',
      outline:
        'bg-transparent border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 active:bg-amber-500/20',
      ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
    };

    const sizeStyles = {
      sm: 'px-2.5 py-1 text-xs rounded',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
