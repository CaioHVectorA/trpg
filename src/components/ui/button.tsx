import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'arton' | 'mana' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      gold: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium active:bg-amber-600 focus-visible:outline-amber-400',
      arton:
        'bg-red-600 hover:bg-red-500 text-white font-medium active:bg-red-700 focus-visible:outline-red-400',
      mana: 'bg-blue-600 hover:bg-blue-500 text-white font-medium active:bg-blue-700 focus-visible:outline-blue-400',
      outline:
        'bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 active:bg-slate-800/80',
      ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
    };

    const sizeStyles = {
      sm: 'px-2.5 py-1 text-xs rounded',
      md: 'px-3.5 py-1.5 text-sm rounded-md',
      lg: 'px-5 py-2.5 text-base rounded-md',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none',
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
