// ═══════════════════════════════════════════════════════
// SASIM — ProfileMenu.tsx
// v3: Sin estrella en suscribirse, logout robusto
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const ROLE_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
  admin: { label: 'Admin', bg: 'rgba(34,197,94,0.2)', color: '#22C55E', border: 'rgba(34,197,94,0.4)' },
  subscriber: { label: 'Suscriptor', bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' },
  visitor: { label: 'Visitante', bg: 'var(--bg-el)', color: 'var(--tm)', border: 'var(--border)' },
};

interface ProfileMenuProps {
  onNavigate?: (page: string) => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export default function ProfileMenu({ onNavigate, onToggleTheme, isDark = true }: ProfileMenuProps) {
  const { user, role, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!user) return null;

  const name = user.user_metadata?.full_name || 'Usuario';
  const photo = user.user_metadata?.avatar_url || '';
  const email = user.email || '';
  const rs = ROLE_STYLES[role] || ROLE_STYLES.visitor;

  function handleAction(action: string) {
    setIsOpen(false);
    if (action === 'logout') {
      // signOut ya maneja la recarga de página internamente
      signOut();
    } else if (action === 'theme') {
      onToggleTheme?.();
    } else if (onNavigate) {
      onNavigate(action);
    }
  }

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600,
    color: 'var(--tm)', background: 'none', border: 'none',
    cursor: 'pointer', transition: 'background 0.2s', fontFamily: 'inherit',
    textAlign: 'left', borderRadius: 0,
  };

  const dividerStyle: React.CSSProperties = {
    height: 1, background: 'var(--border)', margin: 0,
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Trigger — foto de perfil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de perfil"
        aria-expanded={isOpen}
        style={{
          width: 36, height: 36, borderRadius: '50%', padding: 0,
          border: '2px solid var(--acc)', background: 'none',
          cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.25s',
          boxShadow: isOpen ? '0 0 0 3px var(--acc-s)' : 'none',
        }}
      >
        {photo ? (
          <img src={photo} alt="" referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: '#22C55E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.85rem', color: '#0a0a0f',
          }}>{name.charAt(0).toUpperCase()}</div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div role="menu" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, minWidth: 240,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 200,
          overflow: 'hidden', animation: 'fadeUp 0.2s ease',
        }}>
          {/* Cabecera */}
          <div style={{
            padding: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 800, fontSize: '0.9rem', color: 'var(--tp)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{name}</div>
              <div style={{
                fontSize: '0.75rem', color: 'var(--tf)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{email}</div>
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.04em', flexShrink: 0,
              background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
            }}>{rs.label}</span>
          </div>

          <div style={dividerStyle} />

          {/* Mi perfil */}
          <button role="menuitem" onClick={() => handleAction('perfil')} style={itemStyle}>
            <span style={{ width: 20, textAlign: 'center' }}>👤</span> Mi perfil
          </button>

          {/* Suscripción — sin estrella */}
          {role === 'visitor' && (
            <button role="menuitem" onClick={() => handleAction('suscribirse')}
              style={{ ...itemStyle, color: '#22C55E' }}>
              <span style={{ width: 20, textAlign: 'center' }}>💎</span> Suscribirse
            </button>
          )}
          {role === 'subscriber' && (
            <button role="menuitem" onClick={() => handleAction('suscribirse')} style={itemStyle}>
              <span style={{ width: 20, textAlign: 'center' }}>💳</span> Mi suscripción
            </button>
          )}
          {role === 'admin' && (
            <button role="menuitem"
              onClick={() => { setIsOpen(false); window.open('/admin.html', '_blank'); }}
              style={itemStyle}>
              <span style={{ width: 20, textAlign: 'center' }}>⚙️</span> Panel Admin
            </button>
          )}

          <div style={dividerStyle} />

          {/* Tema */}
          <button role="menuitem" onClick={() => handleAction('theme')} style={itemStyle}>
            <span style={{ width: 20, textAlign: 'center' }}>{isDark ? '☀️' : '🌙'}</span>
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>

          <div style={dividerStyle} />

          {/* Cerrar sesión */}
          <button role="menuitem" onClick={() => handleAction('logout')}
            style={{ ...itemStyle, color: '#EF4444' }}>
            <span style={{ width: 20, textAlign: 'center' }}>🚪</span> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
