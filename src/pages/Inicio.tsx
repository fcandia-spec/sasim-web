interface Props { onNavigate: (p: string) => void; }

export default function Inicio({ onNavigate }: Props) {
  return (
    <>
      <section style={{
        minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '140px 32px 100px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 55% at 50% -5%,rgba(232,168,56,0.09) 0%,transparent 70%),radial-gradient(ellipse 45% 45% at 85% 85%,rgba(59,130,246,0.07) 0%,transparent 60%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
          <div style={{
            display: 'inline-flex', padding: '5px 16px', border: '1px solid var(--bglow)',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800,
            letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--acc)',
            background: 'var(--acc-s)', marginBottom: 30,
          }}>Aprende en familia</div>
          <h1 style={{
            fontFamily: 'var(--fd)', fontSize: 'clamp(3.5rem,9vw,7rem)',
            fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.05em',
            color: 'var(--acc)', marginBottom: 6,
          }}>SASIM</h1>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('cursos')} style={{
              padding: '14px 32px', background: 'var(--acc)', color: 'var(--bg)',
              borderRadius: 9, fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 4px 20px var(--acc-g)',
            }}>Explorar cursos →</button>
            <button onClick={() => onNavigate('blog')} style={{
              padding: '14px 32px', border: '1px solid var(--border)',
              borderRadius: 9, fontWeight: 700, fontSize: '0.95rem', color: 'var(--tm)',
            }}>Leer el blog</button>
          </div>
        </div>
      </section>
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '40px 32px',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        {[{ n: '7', l: 'Cursos' }, { n: '3', l: 'Juegos' }, { n: '2', l: 'Planes' }].map((s, i) => (
          <div key={i} style={{
            flex: 1, maxWidth: 200, textAlign: 'center', padding: '24px 16px',
            borderRight: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--acc)', letterSpacing: '-0.03em' }}>{s.n}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--tm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </>
  );
}
