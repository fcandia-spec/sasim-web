import { useState } from 'react';
import { PLANES, FAQ } from '@/data/content';

const MP_PLAN_ID = '1a22a11fecaa48d8b38ea219cabaeb89';

export default function Suscribirse() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleSubscribe() {
    window.open('https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=' + MP_PLAN_ID, '_blank');
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 100px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
        Elige tu <span style={{ color: 'var(--acc)' }}>plan</span>
      </h2>
      <p style={{ color: 'var(--tm)', marginBottom: 40 }}>Accede a todo el contenido premium. Sin compromisos, cancela cuando quieras.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, maxWidth: 700, margin: '0 auto 60px' }}>
        {PLANES.map(plan => (
          <div key={plan.name} style={{
            background: 'var(--bg-card)', border: '1px solid ' + (plan.featured ? 'var(--acc)' : 'var(--border)'),
            borderRadius: 'var(--radius-lg)', padding: '36px 28px', textAlign: 'center',
            boxShadow: plan.featured ? '0 0 40px var(--acc-g)' : 'none',
          }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--acc-s)', color: 'var(--acc)', marginBottom: 16 }}>
              {plan.featured ? 'Mejor valor' : 'Popular'}
            </div>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>{plan.name}</h3>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '2.6rem', fontWeight: 900, color: 'var(--acc)', marginBottom: 4 }}>
              {plan.price}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--tm)' }}>{plan.period}</span>
            </div>
            {plan.savings && <div style={{ fontSize: '0.82rem', color: 'var(--acc3)', fontWeight: 700, marginBottom: 20 }}>{plan.savings}</div>}
            <ul style={{ listStyle: 'none', textAlign: 'left', margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: '0.9rem', color: 'var(--tm)', paddingLeft: 24, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--acc3)', fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={plan.available ? handleSubscribe : undefined} style={{
              width: '100%', padding: '14px 32px', background: 'var(--acc)',
              color: 'var(--bg)', borderRadius: 9, fontWeight: 800, fontSize: '0.95rem',
              opacity: plan.available ? 1 : 0.5,
            }}>{plan.available ? 'Suscribirme →' : 'Próximamente'}</button>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'left' }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 900, marginBottom: 20, textAlign: 'center' }}>
          Preguntas <span style={{ color: 'var(--acc)' }}>frecuentes</span>
        </h3>
        {FAQ.map((item, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 10, overflow: 'hidden' }}>
            <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
              padding: '18px 20px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              color: openFaq === i ? 'var(--acc)' : 'var(--tp)',
            }}>
              {item.q} <span>{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && (
              <div style={{ padding: '0 20px 18px', fontSize: '0.88rem', color: 'var(--tm)', lineHeight: 1.7 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
