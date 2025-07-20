'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'contractor' | 'client' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In a real app, you would validate the session here
        // For now, we'll simulate a loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would be an API call to your authentication service
    try {
      setLoading(true);
      
      // Mock authentication - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual user data from your API
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: email,
        role: 'employee' // Default role, should come from your auth service
      };
      
      setUser(mockUser);
      // In a real app, you would store the auth token in an HTTP-only cookie
      // and redirect based on user role
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear user data and redirect to login
    setUser(null);
    // In a real app, you would also clear the auth token
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
