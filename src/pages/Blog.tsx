import { useState, useEffect } from 'react';
import { TAG_LABEL } from '@/lib/utils';
import { fmtTime } from '@/lib/utils';
import { HeartFavorite } from '@/components/ui/heart-favorite';
import { MessageCircle, Share2, Flag, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: string;
  text: string;
  tag: string;
  ts: number;
  likes: number;
  user_id: string | null;
  author_name: string;
  author_photo: string;
  liked_by_me: boolean;
  comment_count: number;
}

interface Comment {
  id: string;
  text: string;
  user_id: string;
  author_name: string;
  author_photo: string;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { loadPosts(); }, [user]);

  async function loadPosts() {
    try {
      // Traer posts con info del autor
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!postsData) { setLoading(false); return; }

      // Traer autores
      const userIds = [...new Set(postsData.map(p => p.user_id).filter(Boolean))];
      let usersMap: Record<string, { name: string; photo: string }> = {};

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, photo')
          .in('id', userIds);
        if (usersData) {
          usersData.forEach(u => { usersMap[u.id] = { name: u.name || 'Usuario', photo: u.photo || '' }; });
        }
      }

      // Traer likes del usuario actual
      let myLikes = new Set<string>();
      if (user) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        if (likesData) {
          likesData.forEach(l => myLikes.add(l.post_id));
        }
      }

      // Contar likes reales desde post_likes
      const { data: likeCounts } = await supabase
        .from('post_likes')
        .select('post_id');

      const likeCountMap: Record<string, number> = {};
      if (likeCounts) {
        likeCounts.forEach(l => {
          likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
        });
      }

      // Contar comentarios
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('post_id');

      const commentCountMap: Record<string, number> = {};
      if (commentCounts) {
        commentCounts.forEach(c => {
          commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
        });
      }

      const mapped: BlogPost[] = postsData.map(p => {
        const author = p.user_id ? usersMap[p.user_id] : null;
        return {
          id: p.id,
          text: p.text || '',
          tag: p.tag || 'familia',
          ts: new Date(p.created_at).getTime(),
          likes: likeCountMap[p.id] || 0,
          user_id: p.user_id,
          author_name: author?.name || 'SASIM',
          author_photo: author?.photo || '',
          liked_by_me: myLikes.has(p.id),
          comment_count: commentCountMap[p.id] || 0,
        };
      });

      setPosts(mapped);
    } catch (e) {
      console.warn('Error cargando posts:', e);
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (text.trim().length < 3 || !user) return;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ text: text.trim(), tag: tag || 'familia', likes: 0, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error('Error publicando:', error); return; }

    if (data) {
      const newPost: BlogPost = {
        id: data.id,
        text: data.text,
        tag: data.tag || 'familia',
        ts: new Date(data.created_at).getTime(),
        likes: 0,
        user_id: user.id,
        author_name: user.user_metadata?.full_name || 'Usuario',
        author_photo: user.user_metadata?.avatar_url || '',
        liked_by_me: false,
        comment_count: 0,
      };
      setPosts(prev => [newPost, ...prev]);
    }
    setText('');
    setTag('');
  }

  async function handleLike(postId: string, isLiked: boolean) {
    if (!user) return;

    if (isLiked) {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
    } else {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    }

    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1), liked_by_me: isLiked } : p
    ));
  }

  async function handleShare(post: BlogPost) {
    const shareText = post.text.substring(0, 100) + (post.text.length > 100 ? '...' : '');
    const shareData = { title: 'SASIM — ' + post.author_name, text: shareText, url: 'https://sasim-web.pages.dev' };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(shareData.url + '\n\n' + shareText);
      alert('Enlace copiado al portapapeles');
    }
  }

  // Ordenar por likes
  const sortedPosts = [...posts].sort((a, b) => b.likes - a.likes);
  const tags = ['familia', 'dibujo', 'ia', 'tech'];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px 100px' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>
          Ideas, <span style={{ color: 'var(--acc)' }}>reflexiones</span> y recursos
        </h2>
        <p style={{ color: 'var(--tm)' }}>El muro de SASIM — tecnología, crianza y aprendizaje en pequeñas dosis</p>
      </div>

      {/* Compositor */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--acc)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: 'var(--bg)' }}>
              {user ? (user.user_metadata?.full_name?.[0] || 'U') : '?'}
            </div>
          )}
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder={user ? '¿Qué quieres compartir hoy?' : 'Inicia sesión para publicar'}
            disabled={!user} rows={3}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--tp)', fontFamily: 'var(--fb)', fontSize: '0.97rem', lineHeight: 1.6, resize: 'none', outline: 'none', minHeight: 72, opacity: user ? 1 : 0.5 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {tags.map(t => (
              <button key={t} onClick={() => setTag(tag === t ? '' : t)} style={{
                padding: '4px 11px', borderRadius: 'var(--radius-full)',
                border: '1px solid ' + (tag === t ? 'var(--bglow)' : 'var(--border)'),
                fontSize: '0.72rem', fontWeight: 800,
                color: tag === t ? 'var(--acc)' : 'var(--tm)',
                background: tag === t ? 'var(--acc-s)' : 'transparent',
              }}>{TAG_LABEL[t]}</button>
            ))}
          </div>
          <button onClick={publish} disabled={text.trim().length < 3 || !user} style={{
            padding: '8px 20px', background: 'var(--acc)', color: 'var(--bg)',
            borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.83rem',
            opacity: (text.trim().length < 3 || !user) ? 0.35 : 1,
          }}>Publicar</button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--tm)' }}>Cargando publicaciones...</div>}
        {!loading && sortedPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 70, color: 'var(--tf)' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>📝</div>
            <p style={{ color: 'var(--tm)' }}>Aún no hay publicaciones. ¡Sé el primero!</p>
          </div>
        )}
        {sortedPosts.map(p => (
          <PostCard key={p.id} post={p} onLike={handleLike} onShare={handleShare} />
        ))}
      </div>
    </div>
  );
}


