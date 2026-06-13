import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getStoredToken } from '../lib/api';
import { getCurrentUser, logout as authLogout, User } from '../lib/auth';

// ─── State / Action types ─────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; loading: boolean };

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, isLoggedIn: true, isLoading: false };
    case 'LOGOUT':
      return { user: null, isLoggedIn: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isLoading: true,
    isLoggedIn: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      dispatch({ type: 'SET_USER', user });
    } catch {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  // On mount — try to restore session from stored token
  useEffect(() => {
    (async () => {
      const token = await getStoredToken();
      if (token) {
        await refreshUser();
      } else {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    })();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await authLogout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
