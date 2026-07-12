import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { post } from '../utils/http';
import type { ApiResponse } from '../utils/http';

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadAuth(): AuthState {
  try {
    const stored = localStorage.getItem('quzzzz-auth');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { admin: null, accessToken: null, refreshToken: null };
}

function saveAuth(state: AuthState) {
  localStorage.setItem('quzzzz-auth', JSON.stringify(state));
}

function clearAuth() {
  localStorage.removeItem('quzzzz-auth');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuth);

  const login = useCallback(async (email: string, password: string) => {
    const res: ApiResponse<{ admin: Admin; accessToken: string; refreshToken: string }> =
      await post('/auth/login', { email, password });

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Login failed');
    }

    const newState = {
      admin: res.data.admin,
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    };
    setState(newState);
    saveAuth(newState);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res: ApiResponse<{ admin: Admin; accessToken: string; refreshToken: string }> =
      await post('/auth/register', { name, email, password });

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Registration failed');
    }

    const newState = {
      admin: res.data.admin,
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    };
    setState(newState);
    saveAuth(newState);
  }, []);

  const logout = useCallback(() => {
    post('/auth/logout', {}).catch(() => {});
    setState({ admin: null, accessToken: null, refreshToken: null });
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        isAuthenticated: !!state.admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
