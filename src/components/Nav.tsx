import { Home, BookOpen, MessageCircle, Gamepad2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ProfileMenu from '@/components/ProfileMenu';

const NAV_TABS = [
  { id: 'inicio', title: 'Inicio', icon: Home },
  { id: 'cursos', title: 'Cursos', icon: BookOpen },
  { id: 'blog',   title: 'Blog',   icon: MessageCircle },
  { type: 'separator' as const },
  { id: 'juegos',   title: 'Juegos',   icon: Gamepad2 },
  { id: 'nosotros', title: 'Nosotros', icon: Info },
];

export default function Nav() {
  const { user, role, signInWithGoogle } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640
  );
  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 640); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Deriva el tab activo desde la URL actual
  const segment = location.pathname.split('/')[1];
  const activeId = segment || 'inicio';

  function handleTabChange(id: string) {
    navigate(id === 'inicio' ? '/' : `/${id}`);
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      background: isDark ? 'rgba(10,10,15,0.88)' : 'rgba(248,250,251,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); navigate('/'); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 11,
          fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '0.9rem',
          letterSpacing: '-0.02em', textDecoration: 'none', color: 'var(--tp)',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: '#22C55E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '0.9rem',
          color: '#FFFFFF', letterSpacing: '-0.05em',
          boxShadow: '0 4px 16px rgba(34,197,94,0.22)',
        }}>S</div>
        <span>SASIM</span>
      </a>

      <ExpandableTabs
        tabs={NAV_TABS}
        activeId={activeId}
        onChange={handleTabChange}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            {role === 'admin' && (
              <span style={{
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
                fontSize: '0.7rem', fontWeight: 800, color: '#22C55E',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Admin</span>
            )}
            <ProfileMenu onToggleTheme={toggle} isDark={isDark} />
          </>
        ) : (
          <button
            onClick={signInWithGoogle}
            style={{
              padding: '8px 20px', borderRadius: 9,
              background: '#22C55E',
              color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem',
              border: 'none', cursor: 'pointer',
            }}
          >{isMobile ? 'Iniciar' : 'Iniciar sesión'}</button>
        )}
      </div>
    </nav>
  );
}