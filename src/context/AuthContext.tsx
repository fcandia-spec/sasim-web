// ═══════════════════════════════════════════════════════
// SASIM — AuthContext.tsx
// Contexto de autenticación con lectura de rol persistente
//
// CORRECCIONES:
// - Lee rol en INITIAL_SESSION, SIGNED_IN y TOKEN_REFRESHED
// - Exporta login/logout como alias (Perfil.tsx los usa)
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

// ── Tipos ──
type UserRole = 'visitor' | 'subscriber' | 'admin';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  // Nombres canónicos
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  // Alias cortos — Perfil.tsx y otros componentes los usan
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [loading, setLoading] = useState(true);

  // Leer el rol desde public.users
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

  // Registrar/actualizar usuario en public.users
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

  // Manejar cambios de sesión
  const handleAuthChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (!authUser) {
        setRole('visitor');
        setLoading(false);
        return;
      }

      // En SIGNED_IN: registrar usuario en la tabla
      if (event === 'SIGNED_IN') {
        await upsertUser(authUser);
      }

      // En TODA sesión activa: leer el rol
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED'
      ) {
        const userRole = await fetchRole(authUser.id);
        setRole(userRole);
      }

      setLoading(false);

      // Limpiar hash de OAuth de la URL
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

    // Timeout de seguridad
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [handleAuthChange]);

  // ── Acciones ──
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setRole('visitor');
  }

  async function refreshRole() {
    if (!user) return;
    const newRole = await fetchRole(user.id);
    setRole(newRole);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signInWithGoogle,
        signOut,
        refreshRole,
        // Alias cortos
        login: signInWithGoogle,
        logout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
