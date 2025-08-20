import React from 'react';
import { cn } from '@/lib/utils';

// Container component
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({ className, children, size = 'lg', ...props }) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  const classes = cn(
    'mx-auto px-4 sm:px-6 lg:px-8',
    sizeClasses[size],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Page Header
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ className, title, subtitle, children, ...props }) => {
  const classes = cn('mb-8', className);

  return (
    <div className={classes} {...props}>
      <div className="mb-4">
        <h1 className="text-h2 font-heading text-semantic-fg mb-2">{title}</h1>
        {subtitle && (
          <p className="text-body text-semantic-fg/70">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center justify-between">
          {children}
        </div>
      )}
    </div>
  );
};

// Section Divider
export interface SectionDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ className, ...props }) => {
  const classes = cn('my-8', className);

  return (
    <div className={classes} {...props}>
      <hr className="border-semantic-border" />
    </div>
  );
};

// Grid Layout
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Grid: React.FC<GridProps> = ({ className, children, cols = 1, gap = 'md', ...props }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapSizes = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const classes = cn(
    'grid',
    gridCols[cols],
    gapSizes[gap],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Flex Layout
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Flex: React.FC<FlexProps> = ({ 
  className, 
  children, 
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = 'nowrap',
  gap = 'md',
  ...props 
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
    nowrap: 'flex-nowrap'
  };

  const gapSizes = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const classes = cn(
    'flex',
    directionClasses[direction],
    justifyClasses[justify],
    alignClasses[align],
    wrapClasses[wrap],
    gapSizes[gap],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Grid
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

export const CardGrid: React.FC<CardGridProps> = ({ className, children, cols = 3, ...props }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const classes = cn(
    'grid gap-6',
    gridCols[cols],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Sidebar Layout
export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  reverse?: boolean;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  className, 
  sidebar, 
  children, 
  sidebarWidth = 'md',
  reverse = false,
  ...props 
}) => {
  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  const layoutClasses = reverse 
    ? 'flex flex-col lg:flex-row-reverse'
    : 'flex flex-col lg:flex-row';

  const classes = cn(
    layoutClasses,
    'gap-6',
    className
  );

  return (
    <div className={classes} {...props}>
      <aside className={cn('lg:flex-shrink-0', widthClasses[sidebarWidth])}>
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
};
