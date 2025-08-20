import React from 'react';
import { cn } from '@/lib/utils';

// Status Badge
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'pending' | 'completed' | 'error';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ className, status, children, ...props }) => {
  const statusStyles = {
    active: 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20',
    pending: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
    completed: 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20',
    error: 'bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20'
  };

  const classes = cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-ui font-medium',
    statusStyles[status],
    className
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

// Progress Indicator
export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-100
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  className, 
  progress, 
  showText = true, 
  size = 'md',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const classes = cn(
    'w-full bg-semantic-muted rounded-full relative',
    sizeClasses[size],
    className
  );

  return (
    <div className={classes} {...props}>
      <div 
        className={cn(
          'bg-brand-primary rounded-full transition-all duration-300',
          sizeClasses[size]
        )}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
      {showText && (
        <span className={cn(
          'absolute -top-8 right-0 font-ui text-semantic-fg',
          textSizeClasses[size]
        )}>
          {progress}% Complete
        </span>
      )}
    </div>
  );
};

// Alert Messages
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ className, type, children, icon, ...props }) => {
  const alertStyles = {
    success: 'bg-semantic-success/10 border-semantic-success/20 text-semantic-success',
    error: 'bg-semantic-danger/10 border-semantic-danger/20 text-semantic-danger',
    warning: 'bg-semantic-warning/10 border-semantic-warning/20 text-semantic-warning',
    info: 'bg-semantic-ring/10 border-semantic-ring/20 text-semantic-ring'
  };

  const classes = cn(
    'flex items-center p-4 rounded-lg border',
    alertStyles[type],
    className
  );

  return (
    <div className={classes} {...props}>
      {icon && <span className="mr-3">{icon}</span>}
      <span>{children}</span>
    </div>
  );
};

// Loading Spinner
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  className, 
  size = 'md', 
  text = 'Loading...',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const classes = cn('flex justify-center items-center p-8', className);

  return (
    <div className={classes} {...props}>
      <div className={cn(
        'border-2 border-semantic-border border-t-brand-primary rounded-full animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <span className="ml-3 text-sm text-semantic-fg font-ui">{text}</span>
      )}
    </div>
  );
};

// Skeleton Loading
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className,
  ...props 
}) => {
  const classes = cn(
    'bg-semantic-muted rounded animate-pulse',
    width,
    height,
    className
  );

  return <div className={classes} {...props} />;
};

// Skeleton Card
export const SkeletonCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn('bg-semantic-bg border border-semantic-border rounded-xl p-6', className)} {...props}>
      <Skeleton className="w-3/4 h-6 mb-4" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-2/3 h-4 mb-2" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
};
