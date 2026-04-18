import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { XScroll } from '@/components/ui/x-scroll';
import { Clock, Users, Star, Play } from 'lucide-react';
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

      {/* Cursos Scroll Section - Mejorado con XScroll */}
      <section style={{ padding: '60px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 900,
            letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Cursos más <span style={{ color: 'var(--acc)' }}>populares</span>
          </h2>
          <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>Explora los favoritos de nuestra comunidad</p>
        </div>

        {loadingCursos ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
            Cargando cursos...
          </div>
        ) : cursos.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '32px', color: 'var(--tm)' }}>
            No hay cursos disponibles
          </div>
        ) : (
          <XScroll scrollAmount={340}>
            {cursos.map(curso => {
              const stats = cursoStats[curso.id] || { duration: '2h 00m', students: 500, rating: 4.5, category: 'General' };
              return (
                <div
                  key={curso.id}
                  onClick={() => onNavigate('cursos')}
                  className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  {/* Thumbnail con icono */}
                  <div className="relative aspect-video overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--acc-s) 0%, rgba(232,168,56,0.05) 100%)' }}>
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-6xl transform transition-transform duration-500 group-hover:scale-125">{curso.icon}</span>
                    </div>

                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
                        <Play className="h-6 w-6 ml-1" style={{ color: 'var(--acc)' }} fill="currentColor" />
                      </div>
                    </div>

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full shadow-sm" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
                      {stats.category}
                    </span>

                    {/* Duration badge */}
                    <span className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium bg-black/70 text-white rounded-md flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stats.duration}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 leading-snug mb-2 transition-colors" style={{ color: 'var(--txt)', fontFamily: 'var(--fd)' }}>
                      {curso.title}
                    </h3>

                    <p className="text-sm mb-3" style={{ color: 'var(--tm)' }}>SASIM Academy</p>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1" style={{ color: 'var(--acc)' }}>
                        <Star className="h-4 w-4" fill="currentColor" />
                        <span className="font-medium">{stats.rating.toFixed(1)}</span>
                      </div>

                      <div className="flex items-center gap-1" style={{ color: 'var(--tm)' }}>
                        <Users className="h-4 w-4" />
                        <span>{stats.students.toLocaleString()} estudiantes</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'linear-gradient(to right, var(--acc), rgba(232,168,56,0.6))' }} />
                </div>
              );
            })}
          </XScroll>
        )}

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
          Explorar cursos
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
