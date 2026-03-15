import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Inicio from '@/pages/Inicio';
import Cursos from '@/pages/Cursos';
import Blog from '@/pages/Blog';
import Juegos from '@/pages/Juegos';
import Nosotros from '@/pages/Nosotros';
import Suscribirse from '@/pages/Suscribirse';
import ConoceMas from '@/pages/ConoceMas';
import Perfil from '@/pages/Perfil';

export default function App() {
  const [page, setPage] = useState('inicio');

  function navigate(p: string) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPage() {
    switch (page) {
      case 'inicio':      return <Inicio onNavigate={navigate} />;
      case 'cursos':       return <Cursos />;
      case 'blog':         return <Blog />;
      case 'juegos':       return <Juegos />;
      case 'nosotros':     return <Nosotros />;
      case 'suscribirse':  return <Suscribirse />;
      case 'conocemas':    return <ConoceMas />;
      case 'perfil':       return <Perfil onNavigate={navigate} />;
      default:             return <Inicio onNavigate={navigate} />;
    }
  }

  return (
    <>
      <Nav page={page} onNavigate={navigate} />
      <main style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh' }}>
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
    </>
  );
}
