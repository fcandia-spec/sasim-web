import { useTheme } from '@/context/ThemeContext';

export default function ConoceMas() {
  const { theme, toggle, label } = useTheme();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 32px 100px' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Conoce <span style={{ color: 'var(--acc)' }}>más</span>
        </h2>
        <p style={{ color: 'var(--tm)' }}>Información legal, configuración y agradecimientos.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--acc)', marginBottom: 14 }}>Políticas y Privacidad</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.7, marginBottom: 12 }}>SASIM respeta tu privacidad. Los datos personales recopilados (nombre, email, foto de perfil) provienen exclusivamente de tu cuenta de Google al iniciar sesión y se utilizan únicamente para personalizar tu experiencia en la plataforma.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.7, marginBottom: 12 }}>No compartimos tu información con terceros. Los datos de pago son procesados directamente por MercadoPago; SASIM no almacena datos de tarjetas.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.7 }}>Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento contactándonos a fcandia333@gmail.com.</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--acc)', marginBottom: 14 }}>Patrocinadores</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.7, marginBottom: 12 }}>SASIM es un proyecto independiente creado con pasión por la educación y la tecnología. Actualmente no contamos con patrocinadores externos.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.7 }}>Si te interesa apoyar el proyecto o colaborar, escríbenos a fcandia333@gmail.com.</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--acc)', marginBottom: 14 }}>Ajustes</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Tema</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--tm)', marginTop: 2 }}>{label}</div>
            </div>
            <button onClick={toggle} style={{
              width: 52, height: 28, background: theme === 'light' ? 'var(--acc-s)' : 'var(--bg-el)',
              border: '1px solid ' + (theme === 'light' ? 'var(--acc)' : 'var(--border)'),
              borderRadius: 14, position: 'relative', cursor: 'pointer', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: theme === 'light' ? 27 : 3,
                width: 20, height: 20, background: 'var(--acc)', borderRadius: '50%',
                transition: 'var(--tr)',
              }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
