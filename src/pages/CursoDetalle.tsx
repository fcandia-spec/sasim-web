// ═══════════════════════════════════════════════════════
// SASIM — CursoDetalle.tsx
// Página individual para cada curso.
// El contenido real se edita manualmente en la sección marcada.
// ═══════════════════════════════════════════════════════

import { CURSOS } from '@/data/content';
import { TAG_CLASS, TAG_LABEL } from '@/lib/utils';

interface Props {
  cursoId: string | null;
  onNavigate: (p: string, id?: string) => void;
}

export default function CursoDetalle({ cursoId, onNavigate }: Props) {
  const curso = CURSOS.find(c => c.id === cursoId);

  // Si el curso no existe, mostramos un estado vacío amable
  if (!curso) {
    return (
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '60px 32px 100px', textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--fd)', fontSize: '2rem',
          fontWeight: 900, marginBottom: 16,
        }}>
          Curso no encontrado
        </h2>
        <p style={{ color: 'var(--tm)', marginBottom: 24 }}>
          El curso que buscas no existe o fue movido.
        </p>
        <button
          onClick={() => onNavigate('cursos')}
          style={{
            padding: '12px 28px', background: 'var(--acc)', color: 'var(--bg)',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem',
            border: 'none', cursor: 'pointer',
          }}
        >
          Volver a cursos
        </button>
      </div>
    );
  }

  const tagCls = TAG_CLASS[curso.tag] || '';
  const tagLbl = TAG_LABEL[curso.tag] || 'General';

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '60px 32px 100px' }}>
      {/* Enlace de vuelta a la lista de cursos */}
      <button
        onClick={() => onNavigate('cursos')}
        style={{
          background: 'transparent', border: 'none', color: 'var(--tm)',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          marginBottom: 24, padding: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Volver a cursos
      </button>

      {/* Encabezado del curso: icono + tag + título + descripción */}
      <div style={{
        display: 'flex', gap: 24, alignItems: 'flex-start',
        marginBottom: 32, flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: '3.5rem', flexShrink: 0, width: 96, height: 96,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-el)', borderRadius: 'var(--radius-lg)',
        }}>
          {curso.icon}
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span
            className={tagCls}
            style={{
              display: 'inline-block', padding: '4px 12px',
              borderRadius: 'var(--radius-full)', fontSize: '0.7rem',
              fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 10,
            }}
          >
            {tagLbl}
          </span>
          <h1 style={{
            fontFamily: 'var(--fd)', fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900, letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: 12,
          }}>
            {curso.title}
          </h1>
          <p style={{
            color: 'var(--tm)', fontSize: '1rem',
            lineHeight: 1.6, margin: 0,
          }}>
            {curso.desc}
          </p>
        </div>
      </div>

      {/* Contenido del curso — PLACEHOLDER PARA EDICIÓN MANUAL */}
      <div style={{
        padding: '32px', background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', marginTop: 24,
      }}>
        <h2 style={{
          fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 800,
          marginBottom: 16, color: 'var(--tp)',
        }}>
          Contenido del curso
        </h2>
        <p style={{
          color: 'var(--tm)', fontSize: '0.95rem',
          lineHeight: 1.7, margin: 0,
        }}>
          Esta es la sección para añadir texto a este curso
        </p>
      </div>
    </div>
  );
}
