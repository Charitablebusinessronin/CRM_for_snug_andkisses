'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

type UserRole = 'admin' | 'contractor' | 'client' | 'employee';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'contractor', 'client', 'employee'],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check if user has required role
      if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to unauthorized or dashboard based on role
        const roleBasedRedirect = {
          admin: '/admin',
          contractor: '/contractor',
          client: '/client',
          employee: '/employee'
        }[user.role] || '/';
        
        router.push(roleBasedRedirect);
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, router, redirectTo]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
