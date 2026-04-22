import { CURSOS } from '@/data/content';
import { TAG_CLASS, TAG_LABEL } from '@/lib/utils';

interface Props {
  onNavigate: (p: string, id?: string) => void;
}

export default function Cursos({ onNavigate }: Props) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 100px' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
          <span style={{ color: 'var(--acc)' }}>Cursos</span>
        </h2>
        <p style={{ color: 'var(--tm)', fontSize: '0.95rem', maxWidth: 600 }}>
          Aprende a tu ritmo. Cada curso está diseñado para transformar curiosidad en habilidad.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20, marginBottom: 40 }}>
        {CURSOS.map(c => {
          const tagCls = TAG_CLASS[c.tag] || '';
          const tagLbl = TAG_LABEL[c.tag] || 'General';
          return (
            <div key={c.id} style={{
              display: 'flex', gap: 18, padding: 24, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', transition: 'var(--tr)',
            }}>
              <div style={{
                fontSize: '2.2rem', flexShrink: 0, width: 56, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-el)', borderRadius: 'var(--radius-md)',
              }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                }} className={tagCls}>{tagLbl}</span>
                <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '1.05rem', margin: '6px 0 8px' }}>{c.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--tm)', lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
                <button
                  onClick={() => onNavigate('curso', c.id)}
                  style={{
                    padding: '8px 20px', background: 'var(--acc)', color: 'var(--bg)',
                    borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem',
                    border: 'none', cursor: 'pointer',
                  }}
                >Ver curso →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
