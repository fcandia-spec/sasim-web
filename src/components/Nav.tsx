// ═══════════════════════════════════════════════════════
// SASIM — Nav.tsx
// Barra de navegación compatible con App.tsx
//
// Props que recibe de App.tsx:
//   page: string        — página activa actual
//   onNavigate: (p: string) => void — función de navegación
//
// Usa el ExpandableTabs existente de ui/expandable-tabs.tsx
// ═══════════════════════════════════════════════════════

import { Home, BookOpen, MessageCircle, Gamepad2, Info } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ProfileMenu from '@/components/ProfileMenu';

// ── Tabs de navegación ──
const NAV_TABS = [
  { id: 'inicio', title: 'Inicio', icon: Home },
  { id: 'cursos', title: 'Cursos', icon: BookOpen },
  { id: 'blog', title: 'Blog', icon: MessageCircle },
  { type: 'separator' as const },
  { id: 'juegos', title: 'Juegos', icon: Gamepad2 },
  { id: 'nosotros', title: 'Nosotros', icon: Info },
];

const MP_PLAN_URL =
  'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=1a22a11fecaa48d8b38ea219cabaeb89';

// ── Props — exactamente lo que App.tsx pasa ──
interface NavProps {
  page: string;
  onNavigate: (page: string) => void;
}

export default function Nav({ page, onNavigate }: NavProps) {
  const { user, role, signInWithGoogle } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      background: isDark ? 'rgba(10,10,15,0.88)' : 'rgba(248,250,251,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 11,
          fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '1.45rem',
          letterSpacing: '-0.02em', textDecoration: 'none', color: 'var(--tp)',
          transition: 'color 0.3s',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '0.9rem',
          color: 'var(--bg)', letterSpacing: '-0.05em',
          boxShadow: '0 4px 16px var(--acc-g)',
        }}>S</div>
        <span style={{ color: 'inherit' }}>SASIM</span>
      </a>

      {/* Tabs — componente existente de ui/ */}
      <ExpandableTabs
        tabs={NAV_TABS}
        activeId={page}
        onChange={(id: string) => onNavigate(id)}
      />

      {/* Acciones derecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            {/* Badge Admin */}
            {role === 'admin' && (
              <span style={{
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.35)',
                fontSize: '0.7rem', fontWeight: 800, color: '#ff6b6b',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Admin</span>
            )}

            {/* Suscribirse — solo visitantes */}
            {role === 'visitor' && (
              <button
                onClick={() => window.open(MP_PLAN_URL, '_blank')}
                style={{
                  padding: '8px 18px', borderRadius: 9,
                  background: 'linear-gradient(135deg, #009ee3, #00b4d8)',
                  color: '#fff', fontWeight: 800, fontSize: '0.82rem',
                  border: 'none', cursor: 'pointer', transition: 'var(--tr)',
                }}
              > Suscribirme</button>
            )}

            {/* Menú de perfil */}
            <ProfileMenu
              onNavigate={onNavigate}
              onToggleTheme={toggle}
              isDark={isDark}
            />
          </>
        ) : (
          <button
            onClick={signInWithGoogle}
            style={{
              padding: '8px 20px', borderRadius: 9,
              background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
              color: 'var(--bg)', fontWeight: 800, fontSize: '0.88rem',
              border: 'none', cursor: 'pointer',
            }}
          >Iniciar sesión</button>
        )}
      </div>
    </nav>
  );
}
