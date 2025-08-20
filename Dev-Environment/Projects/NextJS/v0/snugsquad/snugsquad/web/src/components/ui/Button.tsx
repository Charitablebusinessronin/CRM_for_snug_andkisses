import React from 'react';
import { cn } from '@/lib/utils';

// Button variants following Allura's design system
const buttonVariants = {
  primary: 'bg-brand-primary text-brand-on hover:shadow-md hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-semantic-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'bg-semantic-muted text-semantic-fg border border-semantic-border hover:bg-semantic-border hover:shadow-sm transition-all duration-200 focus:ring-2 focus:ring-semantic-ring focus:outline-none',
  icon: 'w-10 h-10 bg-semantic-muted hover:bg-semantic-border hover:shadow-sm focus:ring-2 focus:ring-semantic-ring focus:outline-none'
};

// Button sizes
const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'font-ui font-semibold rounded-lg inline-flex items-center justify-center transition-all duration-200';
    
    const classes = cn(
      baseClasses,
      buttonVariants[variant],
      variant !== 'icon' && buttonSizes[size],
      className
    );

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Specific button components for common use cases
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button {...props} variant="primary" ref={ref} />
);

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button {...props} variant="secondary" ref={ref} />
);

export const IconButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant' | 'size'>>(
  (props, ref) => <Button {...props} variant="icon" ref={ref} />
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
IconButton.displayName = 'IconButton';
