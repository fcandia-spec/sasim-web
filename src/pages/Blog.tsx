// ═══════════════════════════════════════════════════════
// SASIM — Blog.tsx
// Página completa del blog — inline styles (sin CSS externo)
//
// BUGS CORREGIDOS:
// - Bug 2: Posts cargan y persisten en Supabase
// - Bug 3: Comentarios funcionan (insert + display)
// - Bug 4: Protección contra doble submit
// - Bug 5: Nombre de autor desde public.users, no email
// - Bug 7: Likes con post_likes (único por usuario)
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// ── Tipos ──
interface PostAuthor {
  name: string | null;
  photo: string | null;
  email: string | null;
  role: string | null;
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  author: PostAuthor;
}

interface Post {
  id: string;
  text: string;
  tag: string;
  created_at: string;
  user_id: string | null;
  author: PostAuthor;
  like_count: number;
  user_has_liked: boolean;
  comments: Comment[];
  comment_count: number;
}

const TAG_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  familia: { label: 'Familia', bg: 'rgba(232,168,56,0.15)', color: 'var(--acc)' },
  dibujo: { label: 'Dibujo', bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b' },
  ia: { label: 'IA', bg: 'rgba(34,197,94,0.15)', color: 'var(--acc3)' },
  tech: { label: 'Tech', bg: 'rgba(130,100,255,0.15)', color: '#a78bfa' },
};

