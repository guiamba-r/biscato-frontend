import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from '../api/client';
import { authApi } from '../api/endpoints';
import type { ApiAuthUser, ApiSession, LoginBody, RegisterBody } from '../api/types';

type SessionStatus = 'loading' | 'ready';

interface SessionContextValue {
  user: ApiAuthUser | null;
  status: SessionStatus;
  login: (body: LoginBody) => Promise<ApiAuthUser>;
  register: (body: RegisterBody) => Promise<ApiAuthUser>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiAuthUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>(getAccessToken() ? 'loading' : 'ready');

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!getAccessToken()) return;
    const controller = new AbortController();
    authApi
      .me(controller.signal)
      .then(setUser)
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setStatus('ready');
      });
    return () => controller.abort();
  }, []);

  const startSession = useCallback((session: ApiSession): ApiAuthUser => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const login = useCallback(
    async (body: LoginBody) => startSession(await authApi.login(body)),
    [startSession],
  );

  const register = useCallback(
    async (body: RegisterBody) => startSession(await authApi.register(body)),
    [startSession],
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession deve ser usado dentro de SessionProvider');
  return context;
}
