import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setAuth, setTokens, login as loginApi, getProfile as getProfileApi, loginWithFirebase as loginWithFirebaseApi } from '@/lib/api';

interface AuthState {
  token?: string;
  user?: any;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithFirebase: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateLocalUser: (patch: Partial<any>) => void;
}

export const AuthContext = createContext<AuthState>({
  loading: true,
  login: async () => {},
  loginWithFirebase: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  updateLocalUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | undefined>();
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(true);
  const profileLoadedRef = React.useRef(false);
  const settingProfileRef = React.useRef(false);
  const lastProfileRef = React.useRef<number>(0);
  const consecutiveFailRef = React.useRef<number>(0);
  const circuitOpenRef = React.useRef<number>(0); // timestamp when circuit opened

  const shallowEqual = (a: any, b: any) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) if (a[k] !== b[k]) return false;
    return true;
  };

  // Cross-platform storage helpers: use SecureStore on native, localStorage on web
  const storage = {
    getItem: async (key: string) => {
      if (Platform.OS === 'web') {
        try {
          const ls = (globalThis as any)?.localStorage as Storage | undefined;
          return ls?.getItem?.(key) ?? null;
        } catch { return null; }
      }
      try { return await SecureStore.getItemAsync(key); } catch { return null; }
    },
    setItem: async (key: string, value: string) => {
      if (Platform.OS === 'web') {
        try {
          const ls = (globalThis as any)?.localStorage as Storage | undefined;
          ls?.setItem?.(key, value);
          return;
        } catch { return; }
      }
      try { await SecureStore.setItemAsync(key, value); } catch {}
    },
    deleteItem: async (key: string) => {
      if (Platform.OS === 'web') {
        try {
          const ls = (globalThis as any)?.localStorage as Storage | undefined;
          ls?.removeItem?.(key);
          return;
        } catch { return; }
      }
      try { await SecureStore.deleteItemAsync(key); } catch {}
    },
  } as const;

  // Logout must be declared before we reference it in effects; declare early then define later

  const login = useCallback(async (username: string, password: string) => {
    const { access, refresh } = await loginApi(username, password);
    setToken(access);
    setTokens({ access, refresh });
    await storage.setItem('token', access);
    await storage.setItem('refresh', refresh);
    try {
      settingProfileRef.current = true;
      const prof = await getProfileApi(true);
      setUser((prev: any) => shallowEqual(prev, prof) ? prev : prof);
      await storage.setItem('profile', JSON.stringify(prof));
      profileLoadedRef.current = true;
    } catch { setUser(undefined); await storage.deleteItem('profile'); } finally { settingProfileRef.current = false; }
  }, []);

  const loginWithFirebase = useCallback(async (idToken: string) => {
    const { access, refresh } = await loginWithFirebaseApi(idToken);
    setToken(access);
    setTokens({ access, refresh });
    await storage.setItem('token', access);
    if (refresh) { await storage.setItem('refresh', refresh); } else { await storage.deleteItem('refresh'); }
    try {
      settingProfileRef.current = true;
      const prof = await getProfileApi(true);
      setUser((prev: any) => shallowEqual(prev, prof) ? prev : prof);
      await storage.setItem('profile', JSON.stringify(prof));
      profileLoadedRef.current = true;
    } catch { setUser(undefined); await storage.deleteItem('profile'); } finally { settingProfileRef.current = false; }
  }, []);

  const logout = useCallback(async () => {
    setToken(undefined);
    setUser(undefined);
    setAuth(undefined);
    await storage.deleteItem('token');
    await storage.deleteItem('refresh');
    await storage.deleteItem('profile');
  }, []);

  // Initial bootstrap: load tokens, then (optimistically) profile cache, then refresh from network
  useEffect(() => {
    (async () => {
      const [t, r, cachedProfile] = await Promise.all([
        storage.getItem('token'),
        storage.getItem('refresh'),
        storage.getItem('profile'),
      ]);
      if (cachedProfile) {
        try { setUser(JSON.parse(cachedProfile)); } catch { /* ignore corrupt cache */ }
      }
      if (t) {
        setToken(t);
        setTokens({ access: t, refresh: r || undefined });
        try {
          settingProfileRef.current = true;
          const prof = await getProfileApi();
          consecutiveFailRef.current = 0;
          setUser((prev: any) => shallowEqual(prev, prof) ? prev : prof);
          profileLoadedRef.current = true;
          await storage.setItem('profile', JSON.stringify(prof));
        } catch (e: any) {
          consecutiveFailRef.current += 1;
          if (e?.code === 'UNAUTHORIZED') {
            await logout();
          }
        } finally { settingProfileRef.current = false; }
      }
      setLoading(false);
    })();
  }, [logout]);

  const refreshProfile = useCallback(async (force = false) => {
    if (!token || settingProfileRef.current) return;
    const now = Date.now();
    // Circuit breaker: if we recently opened circuit due to repeated failures, back off (30s)
    if (circuitOpenRef.current && (now - circuitOpenRef.current) < 30000) return;
    if (!force && profileLoadedRef.current && (now - lastProfileRef.current) < 60000) return;
    lastProfileRef.current = now;
    try {
      settingProfileRef.current = true;
      const fresh = await getProfileApi(force);
      consecutiveFailRef.current = 0;
  setUser((prev: any) => shallowEqual(prev, fresh) ? prev : fresh);
  await storage.setItem('profile', JSON.stringify(fresh));
      profileLoadedRef.current = true;
    } catch (e: any) {
      consecutiveFailRef.current += 1;
      if (e?.code === 'UNAUTHORIZED') {
        await logout();
      }
      // Open circuit after 3 consecutive failures to avoid hammering
      if (consecutiveFailRef.current >= 3) {
        circuitOpenRef.current = Date.now();
      }
    } finally { settingProfileRef.current = false; }
  }, [token, logout]);

  const updateLocalUser = useCallback((patch: Partial<any>) => {
    setUser((prev: any) => {
      const next = { ...(prev || {}), ...patch };
      // fire and forget persistence
      (async () => { try { await storage.setItem('profile', JSON.stringify(next)); } catch { /* ignore */ } })();
      return next;
    });
  }, []);

  const value = useMemo(() => ({ token, user, loading, login, loginWithFirebase, logout, refreshProfile, updateLocalUser }), [token, user, loading, login, loginWithFirebase, logout, refreshProfile, updateLocalUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