// ── Utilidades ──
function formatTime(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

function getAuthorName(author: PostAuthor): string {
  if (author.name && author.name.trim().length > 0) return author.name.trim();
  if (author.email) return author.email.split('@')[0];
  return 'Usuario';
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ═══ Componente principal ═══
export default function Blog() {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [publishText, setPublishText] = useState('');
  const [publishTag, setPublishTag] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // ── Cargar posts desde Supabase ──
  const loadPosts = useCallback(async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, text, tag, created_at, user_id')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error cargando posts:', postsError);
        setLoadingPosts(false);
        return;
      }
      
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoadingPosts(false);
        return;
      }
      // Buscar autores desde public.users (sin FK join)
      const uniqueUserIds = [...new Set(postsData.map((p) => p.user_id).filter(Boolean))] as string[];
      const authorsMap: Record<string, PostAuthor> = {};
      if (uniqueUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, photo, email, role')
          .in('id', uniqueUserIds);
        (usersData ?? []).forEach((u) => {
          authorsMap[u.id] = { name: u.name, photo: u.photo, email: u.email, role: u.role };
        });
      }


    

      const postIds = postsData.map((p) => p.id);

      // Contar likes por post
      const { data: likesData } = await supabase
        .from('post_likes').select('post_id').in('post_id', postIds);
      const likeCounts: Record<string, number> = {};
      (likesData ?? []).forEach((l) => {
        likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
      });

      // Likes del usuario actual
      let userLikes = new Set<string>();
      if (user) {
        const { data: myLikes } = await supabase
          .from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds);
        userLikes = new Set((myLikes ?? []).map((l) => l.post_id));
      }

      // Contar comentarios
      const { data: commentCounts } = await supabase
        .from('comments').select('post_id').in('post_id', postIds);
      const commCounts: Record<string, number> = {};
      (commentCounts ?? []).forEach((c) => {
        commCounts[c.post_id] = (commCounts[c.post_id] || 0) + 1;
      });

      // Armar posts
      const fullPosts: Post[] = postsData.map((p) => {
        const author: PostAuthor = p.user_id && authorsMap[p.user_id]
          ? authorsMap[p.user_id]
          : { name: null, photo: null, email: null, role: null };
        return {
          id: p.id, text: p.text, tag: p.tag || 'familia', created_at: p.created_at,
          user_id: p.user_id, author,
          like_count: likeCounts[p.id] || 0, user_has_liked: userLikes.has(p.id),
          comments: [], comment_count: commCounts[p.id] || 0,
        };
      });

      fullPosts.sort((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count - a.like_count;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setPosts(fullPosts);
    } catch (e) {
      console.error('Error inesperado cargando posts:', e);
      setError('No se pudieron cargar los posts. Intenta recargar la página.');
    } finally {
      setLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── Publicar post ──
  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    const text = publishText.trim();
    if (text.length < 3 || !user || isPublishing) return;

    setIsPublishing(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('posts').insert([{
        text, tag: publishTag || 'familia', user_id: user.id, likes: 0,
      }]);
      if (insertError) {
        console.error('Error publicando post:', insertError);
        setError('No se pudo publicar. Intenta de nuevo.');
        return;
      }
      setPublishText('');
      setPublishTag('');
      await loadPosts();
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsPublishing(false);
    }
  }

  // ── Toggle like ──
  async function handleLike(postId: string) {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimista
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      if (p.user_has_liked) return { ...p, user_has_liked: false, like_count: Math.max(0, p.like_count - 1) };
      return { ...p, user_has_liked: true, like_count: p.like_count + 1 };
    }));

    try {
      if (post.user_has_liked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        const { error } = await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
        if (error && error.code === '23505') return;
      }
    } catch {
      // Revertir
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, user_has_liked: post.user_has_liked, like_count: post.like_count };
      }));
    }
  }

  // ── Compartir ──
  async function handleShare(post: Post) {
    const shareData = {
      title: 'SASIM — Sabiduría Simple',
      text: post.text.slice(0, 140) + (post.text.length > 140 ? '...' : ''),
      url: window.location.origin,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); alert('Enlace copiado al portapapeles'); }
    } catch { /* cancelado */ }
  }

  // ── Reportar ──
  async function handleReport(postId: string, reason: string) {
    if (!user) return;
    try {
      await supabase.from('reports').insert([{ post_id: postId, user_id: user.id, reason }]);
      alert('Reporte enviado. Gracias por ayudar a mantener la comunidad.');
    } catch { alert('No se pudo enviar el reporte.'); }
  }

  function toggleComments(postId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  function toggleExpand(postId: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  async function handleDelete(postId: string) {
    if (!confirm('¿Eliminar este post?')) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) { console.error('Error eliminando post:', e); }
  }

  // ═══ RENDER ═══
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px 100px' }}>
      {/* Encabezado */}
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 } as const}
          style={{
            fontFamily: 'var(--fd)', fontSize: '2.2rem', fontWeight: 900,
            letterSpacing: '-0.03em', marginBottom: 10,
          }}
        >
          Ideas, <span style={{ color: 'var(--acc)' }}>reflexiones</span> y recursos
        </motion.h2>
        <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>
          El muro de SASIM — tecnología, crianza y aprendizaje en pequeñas dosis
        </p>
      </header>

      {/* Composer */}
      {user ? (
        <motion.form
          onSubmit={handlePublish}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 } as const}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 18, padding: 20, marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <Avatar name={user.user_metadata?.full_name || ''} photo={user.user_metadata?.avatar_url} />
            <textarea
              placeholder="¿Qué quieres compartir hoy?"
              value={publishText}
              onChange={(e) => setPublishText(e.target.value)}
              rows={3}
              maxLength={2000}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: 'var(--tp)',
                fontFamily: 'var(--fb)', fontSize: '0.97rem', lineHeight: 1.6,
                resize: 'none', outline: 'none', minHeight: 72,
              }}
            />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                <button key={key} type="button"
                  onClick={() => setPublishTag(publishTag === key ? '' : key)}
                  style={{
                    padding: '4px 11px', borderRadius: 'var(--radius-full)',
                    border: `1px solid ${publishTag === key ? 'var(--bglow)' : 'var(--border)'}`,
                    fontSize: '0.72rem', fontWeight: 800,
                    color: publishTag === key ? 'var(--acc)' : 'var(--tm)',
                    background: publishTag === key ? 'var(--acc-s)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                  {cfg.label}
                </button>
              ))}
            </div>
            <button type="submit"
              disabled={publishText.trim().length < 3 || isPublishing}
              style={{
                padding: '8px 20px', background: 'var(--acc)', color: 'var(--bg)',
                borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.83rem',
                border: 'none', cursor: 'pointer',
                opacity: (publishText.trim().length < 3 || isPublishing) ? 0.35 : 1,
              }}>
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </motion.form>
      ) : (
        <div style={{
          textAlign: 'center', padding: 24, marginBottom: 28,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 18, color: 'var(--tm)', fontSize: '0.9rem',
        }}>
          Inicia sesión para publicar y participar en la comunidad
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', marginBottom: 16,
          background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: 10, color: '#ff6b6b', fontSize: '0.88rem',
        }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ color: '#ff6b6b', fontSize: '1rem', padding: 4 }}>✕</button>
        </div>
      )}

      {/* Feed */}
      {loadingPosts ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--tf)' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid var(--bg-el)',
            borderTopColor: 'var(--acc)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p>Cargando posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 24px', color: 'var(--tf)' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>📝</div>
          <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700, marginBottom: 6, color: 'var(--tm)' }}>
            Aún no hay publicaciones
          </h3>
          <p style={{ fontSize: '0.88rem' }}>Sé el primero en compartir algo con la comunidad</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                currentUser={user}
                currentRole={role}
                isExpanded={expandedPosts.has(post.id)}
                showComments={expandedComments.has(post.id)}
                onLike={handleLike}
                onShare={handleShare}
                onReport={handleReport}
                onDelete={handleDelete}
                onToggleComments={toggleComments}
                onToggleExpand={toggleExpand}
                onCommentAdded={loadPosts}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PostCard
