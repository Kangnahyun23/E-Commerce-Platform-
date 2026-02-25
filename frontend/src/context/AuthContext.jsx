import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data?.data || null;
        setUser(currentUser);
        if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const login = (nextUser, token) => {
    if (token) localStorage.setItem('token', token);
    if (nextUser) {
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      setUser(nextUser);
      return;
    }
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    setUser,
    initializing,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    login,
    logout,
  }), [initializing, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
