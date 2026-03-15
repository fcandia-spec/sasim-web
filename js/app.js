/* ═══════════════════════════════════════════════════════════
   SASIM — App principal (app.js)
   Navegación SPA, renderizado de todas las páginas.
   Depende de: supabase.js
   ═══════════════════════════════════════════════════════════ */

var currentPage = 'inicio';
var sliderIdx = 0;
var selectedTag = '';
var activeTag = 'all';
var searchQuery = '';

// ═══ CATÁLOGO DE CURSOS ═══

var CURSOS = [
  { id: 'adopcion-digital',       title: 'Adopción Digital',                   desc: 'Introducción al mundo digital para familias. Aprende a integrar la tecnología de forma segura y positiva en el día a día.',           tag: 'familia', icon: '📱' },
  { id: 'dibujo-neuroplasticidad', title: 'Dibujo pro Neuroplasticidad',       desc: 'Desarrolla creatividad y conexiones neuronales a través del dibujo. Técnicas artísticas con base científica.',                             tag: 'dibujo', icon: '🎨' },
  { id: 'alfabetizacion-padres',   title: 'Alfabetización para Padres',        desc: 'Herramientas digitales esenciales para padres. Desde configurar controles parentales hasta entender las redes sociales.',                   tag: 'familia', icon: '👨‍👩‍👧' },
  { id: 'curso-gemini',           title: 'Curso de Gemini',                    desc: 'Aprende a usar Google Gemini para potenciar tu productividad, creatividad y aprendizaje.',                                                  tag: 'ia',     icon: '✦' },
  { id: 'curso-chatgpt',          title: 'Curso de ChatGPT',                   desc: 'Domina ChatGPT desde cero. Prompts efectivos, casos de uso prácticos y automatización de tareas.',                                          tag: 'ia',     icon: '🤖' },
  { id: 'curso-claude',           title: 'Curso de Claude',                    desc: 'Explora las capacidades de Claude para análisis, escritura, programación y razonamiento avanzado.',                                          tag: 'ia',     icon: '🧠' },
  { id: 'curso-python',           title: 'Curso de Python',                    desc: 'Programación desde cero con Python. Variables, funciones, proyectos prácticos y pensamiento computacional.',                                 tag: 'tech',   icon: '🐍' },
];

var JUEGOS_DATA = [
  { id: 'cocodigo',   title: 'CoCoding',           desc: 'Aprende programación de forma colaborativa. Resuelve desafíos de código con otros jugadores en tiempo real.',  icon: '💻' },
  { id: 'paintup',    title: 'PaintUp',             desc: 'Desafíos de dibujo cronometrados. Mejora tu técnica artística mientras compites y te diviertes.',              icon: '🎨' },
  { id: 'metodos',    title: 'Métodos de Estudio',  desc: 'Gamifica tu aprendizaje. Técnicas como Pomodoro, Feynman y Leitner convertidas en juegos interactivos.',      icon: '📖' },
];


// ═══ NAVEGACIÓN SPA ═══

function go(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.toggle('active', p.id === 'page-' + page);
  });
  document.querySelectorAll('.nav-link').forEach(function(l) {
    l.classList.toggle('active', l.id === 'nl-' + page);
  });

  if (page === 'cursos')      renderCursos();
  if (page === 'blog')        renderBlog();
  if (page === 'juegos')      renderJuegos();
  if (page === 'nosotros')    renderNosotros();
  if (page === 'suscribirse') renderSuscribirse();
  if (page === 'conocemas')   renderConoceMas();
  if (page === 'perfil')      renderProfile();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ═══ UTILIDADES ═══

