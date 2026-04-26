import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Inicio from '@/pages/Inicio';
import Cursos from '@/pages/Cursos';
import CursoDetalle from '@/pages/CursoDetalle';
import Juegos from '@/pages/Juegos';
import Nosotros from '@/pages/Nosotros';
import Suscribirse from '@/pages/Suscribirse';
import ConoceMas from '@/pages/ConoceMas';
import Perfil from '@/pages/Perfil';

const Blog = lazy(() => import('@/pages/Blog'));

export default function App() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"            element={<Inicio />} />
          <Route path="/cursos"      element={<Cursos />} />
          <Route path="/cursos/:id"  element={<CursoDetalle />} />
          <Route path="/blog"        element={
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando…</div>}>
              <Blog />
            </Suspense>
          } />
          <Route path="/juegos"      element={<Juegos />} />
          <Route path="/nosotros"    element={<Nosotros />} />
          <Route path="/suscribirse" element={<Suscribirse />} />
          <Route path="/conocemas"   element={<ConoceMas />} />
          <Route path="/perfil"      element={<Perfil />} />
          <Route path="*"            element={<Inicio />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}