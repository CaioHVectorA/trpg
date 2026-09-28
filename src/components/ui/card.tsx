import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'tabletop' | 'parchment' | 'gold' | 'arton';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'tabletop', children, ...props }, ref) => {
    const variantStyles = {
      tabletop:
        'bg-slate-900/85 backdrop-blur-md border border-amber-500/25 rounded-lg shadow-2xl text-slate-100',
      parchment:
        'bg-[#F7F2E7] text-slate-900 border border-[#D5C4A1] rounded-md shadow-md',
      gold: 'bg-slate-900/90 border border-amber-400/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] rounded-lg text-slate-100',
      arton:
        'bg-red-950/80 border border-red-500/40 shadow-[0_0_15px_rgba(185,28,28,0.25)] rounded-lg text-slate-100',
    };

    return (
      <div
        ref={ref}
        className={cn('transition-all duration-150', variantStyles[variant], className)}
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
    <div ref={ref} className={cn('p-5 pb-3 border-b border-amber-500/15', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-serif text-lg font-bold tracking-wide text-amber-100', className)}
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