function fmtTime(ts) {
  var diff = (Date.now() - ts) / 1000;
  if (diff < 3600)  return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

function escapeHTML(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getFilteredVideos() {
  return VIDEOS.filter(function(v) {
    var matchesTag = activeTag === 'all' || v.tag === activeTag;
    var matchesSearch = !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });
}


// ═══ GALERÍA / SLIDER (Inicio) ═══

function sliderCard(v) {
  var tagClass = TAG_CLASS[v.tag] || 't-f';
  var tagLabel = TAG_LABEL[v.tag] || 'General';
  var thumbBg = '';
  if (v.thumbnail_key) {
    thumbBg = 'background:url(' + SUPABASE_URL + '/storage/v1/object/public/thumbnails/' + encodeURIComponent(v.thumbnail_key) + ') center/cover';
  }
  return '<div class="scard" onclick="openModal(\'' + v.id + '\')">' +
    '<div class="sthumb" style="' + thumbBg + '">' +
      (v.thumbnail_key ? '' : escapeHTML(v.emoji || '🎬')) +
      '<button class="play-btn" onclick="openModal(\'' + v.id + '\');event.stopPropagation()">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M8 5v14l11-7z"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="sinfo">' +
      '<span class="stag ' + tagClass + '">' + tagLabel + '</span>' +
      '<h3 class="stitle">' + escapeHTML(v.title) + '</h3>' +
      '<p class="sdesc">' + escapeHTML((v.desc || '').substring(0, 85)) + '…</p>' +
      '<div class="smeta"><span>▶ ' + (v.views || 0).toLocaleString() + '</span>' +
        (v.dur ? '<span>⏱ ' + escapeHTML(v.dur) + '</span>' : '') +
      '</div>' +
    '</div></div>';
}

function renderGallery() {
  var el = document.getElementById('gal');
  if (!el) return;
  if (VIDEOS.length === 0) {
    el.innerHTML = '<div class="empty"><div class="ei">🎬</div><h3>Próximamente</h3><p>El contenido está en camino</p></div>';
    return;
  }
  var maxIdx = Math.max(0, VIDEOS.length - 3);
  var dots = VIDEOS.map(function(_, i) {
    return '<div class="dot' + (i === sliderIdx ? ' on' : '') + '" onclick="dotClick(' + i + ')"></div>';
  }).join('');
  el.innerHTML =
    '<div class="sec-header"><h2 class="sec-title"><span>Contenido</span> reciente</h2>' +
      '<a class="sec-link" href="#" onclick="go(\'cursos\');return false;">Ver todo →</a></div>' +
    '<div class="slider-wrap"><div class="slider-track" id="st" style="transform:translateX(-' + (sliderIdx * 330) + 'px)">' +
      VIDEOS.map(sliderCard).join('') + '</div></div>' +
    '<div class="sctrl">' +
      '<button class="sbtn" onclick="moveSlider(-1)"' + (sliderIdx === 0 ? ' disabled' : '') + '>←</button>' +
      '<button class="sbtn" onclick="moveSlider(1)"' + (sliderIdx >= maxIdx ? ' disabled' : '') + '>→</button>' +
      '<div class="dots">' + dots + '</div></div>';
}

function moveSlider(d) { sliderIdx = Math.max(0, Math.min(sliderIdx + d, Math.max(0, VIDEOS.length - 3))); renderGallery(); }
function dotClick(i) { sliderIdx = i; renderGallery(); }


// ═══ PÁGINA: CURSOS ═══

function renderCursos() {
  var inner = document.getElementById('cursos-inner');
  if (!inner) return;

  var cards = CURSOS.map(function(c) {
    var tagClass = TAG_CLASS[c.tag] || 't-f';
    var tagLabel = TAG_LABEL[c.tag] || 'General';
    return '<div class="curso-card">' +
      '<div class="curso-icon">' + c.icon + '</div>' +
      '<div class="curso-body">' +
        '<span class="stag ' + tagClass + '">' + tagLabel + '</span>' +
        '<h3 class="curso-title">' + escapeHTML(c.title) + '</h3>' +
        '<p class="curso-desc">' + escapeHTML(c.desc) + '</p>' +
        '<button class="profile-action" onclick="alert(\'Próximamente: ' + escapeHTML(c.title) + '\')">Ver curso →</button>' +
      '</div></div>';
  }).join('');

  inner.innerHTML =
    '<div class="pg-header">' +
      '<h2 class="pg-title"><span>Cursos</span></h2>' +
      '<p class="pg-desc">Aprende a tu ritmo. Cada curso está diseñado para transformar curiosidad en habilidad.</p>' +
    '</div>' +
    '<div class="cursos-grid">' + cards + '</div>' +
    '<div class="pg-header" style="margin-top:60px">' +
      '<h2 class="pg-title">Videos <span>disponibles</span></h2>' +
      '<p class="pg-desc">Contenido animado sobre tecnología, diseño y crianza digital</p>' +
    '</div>' +
    renderVideosSection();
}

function renderVideosSection() {
  var filtered = getFilteredVideos();
  var tags = ['all', 'familia', 'dibujo', 'ia', 'tech'];
  var filterBtns = tags.map(function(t) {
    var label = t === 'all' ? 'Todos' : TAG_LABEL[t];
    var isActive = activeTag === t;
    return '<button class="filter-btn' + (isActive ? ' active' : '') + '" onclick="activeTag=\'' + t + '\';renderCursos()">' + label + '</button>';
  }).join('');

  var cards = '';
  if (filtered.length > 0) {
    cards = filtered.map(function(v) {
      var tagClass = TAG_CLASS[v.tag] || 't-f';
      var tagLabel = TAG_LABEL[v.tag] || 'General';
      var thumbStyle = v.thumbnail_key ? 'background:url(' + SUPABASE_URL + '/storage/v1/object/public/thumbnails/' + encodeURIComponent(v.thumbnail_key) + ') center/cover' : '';
      return '<div class="scard" onclick="openModal(\'' + v.id + '\')">' +
        '<div class="sthumb" style="' + thumbStyle + '">' +
          (v.thumbnail_key ? '' : escapeHTML(v.emoji || '🎬')) +
          (v.video_path ? '<span class="premium-badge">🔒 Premium</span>' : '') +
          '<button class="play-btn" onclick="openModal(\'' + v.id + '\');event.stopPropagation()"><svg width="17" height="17" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M8 5v14l11-7z"/></svg></button>' +
        '</div><div class="sinfo">' +
          '<span class="stag ' + tagClass + '">' + tagLabel + '</span>' +
          '<h3 class="stitle">' + escapeHTML(v.title) + '</h3>' +
          '<p class="sdesc">' + escapeHTML((v.desc || '').substring(0, 95)) + '…</p>' +
          '<div class="smeta"><span>▶ ' + (v.views || 0).toLocaleString() + '</span>' + (v.dur ? '<span>⏱ ' + escapeHTML(v.dur) + '</span>' : '') + '</div>' +
        '</div></div>';
    }).join('');
  } else {
    cards = '<p style="color:var(--tm);text-align:center;padding:40px">No se encontraron videos</p>';
  }

  return '<div class="video-filters">' +
    '<input type="text" class="video-search" placeholder="Buscar videos..." value="' + escapeHTML(searchQuery) + '" oninput="searchQuery=this.value;renderCursos()">' +
    filterBtns + '</div><div class="vgrid">' + cards + '</div>';
}

// Mantener compatibilidad
function renderVideos() { go('cursos'); }


// ═══ PÁGINA: BLOG ═══

function postCard(p) {
  var long = p.text && p.text.length > 260;
  var tagClass = TAG_CLASS[p.tag] || 't-f';
  var tagLabel = TAG_LABEL[p.tag] || 'General';
  return '<div class="pcard">' +
    '<div class="phead"><div class="pav">S</div><div class="pmeta">' +
      '<div class="pauthor">SASIM <span class="vbadge">✓</span></div>' +
      '<div class="ptime">' + fmtTime(p.ts || Date.now()) + '</div></div>' +
      '<span class="ptag stag ' + tagClass + '">' + tagLabel + '</span></div>' +
    '<div class="pbody' + (long ? ' clamp' : '') + '" id="pb' + p.id + '">' + escapeHTML(p.text) + '</div>' +
    (long ? '<span class="pmore show" onclick="expandPost(\'' + p.id + '\')">Ver más</span>' : '') +
    '<div class="pacts">' +
      '<button class="act" id="like' + p.id + '" onclick="likePost(\'' + p.id + '\')">♡ ' + (p.likes || 0) + '</button>' +
      '<button class="act">💬 Comentar</button>' +
      '<button class="act">↗ Compartir</button></div></div>';
}

function renderBlog() {
  var inner = document.getElementById('bpage-inner');
  if (!inner) return;
  var tagBtns = ['familia', 'dibujo', 'ia', 'tech'].map(function(t) {
    return '<button class="tbtn' + (selectedTag === t ? ' on' : '') + '" onclick="selTag(\'' + t + '\')">' + TAG_LABEL[t] + '</button>';
  }).join('');

  inner.innerHTML =
    '<div class="bhead"><h2>Ideas, <span style="color:var(--acc)">reflexiones</span> y recursos</h2>' +
      '<p>El muro de SASIM — tecnología, crianza y aprendizaje en pequeñas dosis</p></div>' +
    '<div class="composer"><div class="ctop"><div class="cav">S</div>' +
      '<textarea class="cta" id="ptxt" placeholder="¿Qué quieres compartir hoy?" oninput="checkPost()" rows="3"></textarea></div>' +
      '<div class="cbottom"><div class="ctags">' + tagBtns + '</div>' +
      '<button class="btn-post" id="pbtn" disabled onclick="publishPost()">Publicar</button></div></div>' +
    '<div class="feed" id="feed">' + POSTS.map(postCard).join('') + '</div>';
}

function expandPost(id) {
  var el = document.getElementById('pb' + id);
  if (el) el.classList.remove('clamp');
  var more = document.querySelector('[onclick="expandPost(\'' + id + '\')"]');
  if (more) more.style.display = 'none';
}
function selTag(t) { selectedTag = selectedTag === t ? '' : t; renderBlog(); }
function checkPost() {
  var txt = document.getElementById('ptxt');
  var btn = document.getElementById('pbtn');
  if (txt && btn) btn.disabled = txt.value.trim().length < 3;
}
function likePost(id) {
  var p = POSTS.find(function(x) { return x.id === id; });
  if (!p) return;
  p.likes = (p.likes || 0) + 1;
  var btn = document.getElementById('like' + id);
  if (btn) { btn.textContent = '♥ ' + p.likes; btn.classList.add('liked'); }
}
function publishPost() {
  var txtEl = document.getElementById('ptxt');
  if (!txtEl) return;
  var text = txtEl.value.trim();
  if (!text) return;
  POSTS.unshift({ id: 'p' + Date.now(), text: text, tag: selectedTag || 'familia', ts: Date.now(), likes: 0 });
  selectedTag = '';
  renderBlog();
}


// ═══ PÁGINA: JUEGOS ═══

function renderJuegos() {
  var inner = document.getElementById('juegos-inner');
  if (!inner) return;
  var cards = JUEGOS_DATA.map(function(j) {
    return '<div class="curso-card">' +
      '<div class="curso-icon">' + j.icon + '</div>' +
      '<div class="curso-body">' +
        '<h3 class="curso-title">' + escapeHTML(j.title) + '</h3>' +
        '<p class="curso-desc">' + escapeHTML(j.desc) + '</p>' +
        '<span class="stag t-t" style="margin-top:8px;display:inline-block">Próximamente</span>' +
      '</div></div>';
  }).join('');

  inner.innerHTML =
    '<div class="pg-header">' +
      '<h2 class="pg-title"><span>Juegos</span></h2>' +
      '<p class="pg-desc">Aprende jugando. Desafíos interactivos que convierten el aprendizaje en diversión.</p>' +
    '</div><div class="cursos-grid">' + cards + '</div>';
}


// ═══ PÁGINA: SOBRE NOSOTROS ═══

function renderNosotros() {
  var inner = document.getElementById('nosotros-inner');
  if (!inner) return;
  inner.innerHTML =
    '<div class="pg-header">' +
      '<h2 class="pg-title">Sobre <span>nosotros</span></h2>' +
      '<p class="pg-desc">Conoce la esencia de SASIM — Sueña, Aprende, Siente, Imagina, Multiplica.</p>' +
    '</div>' +
    '<div class="about-grid">' +
      '<div class="about-card">' +
        '<div class="about-icon">🎯</div>' +
        '<h3 class="about-title">Misión</h3>' +
        '<p class="about-text">Democratizar el acceso al conocimiento tecnológico y creativo para familias hispanohablantes, cerrando la brecha digital con contenido cercano, práctico y de calidad.</p>' +
      '</div>' +
      '<div class="about-card">' +
        '<div class="about-icon">🔭</div>' +
        '<h3 class="about-title">Visión</h3>' +
        '<p class="about-text">Ser la plataforma de referencia en educación digital familiar en Latinoamérica, donde padres e hijos aprenden juntos y transforman la tecnología en una herramienta de crecimiento.</p>' +
      '</div>' +
      '<div class="about-card">' +
        '<div class="about-icon">💛</div>' +
        '<h3 class="about-title">Valores</h3>' +
        '<p class="about-text">Cercanía, honestidad, curiosidad, perseverancia e inclusión. Creemos que cada persona tiene el potencial de aprender y crecer sin importar su punto de partida.</p>' +
      '</div>' +
      '<div class="about-card">' +
        '<div class="about-icon">🚀</div>' +
        '<h3 class="about-title">Objetivos</h3>' +
        '<p class="about-text">Crear cursos accesibles sobre IA, programación y arte digital. Construir una comunidad activa de padres y educadores. Desarrollar herramientas interactivas de aprendizaje.</p>' +
      '</div>' +
    '</div>' +
    '<div class="about-maximas">' +
      '<h3 class="pg-title" style="font-size:1.3rem;margin-bottom:20px">Nuestras <span>máximas</span></h3>' +
      '<div class="maximas-row">' +
        '<div class="maxima"><strong>S</strong>ueña — Imagina lo que podrías lograr.</div>' +
        '<div class="maxima"><strong>A</strong>prende — El conocimiento es tu herramienta.</div>' +
        '<div class="maxima"><strong>S</strong>iente — Conecta con lo que haces.</div>' +
        '<div class="maxima"><strong>I</strong>magina — Crea sin límites.</div>' +
        '<div class="maxima"><strong>M</strong>ultiplica — Comparte lo aprendido.</div>' +
      '</div>' +
    '</div>';
}


// ═══ PÁGINA: SUSCRIBIRSE ═══

function renderSuscribirse() {
  var inner = document.getElementById('suscribirse-inner');
  if (!inner) return;
  inner.innerHTML =
    '<div class="pg-header" style="text-align:center">' +
      '<h2 class="pg-title">Elige tu <span>plan</span></h2>' +
      '<p class="pg-desc">Accede a todo el contenido premium. Sin compromisos, cancela cuando quieras.</p>' +
    '</div>' +
    '<div class="planes-grid">' +
      '<div class="plan-card">' +
        '<div class="plan-badge">Popular</div>' +
        '<h3 class="plan-name">Basic</h3>' +
        '<div class="plan-price">$6.000<span>/mes</span></div>' +
        '<ul class="plan-features">' +
          '<li>Acceso a todos los cursos</li>' +
          '<li>Videos exclusivos premium</li>' +
          '<li>Progreso guardado</li>' +
          '<li>Comunidad del blog</li>' +
          '<li>Soporte por email</li>' +
        '</ul>' +
        '<button class="btn-p" style="width:100%" onclick="suscribirse()">Suscribirme →</button>' +
      '</div>' +
      '<div class="plan-card plan-featured">' +
        '<div class="plan-badge">Mejor valor</div>' +
        '<h3 class="plan-name">Pro</h3>' +
        '<div class="plan-price">$55.000<span>/año</span></div>' +
        '<div class="plan-savings">Ahorras $17.000 vs mensual</div>' +
        '<ul class="plan-features">' +
          '<li>Todo lo del plan Basic</li>' +
          '<li>Acceso anticipado a nuevos cursos</li>' +
          '<li>Descargas offline</li>' +
          '<li>Certificados de finalización</li>' +
          '<li>Soporte prioritario</li>' +
        '</ul>' +
        '<button class="btn-p" style="width:100%" onclick="alert(\'Plan Pro próximamente\')">Próximamente</button>' +
      '</div>' +
    '</div>' +
    '<div class="faq-section">' +
      '<h3 class="pg-title" style="font-size:1.3rem;margin-bottom:20px;text-align:center">Preguntas <span>frecuentes</span></h3>' +
      '<div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">¿Puedo cancelar en cualquier momento?</div><div class="faq-a">Sí, puedes cancelar tu suscripción cuando quieras desde tu cuenta de MercadoPago. No hay permanencia mínima.</div></div>' +
      '<div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">¿Qué métodos de pago aceptan?</div><div class="faq-a">Aceptamos tarjetas de débito y crédito a través de MercadoPago. No necesitas tener una cuenta de MercadoPago para suscribirte.</div></div>' +
      '<div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">¿Qué incluye el contenido premium?</div><div class="faq-a">Videos exclusivos, cursos completos con material descargable, progreso guardado entre sesiones y acceso a la comunidad.</div></div>' +
      '<div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">¿Puedo compartir mi cuenta?</div><div class="faq-a">Cada suscripción es personal. Estamos trabajando en un plan familiar para el futuro.</div></div>' +
    '</div>';
}

function toggleFaq(el) {
  var answer = el.nextElementSibling;
  var isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
  answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
  el.classList.toggle('open', !isOpen);
}


// ═══ PÁGINA: CONOCE MÁS ═══

function renderConoceMas() {
  var inner = document.getElementById('conocemas-inner');
  if (!inner) return;
  inner.innerHTML =
    '<div class="pg-header">' +
      '<h2 class="pg-title">Conoce <span>más</span></h2>' +
      '<p class="pg-desc">Información legal, configuración y agradecimientos.</p>' +
    '</div>' +
    '<div class="info-sections">' +
      '<div class="info-panel">' +
        '<h3 class="info-title">Políticas y Privacidad</h3>' +
        '<p>SASIM respeta tu privacidad. Los datos personales recopilados (nombre, email, foto de perfil) provienen exclusivamente de tu cuenta de Google al iniciar sesión y se utilizan únicamente para personalizar tu experiencia en la plataforma.</p>' +
        '<p>No compartimos tu información con terceros. Los datos de pago son procesados directamente por MercadoPago; SASIM no almacena datos de tarjetas.</p>' +
        '<p>Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento contactándonos a fcandia333@gmail.com.</p>' +
      '</div>' +
      '<div class="info-panel">' +
        '<h3 class="info-title">Patrocinadores</h3>' +
        '<p>SASIM es un proyecto independiente creado con pasión por la educación y la tecnología. Actualmente no contamos con patrocinadores externos.</p>' +
        '<p>Si te interesa apoyar el proyecto o colaborar, escríbenos a fcandia333@gmail.com.</p>' +
      '</div>' +
      '<div class="info-panel">' +
        '<h3 class="info-title">Ajustes</h3>' +
        '<div class="setting-row">' +
          '<div><div class="setting-label">Tema</div>' +
            '<div class="setting-desc" id="theme-desc-conocemas">' + (document.documentElement.getAttribute('data-theme') === 'light' ? 'Naturaleza Educativa (claro)' : 'Claridad Cálida (oscuro)') + '</div></div>' +
          '<button class="theme-toggle' + (document.documentElement.getAttribute('data-theme') === 'light' ? ' light' : '') + '" onclick="toggleTheme()" title="Cambiar tema"></button>' +
        '</div>' +
      '</div>' +
    '</div>';
}


// ═══ PÁGINA: PERFIL ═══

function renderProfile() {
  var inner = document.getElementById('profile-inner');
  if (!inner) return;
  if (!_user) {
    inner.innerHTML = '<div class="profile-empty" style="margin-top:40px"><div class="profile-empty-icon">🔒</div>' +
      '<div class="profile-empty-text">Inicia sesión para ver tu perfil</div>' +
      '<button class="profile-action" onclick="loginGoogle()" style="margin-top:16px">Iniciar sesión</button></div>';
    return;
  }

  var name = (_user.user_metadata && _user.user_metadata.full_name) || 'Usuario';
  var email = _user.email || '';
  var photo = (_user.user_metadata && _user.user_metadata.avatar_url) || '';
  var role = _userRole || 'visitor';
  var roleLabel = role === 'admin' ? 'Admin' : (role === 'subscriber' ? 'Suscriptor' : 'Visitante');
  var roleClass = role === 'admin' ? 'role-admin-badge' : (role === 'subscriber' ? 'role-sub-badge' : 'role-visitor-badge');
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';

  inner.innerHTML =
    '<div class="profile-header">' +
      (photo ? '<img class="profile-avatar" src="' + escapeHTML(photo) + '" alt=""/>' : '') +
      '<div class="profile-info"><div class="profile-name">' + escapeHTML(name) + '</div>' +
        '<div class="profile-email">' + escapeHTML(email) + '</div>' +
        '<span class="profile-role ' + roleClass + '">' + roleLabel + '</span></div></div>' +
    '<div class="profile-section"><div class="profile-section-title"><span>▶</span> Mi progreso</div>' +
      '<div class="progress-grid" id="progress-grid"><div class="profile-empty"><div class="profile-empty-icon">📚</div><div class="profile-empty-text">Cargando...</div></div></div></div>' +
    '<div class="profile-section"><div class="profile-section-title"><span>✍</span> Mis publicaciones</div>' +
      '<div id="my-posts-feed">' + (POSTS.length > 0 ? POSTS.slice(0, 5).map(postCard).join('') : '<div class="profile-empty"><div class="profile-empty-icon">📝</div><div class="profile-empty-text">Aún no hay publicaciones</div></div>') + '</div>' +
      '<button class="profile-action" onclick="go(\'blog\')">Ir al blog →</button></div>' +
    '<div class="profile-section"><div class="profile-section-title"><span>⚙</span> Configuración</div>' +
      '<div class="settings-panel">' +
        '<div class="setting-row"><div><div class="setting-label">Tema</div>' +
          '<div class="setting-desc">' + (isLight ? 'Naturaleza Educativa (claro)' : 'Claridad Cálida (oscuro)') + '</div></div>' +
          '<button class="theme-toggle' + (isLight ? ' light' : '') + '" onclick="toggleTheme()"></button></div>' +
        '<div class="setting-row"><div><div class="setting-label">Cuenta</div>' +
          '<div class="setting-desc">' + escapeHTML(email) + '</div></div>' +
          '<button class="btn-logout-nav" onclick="logout()">Cerrar sesión</button></div></div></div>';

  loadVideoProgress();
}

async function loadVideoProgress() {
  var grid = document.getElementById('progress-grid');
  if (!grid || !_user || !_sb) return;
  try {
    var result = await _sb.from('video_progress').select('*').eq('user_id', _user.id);
    var progressData = result.data || [];
    if (progressData.length === 0 && VIDEOS.length === 0) {
      grid.innerHTML = '<div class="profile-empty"><div class="profile-empty-icon">🎬</div><div class="profile-empty-text">Aún no has visto ningún video</div><button class="profile-action" onclick="go(\'cursos\')">Explorar cursos →</button></div>';
      return;
    }
    if (VIDEOS.length > 0) {
      grid.innerHTML = VIDEOS.map(function(v) {
        var prog = progressData.find(function(p) { return p.video_id === v.id; });
        var seconds = prog ? prog.seconds : 0;
        var completed = prog ? prog.completed : false;
        var percent = 0;
        if (completed) { percent = 100; }
        else if (seconds > 0 && v.dur) {
          var parts = v.dur.split(':');
          var totalSecs = parts.length === 2 ? (parseInt(parts[0]) * 60 + parseInt(parts[1])) : 0;
          if (totalSecs > 0) percent = Math.min(Math.round((seconds / totalSecs) * 100), 99);
        }
        return '<div class="progress-card"><div class="progress-card-title">' + escapeHTML(v.title) + '</div>' +
          '<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:' + percent + '%"></div></div>' +
          '<div class="progress-label"><span>' + (completed ? '<span class="progress-completed">✓ Completado</span>' : (seconds > 0 ? Math.floor(seconds / 60) + ' min vistos' : 'Sin empezar')) + '</span><span>' + percent + '%</span></div></div>';
      }).join('');
    } else {
      grid.innerHTML = '<div class="profile-empty"><div class="profile-empty-icon">🎬</div><div class="profile-empty-text">No hay videos disponibles aún</div></div>';
    }
  } catch (e) {
    console.warn('Error cargando progreso:', e);
    grid.innerHTML = '<div class="profile-empty"><div class="profile-empty-text">Error al cargar progreso</div></div>';
  }
}


// ═══ TOGGLE DE TEMA ═══

function toggleTheme() {
  var html = document.documentElement;
  var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  document.cookie = 'sasim-theme=' + next + ';path=/;max-age=31536000';
  if (currentPage === 'perfil') renderProfile();
  if (currentPage === 'conocemas') renderConoceMas();
}

function restoreTheme() {
  var match = document.cookie.match(/sasim-theme=(\w+)/);
  if (match && match[1] === 'light') document.documentElement.setAttribute('data-theme', 'light');
}
restoreTheme();


// ═══ INICIALIZACIÓN ═══
renderGallery();
loadSupabaseData();
