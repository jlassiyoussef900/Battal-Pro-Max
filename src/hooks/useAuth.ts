import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (data: RegisterData) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role as UserRole,
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          createdAt: new Date(currentUser.created_at),
          lastLogin: new Date(),
        });
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    // Mock login bypass — works without a backend
    const mockUsers: Record<string, { id: string; role: UserRole; firstName: string; lastName: string }> = {
      'jobseeker@test.com': { id: '1', role: 'jobseeker', firstName: 'Alex', lastName: 'Johnson' },
      'company@test.com': { id: '2', role: 'company', firstName: 'Jane', lastName: 'Smith' },
      'demo@test.com': { id: '3', role: 'jobseeker', firstName: 'Demo', lastName: 'User' },
      'new@test.com': { id: '4', role: 'jobseeker', firstName: 'New', lastName: 'User' },
      'admin@test.com': { id: '5', role: 'company', firstName: 'Admin', lastName: 'User' },
    };
    if (mockUsers[email] && password === 'password') {
      const mock = mockUsers[email];
      const mockUser = { id: mock.id, email, role: mock.role, firstName: mock.firstName, lastName: mock.lastName, createdAt: new Date(), lastLogin: new Date() };
      localStorage.setItem('auth_user', JSON.stringify({ ...mockUser, first_name: mock.firstName, last_name: mock.lastName, created_at: new Date().toISOString() }));
      setUser(mockUser);
      setIsLoading(false);
      return { error: null };
    }

    const { data, error } = await signIn(email, password);
    
    if (error) {
      setIsLoading(false);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }

    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        lastLogin: new Date(),
      });
    }
    setIsLoading(false);
    return { error: null };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      setIsLoading(false);
      return { error: new Error('All fields are required') };
    }

    if (data.password.length < 6) {
      setIsLoading(false);
      return { error: new Error('Password must be at least 6 characters') };
    }
    
    const { data: signupData, error } = await signUp(data.email, data.password, {
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
    });

    if (error) {
      setIsLoading(false);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }

    if (signupData?.user) {
      setUser({
        id: signupData.user.id,
        email: signupData.user.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: new Date(),
        lastLogin: new Date(),
      });
    }
    
    setIsLoading(false);
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role as UserRole,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        createdAt: new Date(currentUser.created_at),
        lastLogin: new Date(),
      });
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    switchRole,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
