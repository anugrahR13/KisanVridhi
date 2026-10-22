import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/appServices';
import { DEMO_FARMER_USER, DEMO_ADMIN_USER } from '../services/demoData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: 'farmer' | 'admin' | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (demoRole: 'farmer' | 'admin') => void;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (localStorage.getItem('is_demo') === 'true') {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        } else {
          setUser(DEMO_FARMER_USER);
        }
        return;
      }
      if (localStorage.getItem('token')) {
        const userData = await authService.getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.removeItem('is_demo');
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    await fetchCurrentUser();
  };

  const loginAsDemo = (demoRole: 'farmer' | 'admin') => {
    const selectedUser = demoRole === 'admin' ? DEMO_ADMIN_USER : DEMO_FARMER_USER;
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('is_demo', 'true');
    localStorage.setItem('user', JSON.stringify(selectedUser));
    setToken('demo-token');
    setUser(selectedUser);
  };

  const register = async (regData: any) => {
    const data = await authService.register(regData);
    localStorage.removeItem('is_demo');
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_demo');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      loginAsDemo,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
