import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService, type SignUpPayload } from '../services/authService';
import type { AuthSession, FiatCurrencyCode } from '../services/types';
import { useCurrency } from './CurrencyContext';
import { FIAT_CATALOG } from '../data/fiatCurrencies';

const STORAGE_KEY = 'haven_mock_auth_profile_v1';

const VALID_FIAT = new Set<string>(FIAT_CATALOG.map((c) => c.code));

function coerceReceiveCurrency(code: string): FiatCurrencyCode {
  if (VALID_FIAT.has(code)) return code as FiatCurrencyCode;
  return 'MYR';
}

type AuthContextValue = {
  isReady: boolean;
  profile: AuthSession | null;
  busy: boolean;
  error: string | null;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mock auth gate: persists a profile locally so QA can relaunch without re-entering details.
 * Replace with device attestation + BaaS OAuth before going live.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setHomeCurrency } = useCurrency();
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<AuthSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as AuthSession;
          const receiveCurrency = coerceReceiveCurrency(parsed.receiveCurrency);
          const profileRow: AuthSession = { ...parsed, receiveCurrency };
          setProfile(profileRow);
          setHomeCurrency(receiveCurrency);
          if (receiveCurrency !== parsed.receiveCurrency) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileRow));
          }
        }
      } catch {
        /* ignore corrupt storage in mock */
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setHomeCurrency]);

  const persist = useCallback(async (session: AuthSession) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const signUp = useCallback(
    async (payload: SignUpPayload) => {
      setBusy(true);
      setError(null);
      try {
        const session = await authService.signUpMock({
          ...payload,
          receiveCurrency: coerceReceiveCurrency(payload.receiveCurrency),
        });
        setProfile(session);
        setHomeCurrency(session.receiveCurrency);
        await persist(session);
      } catch (e) {
        setError(einstMessage(e));
      } finally {
        setBusy(false);
      }
    },
    [persist, setHomeCurrency],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setBusy(true);
      setError(null);
      try {
        const e = email.trim().toLowerCase();
        if (!e.includes('@') || password.length < 4) {
          setError('Use a valid email and a password of at least 4 characters.');
          return;
        }
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setError('No account on this device yet — create one with “Create account”.');
          return;
        }
        const stored = JSON.parse(raw) as AuthSession;
        if (stored.email !== e) {
          setError('That email does not match this device’s saved profile (mock).');
          return;
        }
        await authService.signInMock(email, password);
        setProfile(stored);
        setHomeCurrency(stored.receiveCurrency);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setBusy(false);
      }
    },
    [setHomeCurrency],
  );

  const signOut = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProfile(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      isReady,
      profile,
      busy,
      error,
      signUp,
      signIn,
      signOut,
      clearError,
    }),
    [isReady, profile, busy, error, signUp, signIn, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

function einstMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.';
}
