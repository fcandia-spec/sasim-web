import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { XScroll } from '@/components/ui/x-scroll';
import { Users, Star, Play } from 'lucide-react';
import type { Curso, Post } from '@/types';

interface Props { onNavigate: (p: string) => void; }

// Datos de ejemplo para los cursos más vistos (simularemos estadísticas)
const cursoStats: Record<string, { duration: string; students: number; rating: number; category: string }> = {
  '1': { duration: '2h 15m', students: 1234, rating: 4.8, category: 'Matemáticas' },
  '2': { duration: '1h 45m', students: 987, rating: 4.6, category: 'Ciencias' },
  '3': { duration: '3h 00m', students: 2156, rating: 4.9, category: 'Lenguaje' },
  '4': { duration: '2h 30m', students: 1567, rating: 4.7, category: 'Historia' },
  '5': { duration: '1h 30m', students: 876, rating: 4.5, category: 'Arte' },
  '6': { duration: '2h 00m', students: 1432, rating: 4.8, category: 'Música' },
  '7': { duration: '1h 15m', students: 654, rating: 4.4, category: 'Tecnología' },
};

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

  return (
    <>
      {/* Hero Section */}
      <section style={{
        minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '100px 0 80px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 55% at 50% -5%,rgba(232,168,56,0.09) 0%,transparent 70%),radial-gradient(ellipse 45% 45% at 85% 85%,rgba(59,130,246,0.07) 0%,transparent 60%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1200, padding: '0 32px' }}>
          <div style={{
            display: 'inline-flex', padding: '5px 16px', border: '1px solid var(--bglow)',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800,
            letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--acc)',
            background: 'var(--acc-s)', marginBottom: 24,
          }}>Aprende en familia</div>
          <h1 style={{
            fontFamily: 'var(--fd)', fontSize: 'clamp(3rem,8vw,5.5rem)',
            fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.05em',
            color: 'var(--acc)', marginBottom: 24,
          }}>SASIM</h1>
          
          {/* Scroll horizontal de cursos dentro del hero */}
          <div style={{ margin: '0 -32px 32px', width: 'calc(100% + 64px)' }}>
            {loadingCursos ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--tm)' }}>
                Cargando cursos...
              </div>
            ) : cursos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--tm)' }}>
                No hay cursos disponibles
              </div>
            ) : (
              <XScroll scrollAmount={200}>
                {cursos.map(curso => {
                  const stats = cursoStats[curso.id] || { duration: '2h 00m', students: 500, rating: 4.5, category: 'General' };
                  return (
                    <div
                      key={curso.id}
                      onClick={() => onNavigate('cursos')}
                      className="group relative flex-shrink-0 w-[180px] sm:w-[220px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      }}
                    >
                      {/* Thumbnail con icono */}
                      <div 
                        className="relative aspect-[4/3] overflow-hidden flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--acc-s) 0%, rgba(232,168,56,0.08) 100%)' }}
                      >
                        <span className="text-5xl sm:text-6xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{curso.icon}</span>
                        
                        {/* Play overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="h-12 w-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                            <Play className="h-5 w-5 ml-0.5" style={{ color: 'var(--acc)' }} fill="currentColor" />
                          </div>
                        </div>

                        {/* Category badge */}
                        <span 
                          className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                          style={{ background: 'var(--bg)', color: 'var(--acc)', fontSize: '0.65rem' }}
                        >
                          {stats.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3 
                          className="font-bold text-sm line-clamp-1 mb-1"
                          style={{ color: 'var(--txt)', fontFamily: 'var(--fd)' }}
                        >
                          {curso.title}
                        </h3>
                        
                        {/* Stats row */}
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--tm)' }}>
                          <div className="flex items-center gap-0.5" style={{ color: 'var(--acc)' }}>
                            <Star className="h-3 w-3" fill="currentColor" />
                            <span className="font-medium">{stats.rating}</span>
                          </div>
                          <span>·</span>
                          <div className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" />
                            <span>{stats.students.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                        style={{ background: 'var(--acc)' }}
                      />
                    </div>
                  );
                })}
              </XScroll>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('cursos')} style={{
              padding: '14px 32px', background: 'var(--acc)', color: 'var(--bg)',
              borderRadius: 9, fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 4px 20px var(--acc-g)', border: 'none', cursor: 'pointer',
            }}>Explorar cursos</button>
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

        {loadingPosts ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
            Cargando posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
            No hay posts disponibles
          </div>
        ) : (
          <XScroll scrollAmount={280}>
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => onNavigate('blog')}
                className="group flex-shrink-0 w-[240px] sm:w-[280px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  padding: 24, background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 12, textAlign: 'center',
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
            ))}
          </XScroll>
        )}

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
          Leer más artículos
        </button>
      </section>
    </>
  );
}
