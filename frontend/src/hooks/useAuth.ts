import { useState, useCallback } from 'react';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    // Implementation here
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
}