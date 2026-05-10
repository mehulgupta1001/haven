import { mockDelay } from './delay';
import type { AuthSession, FiatCurrencyCode } from './types';

export type SignUpPayload = {
  email: string;
  password: string;
  displayName: string;
  receiveCurrency: FiatCurrencyCode;
};

export type AuthService = {
  getSession: () => Promise<AuthSession>;
  signUpMock: (payload: SignUpPayload) => Promise<AuthSession>;
  signInMock: (email: string, password: string) => Promise<AuthSession>;
};

function mockUserIdFromEmail(email: string): string {
  const core = email.split('@')[0]?.slice(0, 8) ?? 'student';
  return `usr_hvn_${core}`;
}

/** Flow 1: university inferred from institution .ac.uk email (blueprint: sign up with university email). */
function universityLabelFromEmail(email: string): string {
  const host = email.trim().toLowerCase().split('@')[1] ?? '';
  if (!host.endsWith('.ac.uk')) return 'UK university';
  const sub = host.replace('.ac.uk', '').split('.')[0] ?? 'university';
  return sub.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const authService: AuthService = {
  async getSession() {
    await mockDelay();
    return {
      userId: 'usr_hvn_guest',
      email: 'student@ucl.ac.uk',
      displayName: 'Student',
      universityName: 'University College London',
      receiveCurrency: 'MYR',
      universityEmailVerified: false,
    };
  },

  async signUpMock(payload: SignUpPayload) {
    await mockDelay();
    const displayName = payload.displayName.trim() || 'Student';
    const e = payload.email.trim().toLowerCase();
    return {
      userId: mockUserIdFromEmail(e),
      email: e,
      displayName,
      universityName: universityLabelFromEmail(e),
      receiveCurrency: payload.receiveCurrency,
      universityEmailVerified: false,
    };
  },

  async signInMock(email: string, password: string) {
    await mockDelay();
    const e = email.trim().toLowerCase();
    if (!e.includes('@') || password.length < 1) {
      throw new Error('Enter a valid email and password.');
    }
    return {
      userId: mockUserIdFromEmail(e),
      email: e,
      displayName: e.split('@')[0] ?? 'Student',
      universityName: universityLabelFromEmail(e),
      receiveCurrency: 'MYR' as FiatCurrencyCode,
      universityEmailVerified: false,
    };
  },
};