// ═══════════════════════════════════════════════════════
interface PostCardProps {
  post: Post; index: number; currentUser: User | null; currentRole: string;
  isExpanded: boolean; showComments: boolean;
  onLike: (id: string) => void; onShare: (p: Post) => void;
  onReport: (id: string, reason: string) => void; onDelete: (id: string) => void;
  onToggleComments: (id: string) => void; onToggleExpand: (id: string) => void;
  onCommentAdded: () => void;
}

function PostCard({
  post, index, currentUser, currentRole, isExpanded, showComments,
  onLike, onShare, onReport, onDelete, onToggleComments, onToggleExpand, onCommentAdded,
}: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const authorName = getAuthorName(post.author);
  const isLong = post.text.length > 260;
  const isAdmin = currentRole === 'admin';
  const isAuthor = currentUser?.id === post.user_id;
  const tagCfg = TAG_CONFIG[post.tag] || TAG_CONFIG.familia;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const actionBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: '0.77rem', color: 'var(--tf)', padding: '5px 10px',
    borderRadius: 7, background: 'none', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'var(--tr)',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) } as const}
      layout
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 15, padding: 22, transition: 'var(--tr)',
      }}
    >
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
        <Avatar name={authorName} photo={post.author.photo} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            {authorName}
            {post.author.role === 'admin' && (
              <span style={{
                width: 15, height: 15, background: 'var(--acc)', borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.5rem', color: 'var(--bg)',
              }}>✓</span>
            )}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--tf)', marginTop: 1 }}>
            {formatTime(post.created_at)}
          </div>
        </div>
        <span style={{
          padding: '3px 9px', borderRadius: 'var(--radius-full)',
          fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.04em',
          textTransform: 'uppercase', background: tagCfg.bg, color: tagCfg.color,
        }}>
          {tagCfg.label}
        </span>
      </div>

      {/* Cuerpo */}
      <div style={{
        fontSize: '0.93rem', lineHeight: 1.72, color: 'var(--tp)',
        marginBottom: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        ...(isLong && !isExpanded ? {
          display: '-webkit-box', WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
        } : {}),
      }}>
        {post.text}
      </div>
      {isLong && !isExpanded && (
        <button onClick={() => onToggleExpand(post.id)} style={{
          fontSize: '0.8rem', color: 'var(--acc)', fontWeight: 700,
          cursor: 'pointer', background: 'none', border: 'none', padding: 0, marginBottom: 10,
        }}>Ver más</button>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => onLike(post.id)}
          disabled={!currentUser}
          style={{
            ...actionBtnStyle,
            color: post.user_has_liked ? '#ff6b6b' : 'var(--tf)',
            opacity: currentUser ? 1 : 0.5,
          }}
        >
          {post.user_has_liked ? '♥' : '♡'} {post.like_count > 0 ? post.like_count : ''}
        </button>

        <button onClick={() => onToggleComments(post.id)} style={actionBtnStyle}>
          💬 {post.comment_count > 0 ? post.comment_count : ''}
        </button>

        <button onClick={() => onShare(post)} style={actionBtnStyle}>
          ↗ Compartir
        </button>

        {/* Menú */}
        <div ref={menuRef} style={{ position: 'relative', marginLeft: 'auto' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={actionBtnStyle}>···</button>
          {showMenu && (
            <div style={{
              position: 'absolute', right: 0, bottom: '100%', marginBottom: 6,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 6, minWidth: 160,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 10,
            }}>
              {currentUser && (
                <button onClick={() => { onReport(post.id, 'contenido inapropiado'); setShowMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 12px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600,
                    color: 'var(--tm)', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>🚩 Reportar</button>
              )}
              {(isAdmin || isAuthor) && (
                <button onClick={() => { onDelete(post.id); setShowMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 12px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600,
                    color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>🗑 Eliminar</button>
              )}
              <button onClick={() => setShowMenu(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '8px 12px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--tm)', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>Cancelar</button>
            </div>
          )}
        </div>
      </div>

      {/* Comentarios */}
      {showComments && (
        <CommentSection postId={post.id} currentUser={currentUser} onCommentAdded={onCommentAdded} />
      )}
    </motion.article>
  );
}

// ═══════════════════════════════════════════════════════
// CommentSection
// ═══════════════════════════════════════════════════════
interface CommentSectionProps {
  postId: string;
  currentUser: User | null;
  onCommentAdded: () => void;
}

function CommentSection({ postId, currentUser, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadComments() {
      setLoading(true);
      try {
const { data, error } = await supabase
          .from('comments')
          .select('id, text, created_at, user_id')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Error cargando comentarios:', error);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setComments([]);
          setLoading(false);
          return;
        }

        const uniqueUserIds = [...new Set(data.map((c) => c.user_id).filter(Boolean))];
        const authorsMap: Record<string, PostAuthor> = {};
        if (uniqueUserIds.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, name, photo, email, role')
            .in('id', uniqueUserIds);
          (usersData ?? []).forEach((u) => {
            authorsMap[u.id] = { name: u.name, photo: u.photo, email: u.email, role: u.role };
          });
        }

        setComments(data.map((c) => ({
          id: c.id, text: c.text, created_at: c.created_at, user_id: c.user_id,
          author: authorsMap[c.user_id] || { name: null, photo: null, email: null, role: null },
        })));
      } catch (e) {
        console.warn('Error inesperado cargando comentarios:', e);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  async function handleSendComment(e: FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (text.length < 1 || !currentUser || isSending) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: currentUser.id, text }])
        .select()
        .single();

      if (error) {
        console.error('Error publicando comentario:', error);
        alert('No se pudo publicar el comentario.');
        return;
      }

      setComments((prev) => [...prev, {
        id: data.id, text: data.text, created_at: data.created_at, user_id: data.user_id,
        author: {
          name: currentUser.user_metadata?.full_name || null,
          photo: currentUser.user_metadata?.avatar_url || null,
          email: currentUser.email || null, role: null,
        },
      }]);
      setCommentText('');
      onCommentAdded();
    } catch {
      console.error('Error inesperado publicando comentario');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 } as const}
      style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', overflow: 'hidden' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--tf)', fontSize: '0.82rem', padding: '12px 0' }}>
          Cargando comentarios...
        </div>
      ) : (
        <>
          {comments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              {comments.map((c) => {
                const name = getAuthorName(c.author);
                return (
                  <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Avatar name={name} photo={c.author.photo} size="small" />
                    <div style={{ flex: 1, background: 'var(--bg-el)', borderRadius: 12, padding: '8px 12px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--tp)', marginRight: 6 }}>{name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--tm)', wordBreak: 'break-word' }}>{c.text}</span>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--tf)', marginTop: 3 }}>
                        {formatTime(c.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {currentUser ? (
            <form onSubmit={handleSendComment} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                placeholder="Escribe un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={1}
                maxLength={500}
                style={{
                  flex: 1, background: 'var(--bg-el)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '8px 12px', color: 'var(--tp)',
                  fontFamily: 'var(--fb)', fontSize: '0.85rem', resize: 'none',
                  outline: 'none', minHeight: 36,
                }}
              />
              <button type="submit"
                disabled={commentText.trim().length < 1 || isSending}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--acc)',
                  color: 'var(--bg)', fontSize: '1rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  opacity: (commentText.trim().length < 1 || isSending) ? 0.35 : 1,
                }}>
                {isSending ? '...' : '→'}
              </button>
            </form>
          ) : (
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--tf)', padding: '8px 0' }}>
              Inicia sesión para comentar
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// Avatar reutilizable
// ═══════════════════════════════════════════════════════
function Avatar({ name, photo, size = 'normal' }: { name: string; photo?: string | null; size?: 'small' | 'normal' }) {
  const dim = size === 'small' ? 28 : 38;

  if (photo) {
    return (
      <img src={photo} alt="" referrerPolicy="no-referrer"
        style={{ width: dim, height: dim, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  return (
    <div style={{
      width: dim, height: dim, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--acc), var(--acc2))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size === 'small' ? '0.65rem' : '0.85rem',
      color: 'var(--bg)',
    }}>
      {getInitials(name || 'U')}
    </div>
  );
}