// ═══ POST CARD ═══
function PostCard({ post, onLike, onShare }: {
  post: BlogPost;
  onLike: (id: string, liked: boolean) => void;
  onShare: (post: BlogPost) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useAuth();
  const isLong = post.text.length > 260;

  const tagClass = post.tag === 'dibujo' ? 'bg-red-500/15 text-red-400' :
                   post.tag === 'ia' ? 'bg-green-500/15 text-green-400' :
                   post.tag === 'familia' ? 'bg-amber-500/15 text-amber-400' :
                   'bg-purple-500/15 text-purple-400';
  const tagLabel = TAG_LABEL[post.tag] || 'General';

  async function loadComments() {
    setLoadingComments(true);
    try {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: usersData } = await supabase.from('users').select('id, name, photo').in('id', userIds);
        const usersMap: Record<string, { name: string; photo: string }> = {};
        usersData?.forEach(u => { usersMap[u.id] = { name: u.name || 'Usuario', photo: u.photo || '' }; });

        setComments(commentsData.map(c => ({
          id: c.id, text: c.text, user_id: c.user_id, created_at: c.created_at,
          author_name: usersMap[c.user_id]?.name || 'Usuario',
          author_photo: usersMap[c.user_id]?.photo || '',
        })));
      }
    } catch (e) { console.warn('Error cargando comentarios:', e); }
    finally { setLoadingComments(false); }
  }

  function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) loadComments();
  }

  async function submitComment() {
    if (!user || commentText.trim().length < 1) return;
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: post.id, user_id: user.id, text: commentText.trim() }])
      .select()
      .single();

    if (error) { console.error('Error comentando:', error); return; }
    if (data) {
      setComments(prev => [...prev, {
        id: data.id, text: data.text, user_id: user.id, created_at: data.created_at,
        author_name: user.user_metadata?.full_name || 'Usuario',
        author_photo: user.user_metadata?.avatar_url || '',
      }]);
    }
    setCommentText('');
  }

  async function reportPost() {
    if (!user) return;
    const reason = prompt('¿Por qué reportas esta publicación?');
    if (!reason) return;
    await supabase.from('reports').insert([{ post_id: post.id, user_id: user.id, reason }]);
    alert('Reporte enviado. Gracias por ayudar a mantener la comunidad.');
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 15, padding: 22 }}>
      {/* Header con autor real */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
        {post.author_photo ? (
          <img src={post.author_photo} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: 'var(--bg)' }}>
            {post.author_name[0]}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            {post.author_name}
            {!post.user_id && (
              <span style={{ width: 15, height: 15, background: 'var(--acc)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'var(--bg)' }}>✓</span>
            )}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--tf)', marginTop: 1 }}>{fmtTime(post.ts)}</div>
        </div>
        <span className={tagClass} style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.04em' }}>{tagLabel}</span>
      </div>

      {/* Body */}
      <div style={{
        fontSize: '0.93rem', lineHeight: 1.72, marginBottom: 14, whiteSpace: 'pre-wrap',
        ...(isLong && !expanded ? { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' } : {}),
      }}>{post.text}</div>
      {isLong && !expanded && (
        <span onClick={() => setExpanded(true)} style={{ fontSize: '0.8rem', color: 'var(--acc)', fontWeight: 700, cursor: 'pointer' }}>Ver más</span>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <HeartFavorite count={post.likes} size="sm" liked={post.liked_by_me} onToggle={(liked) => onLike(post.id, liked)} />
        <button onClick={toggleComments} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--tf)', padding: '4px 8px', borderRadius: 7 }}>
          <MessageCircle size={16} />
          {post.comment_count > 0 ? post.comment_count : ''} Comentar
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button onClick={() => onShare(post)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--tf)', padding: '4px 8px', borderRadius: 7 }}>
          <Share2 size={16} /> Compartir
        </button>
        {user && (
          <button onClick={reportPost} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--tf)', padding: '4px 6px', borderRadius: 7, marginLeft: 'auto' }} title="Reportar">
            <Flag size={14} />
          </button>
        )}
      </div>

      {/* Sección de comentarios */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}
          >
            {loadingComments && <div style={{ fontSize: '0.82rem', color: 'var(--tm)', padding: '8px 0' }}>Cargando comentarios...</div>}

            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {c.author_photo ? (
                  <img src={c.author_photo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-el)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, color: 'var(--tm)' }}>{c.author_name[0]}</div>
                )}
                <div style={{ flex: 1, background: 'var(--bg-el)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 2 }}>{c.author_name}</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}

            {user ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitComment()}
                  placeholder="Escribe un comentario..."
                  style={{ flex: 1, padding: '8px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-el)', color: 'var(--tp)', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--fb)' }}
                />
                <button onClick={submitComment} disabled={commentText.trim().length < 1} style={{
                  width: 34, height: 34, borderRadius: '50%', background: commentText.trim() ? 'var(--acc)' : 'var(--bg-el)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Send size={14} style={{ color: commentText.trim() ? 'var(--bg)' : 'var(--tf)' }} />
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--tm)', textAlign: 'center', padding: 8 }}>
                Inicia sesión para comentar
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
