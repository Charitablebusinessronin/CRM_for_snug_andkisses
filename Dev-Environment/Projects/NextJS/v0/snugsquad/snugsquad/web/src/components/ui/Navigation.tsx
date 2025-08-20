"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Navigation Link
export interface NavLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
  active?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ className, children, active, ...props }) => {
  const baseClasses = 'px-3 py-2 rounded-md font-ui font-medium transition-colors duration-200';
  const stateClasses = active 
    ? 'bg-brand-primary text-brand-on' 
    : 'text-semantic-fg hover:text-brand-primary hover:bg-semantic-muted';
  
  const classes = cn(baseClasses, stateClasses, className);

  return (
    <Link className={classes} {...props}>
      {children}
    </Link>
  );
};

// Header Navigation
export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ className, children, ...props }) => {
  const classes = cn(
    'bg-semantic-bg border-b border-semantic-border px-6 py-4',
    className
  );

  return (
    <header className={classes} {...props}>
      {children}
    </header>
  );
};

// Header Brand
export interface HeaderBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const HeaderBrand: React.FC<HeaderBrandProps> = ({ className, children, ...props }) => {
  const classes = cn('flex items-center space-x-3', className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Header Navigation
export interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ className, children, ...props }) => {
  const classes = cn('flex items-center space-x-6', className);

  return (
    <nav className={classes} {...props}>
      {children}
    </nav>
  );
};

// Header Actions
export interface HeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ className, children, ...props }) => {
  const classes = cn('flex items-center space-x-4', className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Main Navigation Component
export interface MainNavigationProps {
  items: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <HeaderNav>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <NavLink 
            key={item.href} 
            href={item.href} 
            active={isActive}
            className="flex items-center space-x-2"
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </HeaderNav>
  );
};

// Breadcrumb Navigation
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<{
    href?: string;
    label: string;
  }>;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className, items, ...props }) => {
  const classes = cn('flex items-center space-x-2 text-sm text-semantic-fg', className);

  return (
    <nav className={classes} aria-label="Breadcrumb" {...props}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-semantic-muted mx-2">/</span>
          )}
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-brand-primary transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-semantic-fg font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Tab Navigation
export interface TabNavigationProps extends React.HTMLAttributes<HTMLElement> {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  className, 
  tabs, 
  activeTab, 
  onTabChange,
  ...props 
}) => {
  const classes = cn('border-b border-semantic-border', className);

  return (
    <div {...props}>
      <nav className={classes}>
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'py-4 px-1 border-b-2 font-ui font-medium text-sm transition-colors duration-200',
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-semantic-fg hover:text-semantic-fg/80 hover:border-semantic-border'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="mt-6">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
