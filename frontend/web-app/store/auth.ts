import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = { id: number; email?: string; phone?: string; roles?: string[]; verified?: boolean };

type AuthState = {
  token?: string;
  user?: AuthUser;
  remember: boolean;
  expiresAt?: number; // epoch ms
  setAuth: (p: { token: string; user: AuthUser; remember: boolean; ttlMs: number }) => void;
  logout: () => void;
  isExpired: () => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: undefined,
      user: undefined,
      remember: false,
      expiresAt: undefined,
      setAuth: ({ token, user, remember, ttlMs }) => {
        const expiresAt = Date.now() + ttlMs;
        set({ token, user, remember, expiresAt });
      },
      logout: () => set({ token: undefined, user: undefined, remember: false, expiresAt: undefined }),
      isExpired: () => {
        const exp = get().expiresAt;
        return !!exp && Date.now() > exp;
      },
    }),
    {
      name: 'auth-store',
      version: 1,
      partialize: (s) => ({ token: s.token, user: s.user, remember: s.remember, expiresAt: s.expiresAt }),
    }
  )
);

