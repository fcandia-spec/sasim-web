import { JUEGOS } from '@/data/content';

export default function Juegos() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 100px' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
          <span style={{ color: 'var(--acc)' }}>Juegos</span>
        </h2>
        <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>Aprende jugando. Desafíos interactivos que convierten el aprendizaje en diversión.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
        {JUEGOS.map(j => (
          <div key={j.id} style={{ display: 'flex', gap: 18, padding: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '2.2rem', flexShrink: 0, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-el)', borderRadius: 'var(--radius-md)' }}>{j.icon}</div>
            <div>
              <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 8px' }}>{j.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--tm)', lineHeight: 1.6, marginBottom: 12 }}>{j.desc}</p>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.67rem', fontWeight: 800, background: 'var(--bg-el)', color: 'var(--tm)' }}>Próximamente</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
