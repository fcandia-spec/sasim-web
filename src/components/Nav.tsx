import { useAuth } from '@/context/AuthContext';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import ProfileMenu from '@/components/ProfileMenu';
import { Home, BookOpen, Pen, Gamepad2, Users } from 'lucide-react';

interface NavProps {
  page: string;
  onNavigate: (page: string) => void;
}

const NAV_TABS = [
  { id: 'inicio', title: 'Inicio', icon: Home },
  { id: 'cursos', title: 'Cursos', icon: BookOpen },
  { id: 'blog', title: 'Blog', icon: Pen },
  { type: 'separator' as const },
  { id: 'juegos', title: 'Juegos', icon: Gamepad2 },
  { id: 'nosotros', title: 'Nosotros', icon: Users },
];

export default function Nav({ page, onNavigate }: NavProps) {
  const { user, role, login } = useAuth();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <a onClick={() => onNavigate('inicio')} style={{
        display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer',
        fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '1.55rem',
        letterSpacing: '-0.02em',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: 'var(--acc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '0.95rem',
          color: 'var(--bg)', letterSpacing: '-0.05em',
          boxShadow: '0 4px 16px var(--acc-g)',
        }}>SA</div>
        <span>SASIM</span>
      </a>

      {/* Expandable Tabs */}
      <ExpandableTabs
        tabs={NAV_TABS}
        activeId={page}
        onChange={(id) => onNavigate(id)}
      />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {role === 'admin' && (
          <a href="admin.html" style={{
            fontSize: '0.78rem', fontWeight: 800, color: 'var(--danger)',
            padding: '5px 12px', borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)',
          }}>⚙</a>
        )}
        {!user ? (
          <button onClick={login} style={{
            padding: '7px 18px', borderRadius: 9, background: 'var(--acc)',
            color: 'var(--bg)', fontWeight: 800, fontSize: '0.82rem',
          }}>Iniciar sesión</button>
        ) : (
          <ProfileMenu onNavigate={onNavigate} />
        )}
      </div>
    </nav>
  );
}
