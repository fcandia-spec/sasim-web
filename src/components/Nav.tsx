import { useAuth } from '@/context/AuthContext';

interface NavProps {
  page: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'blog', label: 'Blog' },
  { id: 'juegos', label: 'Juegos' },
  { id: 'nosotros', label: 'Nosotros' },
];

export default function Nav({ page, onNavigate }: NavProps) {
  const { user, role, login, logout } = useAuth();
  const photo = user?.user_metadata?.avatar_url || '';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px',
      background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <a onClick={() => onNavigate('inicio')} style={{
        display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer',
        fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '1.55rem',
        letterSpacing: '-0.02em', transition: 'var(--tr)',
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

      <div style={{ display: 'flex', gap: 3 }}>
        {NAV_LINKS.map(link => (
          <a key={link.id} onClick={() => onNavigate(link.id)} style={{
            padding: '7px 16px', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            color: page === link.id ? 'var(--acc)' : 'var(--tm)',
            background: page === link.id ? 'var(--acc-s)' : 'transparent',
            transition: 'var(--tr)',
          }}>{link.label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {role === 'admin' && (
          <a href="admin.html" style={{
            fontSize: '0.82rem', fontWeight: 800, color: 'var(--danger)',
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)',
          }}>⚙ Admin</a>
        )}
        {role === 'visitor' && user && (
          <button onClick={() => onNavigate('suscribirse')} style={{
            padding: '8px 20px', borderRadius: 9,
            background: 'linear-gradient(135deg,#009ee3,#00b4d8)',
            color: '#fff', fontWeight: 800, fontSize: '0.88rem',
          }}>Suscribirse</button>
        )}
        {!user ? (
          <button onClick={login} style={{
            padding: '8px 20px', borderRadius: 9, background: 'var(--acc)',
            color: 'var(--bg)', fontWeight: 800, fontSize: '0.88rem',
            transition: 'var(--tr)',
          }}>Iniciar sesión</button>
        ) : (
          <>
            {photo && (
              <img src={photo} alt="" onClick={() => onNavigate('perfil')} style={{
                width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--acc)',
                cursor: 'pointer', objectFit: 'cover', transition: 'var(--tr)',
              }} />
            )}
            <button onClick={logout} style={{
              padding: '6px 16px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', fontSize: '0.8rem',
              fontWeight: 700, color: 'var(--tm)', transition: 'var(--tr)',
            }}>Salir</button>
          </>
        )}
      </div>
    </nav>
  );
}
