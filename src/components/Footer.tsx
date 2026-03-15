interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{
      background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
      padding: '60px 32px 24px', marginTop: 80,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 40,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--acc)', marginBottom: 12 }}>SASIM</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--tm)', lineHeight: 1.7, maxWidth: 360 }}>
            Sabiduría Simple — Tecnología, familia y aprendizaje para un mundo en constante evolución.
          </p>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Explorar</div>
          {['cursos', 'blog', 'juegos'].map(p => (
            <a key={p} onClick={() => onNavigate(p)} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--tm)', padding: '4px 0', cursor: 'pointer' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </a>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>SASIM</div>
          <a onClick={() => onNavigate('nosotros')} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--tm)', padding: '4px 0', cursor: 'pointer' }}>Sobre nosotros</a>
          <a onClick={() => onNavigate('conocemas')} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--tm)', padding: '4px 0', cursor: 'pointer' }}>Políticas y privacidad</a>
          <a onClick={() => onNavigate('suscribirse')} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--tm)', padding: '4px 0', cursor: 'pointer' }}>Planes</a>
        </div>
      </div>
      <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--tf)' }}>
        © 2026 SASIM — Sabiduría Simple. Todos los derechos reservados.
      </div>
    </footer>
  );
}
