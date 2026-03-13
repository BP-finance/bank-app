/**
 * Store de autenticação.
 * Responsável por: session state, authenticated user, logout.
 * loadStoredSession usa sessionManager.restore() para obter usuário real via /me.
 *
 * Suporta erro tipado (AuthError) para lógica condicional na UI.
 */

import { create } from "zustand";
import type { AuthSession } from "../types/auth-session.types";
import type { SessionError } from "../session/session.types";
import { sessionManager } from "../session";
import { AuthError } from "../errors";

type AuthState = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  authError: AuthError | null;
  restoreError: SessionError | null;

  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthError: (error: AuthError | null) => void;
  setInitialized: (initialized: boolean) => void;

  login: (session: AuthSession) => void;
  logout: () => Promise<{ success: boolean }>;
  loadStoredSession: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  authError: null,
  restoreError: null,

  setSession: (session) =>
    set({
      session,
      isAuthenticated: !!session,
      error: null,
      authError: null,
      restoreError: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, authError: null }),
  setAuthError: (authError) =>
    set({
      authError,
      error: authError?.message ?? null,
    }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  login: (session) =>
    set({
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      authError: null,
      restoreError: null,
    }),

  logout: async () => {
    const clearResult = await sessionManager.clear();
    if (clearResult.success) {
      set({
        session: null,
        isAuthenticated: false,
        error: null,
        authError: null,
        restoreError: null,
      });
    }
    return { success: clearResult.success };
  },

  loadStoredSession: async () => {
    const result = await sessionManager.restore();

    if (result.success && result.session) {
      set({
        isInitialized: true,
        session: result.session,
        isAuthenticated: true,
        restoreError: null,
      });
    } else {
      set({
        isInitialized: true,
        isAuthenticated: false,
        session: null,
        restoreError: result.error ?? null,
      });
    }
  },

  clearError: () => set({ error: null, authError: null }),
}));
