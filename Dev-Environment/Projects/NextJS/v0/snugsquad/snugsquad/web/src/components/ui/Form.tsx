import React from 'react';
import { cn } from '@/lib/utils';

// Form field container
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

// Form label
export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const FormLabel: React.FC<FormLabelProps> = ({ className, children, ...props }) => {
  return (
    <label 
      className={cn('block text-sm font-ui font-semibold text-semantic-fg mb-2', className)} 
      {...props}
    >
      {children}
    </label>
  );
};

// Form input
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    const baseClasses = 'w-full border border-semantic-border rounded-md px-3 py-2 bg-semantic-bg placeholder:text-semantic-muted focus:ring-2 focus:ring-semantic-ring focus:border-semantic-ring focus:outline-none transition-colors duration-200';
    const errorClasses = error ? 'border-semantic-danger focus:ring-semantic-danger focus:border-semantic-danger' : '';
    
    const classes = cn(baseClasses, errorClasses, className);

    return (
      <input
        className={classes}
        ref={ref}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

// Form select
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  children: React.ReactNode;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, children, ...props }, ref) => {
    const baseClasses = 'w-full border border-semantic-border rounded-md px-3 py-2 bg-semantic-bg appearance-none bg-no-repeat bg-right pr-10 focus:ring-2 focus:ring-semantic-ring focus:border-semantic-ring focus:outline-none transition-colors duration-200';
    const errorClasses = error ? 'border-semantic-danger focus:ring-semantic-danger focus:border-semantic-danger' : '';
    
    const classes = cn(baseClasses, errorClasses, className);

    return (
      <select
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Form checkbox
export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({ className, label, error, ...props }) => {
  const baseClasses = 'w-4 h-4 text-brand-primary focus:ring-2 focus:ring-semantic-ring rounded';
  const errorClasses = error ? 'border-semantic-danger focus:ring-semantic-danger' : '';
  
  const classes = cn(baseClasses, errorClasses, className);

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        className={classes}
        {...props}
      />
      <span className="ml-2 text-sm text-semantic-fg">{label}</span>
    </label>
  );
};

// Form radio
export interface FormRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export const FormRadio: React.FC<FormRadioProps> = ({ className, label, error, ...props }) => {
  const baseClasses = 'w-4 h-4 text-brand-primary focus:ring-2 focus:ring-semantic-ring';
  const errorClasses = error ? 'border-semantic-danger focus:ring-semantic-danger' : '';
  
  const classes = cn(baseClasses, errorClasses, className);

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="radio"
        className={classes}
        {...props}
      />
      <span className="ml-2 text-sm text-semantic-fg">{label}</span>
    </label>
  );
};

// Form textarea
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => {
    const baseClasses = 'w-full border border-semantic-border rounded-md px-3 py-2 bg-semantic-bg placeholder:text-semantic-muted focus:ring-2 focus:ring-semantic-ring focus:border-semantic-ring focus:outline-none transition-colors duration-200 resize-vertical';
    const errorClasses = error ? 'border-semantic-danger focus:ring-semantic-danger focus:border-semantic-danger' : '';
    
    const classes = cn(baseClasses, errorClasses, className);

    return (
      <textarea
        className={classes}
        ref={ref}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
