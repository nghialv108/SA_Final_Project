import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setWorkspace: (id: string) => void;
  workspaceId: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [workspaceId, setWorkspaceId] = useState(() => localStorage.getItem('workspaceId'));

  const login = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('workspaceId');
    setToken(null);
    setWorkspaceId(null);
  }, []);

  const setWorkspace = useCallback((id: string) => {
    localStorage.setItem('workspaceId', id);
    setWorkspaceId(id);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      login,
      logout,
      setWorkspace,
      workspaceId,
    }),
    [token, login, logout, setWorkspace, workspaceId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
