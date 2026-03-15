import { useState } from 'react';
import { TAG_LABEL } from '@/lib/utils';
import { fmtTime } from '@/lib/utils';
import { HeartFavorite } from '@/components/ui/heart-favorite';
import { MessageCircle, Share2 } from 'lucide-react';
import type { Post } from '@/types';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');

  function publish() {
    if (text.trim().length < 3) return;
    setPosts(prev => [
      { id: 'p' + Date.now(), text: text.trim(), tag: tag || 'familia', ts: Date.now(), likes: 0 },
      ...prev,
    ]);
    setText('');
    setTag('');
  }

  function handleLike(id: string, isLiked: boolean) {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1) } : p
      )
    );
  }

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

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 20, marginBottom: 28 }}>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="¿Qué quieres compartir hoy?" rows={3}
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--tp)', fontFamily: 'var(--fb)', fontSize: '0.97rem', lineHeight: 1.6, resize: 'none', outline: 'none', minHeight: 72 }}
        />
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
          <button onClick={publish} disabled={text.trim().length < 3} style={{
            padding: '8px 20px', background: 'var(--acc)', color: 'var(--bg)',
            borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.83rem',
            opacity: text.trim().length < 3 ? 0.35 : 1,
          }}>Publicar</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 70, color: 'var(--tf)' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>📝</div>
            <p style={{ color: 'var(--tm)' }}>Aún no hay publicaciones. ¡Sé el primero!</p>
          </div>
        )}
        {sortedPosts.map(p => (
          <PostCard key={p.id} post={p} onLike={handleLike} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string, liked: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.text.length > 260;
  const tagClass = post.tag === 'dibujo' ? 'bg-red-500/15 text-red-400' :
                   post.tag === 'ia' ? 'bg-green-500/15 text-green-400' :
                   post.tag === 'familia' ? 'bg-amber-500/15 text-amber-400' :
                   'bg-purple-500/15 text-purple-400';
  const tagLabel = TAG_LABEL[post.tag] || 'General';

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 15, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: 'var(--bg)' }}>S</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            SASIM
            <span style={{ width: 15, height: 15, background: 'var(--acc)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'var(--bg)' }}>✓</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--tf)', marginTop: 1 }}>{fmtTime(post.ts)}</div>
        </div>
        <span className={tagClass} style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.04em' }}>{tagLabel}</span>
      </div>

      <div style={{
        fontSize: '0.93rem', lineHeight: 1.72, marginBottom: 14, whiteSpace: 'pre-wrap',
        ...(isLong && !expanded ? { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' } : {}),
      }}>{post.text}</div>
      {isLong && !expanded && (
        <span onClick={() => setExpanded(true)} style={{ fontSize: '0.8rem', color: 'var(--acc)', fontWeight: 700, cursor: 'pointer' }}>Ver más</span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <HeartFavorite count={post.likes} size="sm" onToggle={(liked) => onLike(post.id, liked)} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--tf)', padding: '4px 8px', borderRadius: 7 }}>
          <MessageCircle size={16} /> Comentar
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: 'var(--tf)', padding: '4px 8px', borderRadius: 7 }}>
          <Share2 size={16} /> Compartir
        </button>
      </div>
    </div>
  );
}
