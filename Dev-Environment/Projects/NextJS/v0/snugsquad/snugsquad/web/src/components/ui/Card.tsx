import React from 'react';
import { cn } from '@/lib/utils';

// Card variants following Allura's design system
const cardVariants = {
  default: 'bg-semantic-bg border border-semantic-border shadow-sm hover:shadow-md transition-shadow duration-200',
  status: 'bg-semantic-bg border border-semantic-border shadow-sm hover:shadow-md transition-shadow duration-200',
  interactive: 'bg-semantic-bg border border-semantic-border shadow-sm hover:shadow-md hover:border-semantic-ring transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-semantic-ring focus:outline-none'
};

// Status-specific left border colors
const statusColors = {
  active: 'border-l-4 border-l-semantic-success',
  pending: 'border-l-4 border-l-semantic-warning', 
  completed: 'border-l-4 border-l-semantic-success',
  error: 'border-l-4 border-l-semantic-danger'
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'status' | 'interactive';
  status?: 'active' | 'pending' | 'completed' | 'error';
  children: React.ReactNode;
}

export interface InteractiveCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: 'active' | 'pending' | 'completed' | 'error';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', status, children, ...props }, ref) => {
    const baseClasses = 'rounded-xl p-6';
    
    const classes = cn(
      baseClasses,
      cardVariants[variant],
      variant === 'status' && status && statusColors[status],
      className
    );

    // Only render div for non-interactive variants
    if (variant === 'interactive') {
      console.warn('Card: Use InteractiveCard component for interactive cards');
      return null;
    }

    return (
      <div
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Specific card components for common use cases
export const StandardCard = React.forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card {...props} variant="default" ref={ref} />
);

export const StatusCard = React.forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  ({ status, ...props }, ref) => <Card {...props} variant="status" status={status} ref={ref} />
);

export const InteractiveCard = React.forwardRef<HTMLButtonElement, InteractiveCardProps>(
  ({ status, children, ...props }, ref) => (
    <button
      className={cn(
        'rounded-xl p-6 bg-semantic-bg border border-semantic-border shadow-sm hover:shadow-md hover:border-semantic-ring transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-semantic-ring focus:outline-none',
        status && statusColors[status]
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
);

StandardCard.displayName = 'StandardCard';
StatusCard.displayName = 'StatusCard';
InteractiveCard.displayName = 'InteractiveCard';
