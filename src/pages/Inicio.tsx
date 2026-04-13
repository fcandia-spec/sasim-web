import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Curso, Post } from '@/types';

interface Props { onNavigate: (p: string) => void; }

export default function Inicio({ onNavigate }: Props) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch cursos desde Supabase
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const { data, error } = await supabase
          .from('cursos')
          .select('id, icon, title')
          .limit(7);
        
        if (error) throw error;
        setCursos(data || []);
      } catch (error) {
        console.error('Error cargando cursos:', error);
      } finally {
        setLoadingCursos(false);
      }
    };

    fetchCursos();
  }, []);

  // Fetch posts desde Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, text, created_at')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error cargando posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  const scroll = (direction: 'left' | 'right', section: 'cursos' | 'posts') => {
    const container = document.getElementById(`scroll-${section}`);
    if (!container) return;
    
    const scrollAmount = 280;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
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
            color: 'var(--acc)', marginBottom: 32,
          }}>SASIM</h1>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('cursos')} style={{
              padding: '14px 32px', background: 'var(--acc)', color: 'var(--bg)',
              borderRadius: 9, fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 4px 20px var(--acc-g)', border: 'none', cursor: 'pointer',
            }}>Explorar cursos →</button>
            <button onClick={() => onNavigate('blog')} style={{
              padding: '14px 32px', border: '1px solid var(--border)',
              borderRadius: 9, fontWeight: 700, fontSize: '0.95rem', color: 'var(--tm)',
              background: 'transparent', cursor: 'pointer',
            }}>Leer el blog</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '40px 32px',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {[{ n: '7', l: 'Cursos' }, { n: '3', l: 'Juegos' }, { n: '2', l: 'Planes' }].map((s, i) => (
          <div key={i} style={{
            flex: 1, minWidth: '120px', maxWidth: '200px', textAlign: 'center', padding: '24px 16px',
            borderRight: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--acc)', letterSpacing: '-0.03em' }}>{s.n}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--tm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Cursos Scroll Section */}
      <section style={{ padding: '60px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 900,
            letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Cursos más <span style={{ color: 'var(--acc)' }}>recientes</span>
          </h2>
          <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>Explora nuestras últimas adiciones</p>
        </div>

        {/* Scroll Container */}
        <div style={{ position: 'relative' }}>
          {/* Botones de scroll (solo desktop) */}
          <button
            onClick={() => scroll('left', 'cursos')}
            style={{
              display: 'none',
              position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer',
              zIndex: 10, transition: 'all 0.3s ease',
              fontSize: '1.2rem',
              '@media (min-width: 768px)': { display: 'flex' },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--acc)';
              e.currentTarget.style.borderColor = 'var(--acc)';
              e.currentTarget.style.color = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            ←
          </button>

          <div
            id="scroll-cursos"
            style={{
              display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12,
              scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin', scrollbarColor: 'var(--acc) transparent',
            }}
          >
            {loadingCursos ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
                Cargando cursos...
              </div>
            ) : cursos.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
                No hay cursos disponibles
              </div>
            ) : (
              cursos.map(curso => (
                <div
                  key={curso.id}
                  style={{
                    flex: '0 0 220px', minWidth: '220px',
                    padding: 20, background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12, textAlign: 'center',
                  }}
                  onClick={() => onNavigate('cursos')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2.4rem' }}>{curso.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--fd)', fontWeight: 700, fontSize: '0.95rem',
                    margin: 0, color: 'var(--txt)', lineHeight: 1.3,
                  }}>
                    {curso.title}
                  </h3>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => scroll('right', 'cursos')}
            style={{
              display: 'none',
              position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer',
              zIndex: 10, transition: 'all 0.3s ease',
              fontSize: '1.2rem',
              '@media (min-width: 768px)': { display: 'flex' },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--acc)';
              e.currentTarget.style.borderColor = 'var(--acc)';
              e.currentTarget.style.color = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            →
          </button>
        </div>

        <button
          onClick={() => onNavigate('cursos')}
          style={{
            marginTop: 32, padding: '12px 28px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--tm)', cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--acc)';
            e.currentTarget.style.color = 'var(--bg)';
            e.currentTarget.style.borderColor = 'var(--acc)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--tm)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          Explorar todos los cursos →
        </button>
      </section>

      {/* Blog Section */}
      <section style={{
        padding: '60px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 900,
            letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Del <span style={{ color: 'var(--acc)' }}>blog</span>
          </h2>
          <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>Lee los artículos más recientes</p>
        </div>

        {/* Scroll Container */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => scroll('left', 'posts')}
            style={{
              display: 'none',
              position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer',
              zIndex: 10, transition: 'all 0.3s ease',
              fontSize: '1.2rem',
              '@media (min-width: 768px)': { display: 'flex' },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--acc)';
              e.currentTarget.style.borderColor = 'var(--acc)';
              e.currentTarget.style.color = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            ←
          </button>

          <div
            id="scroll-posts"
            style={{
              display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12,
              scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin', scrollbarColor: 'var(--acc) transparent',
            }}
          >
            {loadingPosts ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
                Cargando posts...
              </div>
            ) : posts.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
                No hay posts disponibles
              </div>
            ) : (
              posts.map(post => (
                <div
                  key={post.id}
                  style={{
                    flex: '0 0 240px', minWidth: '240px',
                    padding: 24, background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12, textAlign: 'center',
                  }}
                  onClick={() => onNavigate('blog')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2.8rem' }}>📝</div>
                  <h3 style={{
                    fontFamily: 'var(--fd)', fontWeight: 700, fontSize: '0.95rem',
                    margin: 0, color: 'var(--txt)', lineHeight: 1.3,
                  }}>
                    {post.text}
                  </h3>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => scroll('right', 'posts')}
            style={{
              display: 'none',
              position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)',
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer',
              zIndex: 10, transition: 'all 0.3s ease',
              fontSize: '1.2rem',
              '@media (min-width: 768px)': { display: 'flex' },
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--acc)';
              e.currentTarget.style.borderColor = 'var(--acc)';
              e.currentTarget.style.color = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            →
          </button>
        </div>

        <button
          onClick={() => onNavigate('blog')}
          style={{
            marginTop: 32, padding: '12px 28px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--tm)', cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--acc)';
            e.currentTarget.style.color = 'var(--bg)';
            e.currentTarget.style.borderColor = 'var(--acc)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--tm)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          Leer más artículos →
        </button>
      </section>
    </>
  );
}