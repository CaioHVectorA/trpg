import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'tabletop' | 'parchment' | 'gold' | 'arton';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'tabletop', children, ...props }, ref) => {
    const variantStyles = {
      tabletop:
        'bg-slate-900 border border-slate-800 rounded-lg text-slate-100',
      parchment:
        'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-lg',
      gold: 'bg-slate-900 border border-amber-500/30 rounded-lg text-slate-100',
      arton:
        'bg-slate-900 border border-red-500/30 rounded-lg text-slate-100',
    };

    return (
      <div
        ref={ref}
        className={cn('transition-colors duration-150', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pb-3 border-b border-slate-800/80', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-sans text-base font-semibold tracking-tight text-slate-100', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
