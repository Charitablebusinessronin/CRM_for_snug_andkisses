'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Header, 
  HeaderBrand, 
  HeaderNav, 
  HeaderActions,
  NavLink,
  PrimaryButton,
  SecondaryButton
} from '@/components/ui';

export function ClientHeader() {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/client-dashboard', label: 'Dashboard' },
    { href: '/client-dashboard/care-plan', label: 'Care Plan' },
    { href: '/client-dashboard/service-requests', label: 'Service Requests' },
    { href: '/client-dashboard/profile', label: 'Profile' }
  ];

  return (
    <Header>
      <HeaderBrand>
        <Link href="/client-dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-brand-on font-ui font-bold text-sm">SS</span>
          </div>
          <span className="text-h4 font-heading text-semantic-fg">SnugSquad</span>
        </Link>
      </HeaderBrand>

      <HeaderNav>
        {navigationItems.map((item) => (
          <NavLink 
            key={item.href} 
            href={item.href}
            active={pathname === item.href}
          >
            {item.label}
          </NavLink>
        ))}
      </HeaderNav>

      <HeaderActions>
        <SecondaryButton size="sm">Help</SecondaryButton>
        <PrimaryButton size="sm">Contact Support</PrimaryButton>
      </HeaderActions>
    </Header>
  );
}
