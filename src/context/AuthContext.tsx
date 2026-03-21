// ═══════════════════════════════════════════════════════
// SASIM — AuthContext.tsx
// v3: signOut fuerza recarga limpia de la página
// ═══════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'visitor' | 'subscriber' | 'admin';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('Error leyendo rol:', error.message);
        return 'visitor';
      }
      return (data?.role as UserRole) || 'visitor';
    } catch (e) {
      console.warn('Error inesperado en fetchRole:', e);
      return 'visitor';
    }
  }, []);

  const upsertUser = useCallback(async (authUser: User) => {
    try {
      await supabase.from('users').upsert(
        {
          id: authUser.id,
          email: authUser.email ?? '',
          name: authUser.user_metadata?.full_name ?? '',
          photo: authUser.user_metadata?.avatar_url ?? '',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    } catch (e) {
      console.warn('Error en upsert de usuario:', e);
    }
  }, []);

  const handleAuthChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (!authUser) {
        setRole('visitor');
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN') {
        await upsertUser(authUser);
      }

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED'
      ) {
        const userRole = await fetchRole(authUser.id);
        setRole(userRole);
      }

      setLoading(false);

      if (
        window.location.hash &&
        window.location.hash.includes('access_token')
      ) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    },
    [fetchRole, upsertUser]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [handleAuthChange]);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
  }

  // signOut: limpia la sesión en Supabase y recarga la página
  // La recarga garantiza un estado 100% limpio sin sesión residual
  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error cerrando sesión:', e);
    }
    // Limpiar estado local inmediatamente
    setUser(null);
    setRole('visitor');
    // Recargar página para garantizar estado limpio
    window.location.href = window.location.origin;
  }

  async function refreshRole() {
    if (!user) return;
    const newRole = await fetchRole(user.id);
    setRole(newRole);
  }

  return (
    <AuthContext.Provider
      value={{
        user, role, loading,
        signInWithGoogle, signOut, refreshRole,
        login: signInWithGoogle,
        logout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
