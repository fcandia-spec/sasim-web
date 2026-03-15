import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: 'visitor',
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // Registrar usuario
        await supabase.from('users').upsert({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.full_name || '',
          photo: currentUser.user_metadata?.avatar_url || '',
        }, { onConflict: 'id', ignoreDuplicates: true });

        // Obtener rol
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        setRole((data?.role as UserRole) || 'visitor');
      } else if (!currentUser) {
        setRole('visitor');
      }

      setLoading(false);

      // Limpiar hash OAuth
      if (window.location.hash?.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }, []);

  function login() {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://sasim-web.pages.dev',
        queryParams: { prompt: 'select_account' },
      },
    });
  }

  function logout() {
    supabase.auth.signOut();
    setUser(null);
    setRole('visitor');
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
