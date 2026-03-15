import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface Props { onNavigate: (p: string) => void; }

export default function Perfil({ onNavigate }: Props) {
  const { user, role, login, logout } = useAuth();
  const { theme, toggle, label } = useTheme();

  if (!user) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔒</div>
        <p style={{ color: 'var(--tm)', marginBottom: 16 }}>Inicia sesión para ver tu perfil</p>
        <button onClick={login} style={{ padding: '10px 24px', background: 'var(--acc)', color: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>Iniciar sesión</button>
      </div>
    );
  }

  const name = user.user_metadata?.full_name || 'Usuario';
  const email = user.email || '';
  const photo = user.user_metadata?.avatar_url || '';
  const roleLabel = role === 'admin' ? 'Admin' : role === 'subscriber' ? 'Suscriptor' : 'Visitante';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40, padding: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        {photo && <img src={photo} style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--acc)', objectFit: 'cover' }} />}
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.5rem', fontWeight: 900, marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--tm)', marginBottom: 8 }}>{email}</div>
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
            background: role === 'admin' ? 'rgba(232,168,56,0.2)' : role === 'subscriber' ? 'rgba(34,197,94,0.15)' : 'var(--bg-el)',
            color: role === 'admin' ? 'var(--acc)' : role === 'subscriber' ? 'var(--acc3)' : 'var(--tm)',
          }}>{roleLabel}</span>
        </div>
      </div>

      {/* Progreso */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>
          <span style={{ color: 'var(--acc)' }}>▶</span> Mi progreso
        </h3>
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎬</div>
          <p style={{ color: 'var(--tm)', fontSize: '0.88rem' }}>El progreso de videos aparecerá aquí</p>
          <button onClick={() => onNavigate('cursos')} style={{ marginTop: 12, padding: '8px 20px', background: 'var(--acc)', color: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem' }}>Explorar cursos →</button>
        </div>
      </div>

      {/* Publicaciones */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>
          <span style={{ color: 'var(--acc)' }}>✍</span> Mis publicaciones
        </h3>
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>📝</div>
          <p style={{ color: 'var(--tm)', fontSize: '0.88rem' }}>Aún no hay publicaciones</p>
          <button onClick={() => onNavigate('blog')} style={{ marginTop: 12, padding: '8px 20px', background: 'var(--acc)', color: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem' }}>Ir al blog →</button>
        </div>
      </div>

      {/* Configuración */}
      <div>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 16 }}>
          <span style={{ color: 'var(--acc)' }}>⚙</span> Configuración
        </h3>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Tema</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--tm)', marginTop: 2 }}>{label}</div>
            </div>
            <button onClick={toggle} style={{
              width: 52, height: 28, background: theme === 'light' ? 'var(--acc-s)' : 'var(--bg-el)',
              border: '1px solid ' + (theme === 'light' ? 'var(--acc)' : 'var(--border)'),
              borderRadius: 14, position: 'relative', cursor: 'pointer',
            }}>
              <div style={{ position: 'absolute', top: 3, left: theme === 'light' ? 27 : 3, width: 20, height: 20, background: 'var(--acc)', borderRadius: '50%', transition: 'var(--tr)' }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Cuenta</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--tm)', marginTop: 2 }}>{email}</div>
            </div>
            <button onClick={logout} style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--tm)' }}>Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
}
