import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { User, CreditCard, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileMenuProps {
  onNavigate: (page: string) => void;
}

export default function ProfileMenu({ onNavigate }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const photo = user.user_metadata?.avatar_url || '';
  const name = user.user_metadata?.full_name?.split(' ')[0] || 'Usuario';

  function handleNav(page: string) {
    setOpen(false);
    onNavigate(page);
  }

  function handleLogout() {
    setOpen(false);
    logout();
  }

  const items = [
    { icon: User, label: 'Mi perfil', action: () => handleNav('perfil') },
    { icon: CreditCard, label: 'Suscripción', action: () => handleNav('suscribirse') },
    { icon: Settings, label: 'Configuración', action: () => handleNav('conocemas') },
    { icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? 'Tema claro' : 'Tema oscuro', action: toggle },
    { icon: LogOut, label: 'Cerrar sesión', action: handleLogout, danger: true },
  ];

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 4px 4px 12px', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)', background: 'var(--bg-card)',
          cursor: 'pointer', transition: 'var(--tr)',
        }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--tm)' }}>{name}</span>
        {photo ? (
          <img src={photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--acc)', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: 'var(--bg)' }}>
            {name[0]}
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 220, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden', zIndex: 200,
            }}
          >
            {/* Header del menú */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{user.user_metadata?.full_name || 'Usuario'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--tm)', marginTop: 2 }}>{user.email}</div>
              <span style={{
                display: 'inline-block', marginTop: 6, padding: '2px 8px',
                borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 800,
                textTransform: 'uppercase',
                background: role === 'admin' ? 'rgba(232,168,56,0.2)' : role === 'subscriber' ? 'rgba(34,197,94,0.15)' : 'var(--bg-el)',
                color: role === 'admin' ? 'var(--acc)' : role === 'subscriber' ? 'var(--acc3)' : 'var(--tm)',
              }}>
                {role === 'admin' ? 'Admin' : role === 'subscriber' ? 'Suscriptor' : 'Visitante'}
              </span>
            </div>

            {/* Items */}
            {items.map((item, i) => {
              const Icon = item.icon;
              const isDanger = 'danger' in item && item.danger;
              return (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
                    color: isDanger ? 'var(--danger)' : 'var(--tp)',
                    background: 'transparent', textAlign: 'left',
                    borderTop: i === items.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                    cursor: 'pointer', fontFamily: 'var(--fb)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-el)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
