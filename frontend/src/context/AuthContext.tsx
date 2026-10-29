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
  loginAsDemo: (demoRole: 'farmer' | 'admin' | 'gurpreet') => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
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

  const loginWithToken = async (newToken: string) => {
    localStorage.removeItem('is_demo');
    localStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchCurrentUser();
  };

  const loginAsDemo = async (demoRole: 'farmer' | 'admin' | 'gurpreet') => {
    let creds = { email: 'gurpreet@eco.farm', password: 'Gurpreet@123' };
    if (demoRole === 'admin') {
      creds = { email: 'admin@eco.farm', password: '123456' };
    } else if (demoRole === 'farmer') {
      creds = { email: 'farmer@eco.farm', password: '123456' };
    }

    try {
      const data = await authService.login(creds.email, creds.password);
      localStorage.removeItem('is_demo');
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      await fetchCurrentUser();
    } catch {
      // Try with traditional password if custom backend hasn't reloaded yet
      try {
        const fallbackPassword = demoRole === 'admin' ? 'Admin@123456' : 'Farmer@123456';
        const data = await authService.login(creds.email, fallbackPassword);
        localStorage.removeItem('is_demo');
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        await fetchCurrentUser();
        return;
      } catch {
        // Offline fallback: Use client-side demo state
        const selectedUser = demoRole === 'admin' ? DEMO_ADMIN_USER : DEMO_FARMER_USER;
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('is_demo', 'true');
        localStorage.setItem('user', JSON.stringify(selectedUser));
        setToken('demo-token');
        setUser(selectedUser);
      }
    }
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
    localStorage.removeItem('agriquest_token');
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
      loginWithToken,
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
