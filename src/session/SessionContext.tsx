import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
type DemoRole = Extract<ApiAuthUser['role'], 'client' | 'provider' | 'admin'>;
type EditableAccountProfile = Pick<ApiAuthUser, 'fullName' | 'phone'>;
const PROFILE_OVERRIDES_KEY = 'biscato:profile-overrides:v1';

function readProfileOverride(userId: string): Partial<EditableAccountProfile> {
  try {
    const saved = window.localStorage.getItem(PROFILE_OVERRIDES_KEY);
    const allOverrides = saved ? JSON.parse(saved) as Record<string, Partial<EditableAccountProfile>> : {};
    return allOverrides[userId] ?? {};
  } catch {
    return {};
  }
}

function applyProfileOverride(account: ApiAuthUser): ApiAuthUser {
  return { ...account, ...readProfileOverride(account.id) };
}

interface SessionContextValue {
  user: ApiAuthUser | null;
  status: SessionStatus;
  isDemoSession: boolean;
  login: (body: LoginBody) => Promise<ApiAuthUser>;
  register: (body: RegisterBody) => Promise<ApiAuthUser>;
  startDemoSession: (role: DemoRole) => ApiAuthUser;
  updateUserProfile: (updates: Partial<EditableAccountProfile>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiAuthUser | null>(null);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [status, setStatus] = useState<SessionStatus>(getAccessToken() ? 'loading' : 'ready');
  const sessionVersion = useRef(0);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!isDemoSession) {
        setUser(null);
        setStatus('ready');
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [isDemoSession]);

  useEffect(() => {
    if (!getAccessToken()) return;
    const controller = new AbortController();
    const initialVersion = sessionVersion.current;
    authApi
      .me(controller.signal)
      .then((account) => {
        if (sessionVersion.current === initialVersion) setUser(applyProfileOverride(account));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted && sessionVersion.current === initialVersion) setStatus('ready');
      });
    return () => controller.abort();
  }, []);

  const startSession = useCallback((session: ApiSession): ApiAuthUser => {
    sessionVersion.current += 1;
    setIsDemoSession(false);
    setAccessToken(session.accessToken);
    const account = applyProfileOverride(session.user);
    setUser(account);
    return account;
  }, []);

  const login = useCallback(
    async (body: LoginBody) => startSession(await authApi.login(body)),
    [startSession],
  );

  const register = useCallback(
    async (body: RegisterBody) => startSession(await authApi.register(body)),
    [startSession],
  );

  const startDemoSession = useCallback((role: DemoRole): ApiAuthUser => {
    sessionVersion.current += 1;
    clearAccessToken();
    const demoUser: ApiAuthUser = {
      id: role === 'client' ? 'demo-client' : role === 'provider' ? 'demo-provider-user' : 'demo-admin-user',
      email: role === 'client' ? 'cliente.demo@biscato.local' : role === 'provider' ? 'prestador.demo@biscato.local' : 'admin.demo@biscato.local',
      phone: null,
      fullName: role === 'client' ? 'Cliente de Demonstração' : role === 'provider' ? 'Prestador de Demonstração' : 'Administrador de Demonstração',
      initials: role === 'client' ? 'CD' : role === 'provider' ? 'PD' : 'AD',
      role,
      identityVerified: role === 'provider' || role === 'admin',
      clientPlanState: null,
      freeTrialEndsAt: null,
      providerId: role === 'provider' ? 'prov-carlos' : null,
      createdAt: new Date().toISOString(),
    };
    setIsDemoSession(true);
    const account = applyProfileOverride(demoUser);
    setUser(account);
    setStatus('ready');
    return account;
  }, []);

  const updateUserProfile = useCallback((updates: Partial<EditableAccountProfile>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...updates };
      try {
        const saved = window.localStorage.getItem(PROFILE_OVERRIDES_KEY);
        const allOverrides = saved ? JSON.parse(saved) as Record<string, Partial<EditableAccountProfile>> : {};
        window.localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify({
          ...allOverrides,
          [current.id]: { ...allOverrides[current.id], ...updates },
        }));
      } catch {
        // Keep the edited profile active until this session ends.
      }
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    sessionVersion.current += 1;
    clearAccessToken();
    setIsDemoSession(false);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, status, isDemoSession, login, register, startDemoSession, updateUserProfile, logout }),
    [user, status, isDemoSession, login, register, startDemoSession, updateUserProfile, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession deve ser usado dentro de SessionProvider');
  return context;
}
