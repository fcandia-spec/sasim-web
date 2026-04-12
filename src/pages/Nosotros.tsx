const CARDS = [
  { title: 'Misión', text: 'Democratizar el acceso al conocimiento tecnológico y creativo para familias hispanohablantes, cerrando la brecha digital con contenido cercano, práctico y de calidad.' },
  { title: 'Visión', text: 'Ser la plataforma de referencia en educación digital familiar en Latinoamérica, donde padres e hijos aprenden juntos y transforman la tecnología en una herramienta de crecimiento.' },
  { title: 'Valores', text: 'Cercanía, honestidad, curiosidad, perseverancia e inclusión. Creemos que cada persona tiene el potencial de aprender y crecer sin importar su punto de partida.' },
  { title: 'Objetivos', text: 'Crear cursos accesibles sobre IA, programación y arte digital. Construir una comunidad activa de padres y educadores. Desarrollar herramientas interactivas de aprendizaje.' },
];

const MAXIMAS = [
  { letter: 'S', text: 'ueña — Imagina lo que podrías lograr.' },
  { letter: 'A', text: 'prende — El conocimiento es tu herramienta.' },
  { letter: 'S', text: 'iente — Conecta con lo que haces.' },
  { letter: 'I', text: 'magina — Crea sin límites.' },
  { letter: 'M', text: 'ultiplica — Comparte lo aprendido.' },
];

export default function Nosotros() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 100px' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Sobre <span style={{ color: 'var(--acc)' }}>nosotros</span>
        </h2>
        <p style={{ color: 'var(--tm)' }}>Conoce la esencia de SASIM — Sueña, Aprende, Siente, Imagina, Multiplica.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20, marginBottom: 48 }}>
        {CARDS.map(c => (
          <div key={c.title} style={{ padding: 28, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 14 }}>{c.icon}</div>
            <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 10, color: 'var(--acc)' }}>{c.title}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--tm)', lineHeight: 1.7 }}>{c.text}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 900, marginBottom: 20 }}>
          Nuestras <span style={{ color: 'var(--acc)' }}>máximas</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MAXIMAS.map(m => (
            <div key={m.letter + m.text} style={{ padding: '14px 20px', background: 'var(--bg-el)', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--acc)', fontSize: '1.1rem' }}>{m.letter}</strong>{m.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
