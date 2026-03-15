import { useState } from 'react';
import { TAG_LABEL } from '@/lib/utils';
import { fmtTime } from '@/lib/utils';
import type { Post } from '@/types';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');

  function publish() {
    if (text.trim().length < 3) return;
    setPosts(prev => [{ id: 'p' + Date.now(), text: text.trim(), tag: tag || 'familia', ts: Date.now(), likes: 0 }, ...prev]);
    setText('');
    setTag('');
  }

  function like(id: string) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  }

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
                padding: '4px 11px', borderRadius: 'var(--radius-full)', border: '1px solid ' + (tag === t ? 'var(--bglow)' : 'var(--border)'),
                fontSize: '0.72rem', fontWeight: 800, color: tag === t ? 'var(--acc)' : 'var(--tm)',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 70, color: 'var(--tf)' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>📝</div>
            <p style={{ color: 'var(--tm)' }}>Aún no hay publicaciones. ¡Sé el primero!</p>
          </div>
        )}
        {posts.map(p => (
          <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 15, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: 'var(--bg)' }}>S</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>SASIM</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--tf)' }}>{fmtTime(p.ts)}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.93rem', lineHeight: 1.72, marginBottom: 14, whiteSpace: 'pre-wrap' }}>{p.text}</div>
            <button onClick={() => like(p.id)} style={{ fontSize: '0.77rem', color: p.likes > 0 ? 'var(--danger)' : 'var(--tf)', padding: '4px 8px', borderRadius: 7 }}>
              {p.likes > 0 ? '♥' : '♡'} {p.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
