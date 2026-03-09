/* ═══════════════════════════════════════════════════════════
   SASIM — App principal (app.js)
   Navegación SPA, renderizado de galería, videos y blog.
   
   Depende de: supabase.js (ya cargado antes)
   Variables globales que usa: _sb, _user, _userRole, VIDEOS,
   POSTS, TAG_CLASS, TAG_LABEL, SUPABASE_URL
   ═══════════════════════════════════════════════════════════ */

// ── Estado de la app ──
var currentPage = 'inicio';
var sliderIdx = 0;
var selectedTag = '';
var activeTag = 'all';
var searchQuery = '';

// ═══ NAVEGACIÓN SPA ═══
// Cambia entre las "páginas" (divs) sin recargar.
// Es como tener un control remoto que enciende una pantalla y apaga las demás.

function go(page) {
  currentPage = page;

  // Activar la página correcta
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.toggle('active', p.id === 'page-' + page);
  });

  // Activar el link de navegación correcto
  document.querySelectorAll('.nav-link').forEach(function(l) {
    l.classList.toggle('active', l.id === 'nl-' + page);
  });

  // Renderizar contenido de la página si es necesario
  if (page === 'videos') renderVideos();
  if (page === 'blog') renderBlog();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ═══ UTILIDADES ═══

// Formatea un timestamp a tiempo relativo: "5m", "2h", "3d", "15 mar"
function fmtTime(ts) {
  var diff = (Date.now() - ts) / 1000;
  if (diff < 3600)  return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

// Escapa HTML para prevenir XSS al insertar texto del usuario
function escapeHTML(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Filtra videos según tag activo y búsqueda
function getFilteredVideos() {
  return VIDEOS.filter(function(v) {
    var matchesTag = activeTag === 'all' || v.tag === activeTag;
    var matchesSearch = !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });
}


// ═══ GALERÍA / SLIDER (Página Inicio) ═══
// Genera la HTML de una tarjeta para el slider horizontal.

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
      '<div class="smeta">' +
        '<span>▶ ' + (v.views || 0).toLocaleString() + '</span>' +
        (v.dur ? '<span>⏱ ' + escapeHTML(v.dur) + '</span>' : '') +
      '</div>' +
    '</div>' +
  '</div>';
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
    '<div class="sec-header">' +
      '<h2 class="sec-title"><span>Contenido</span> reciente</h2>' +
      '<a class="sec-link" href="#" onclick="go(\'videos\');return false;">Ver todo →</a>' +
    '</div>' +
    '<div class="slider-wrap">' +
      '<div class="slider-track" id="st" style="transform:translateX(-' + (sliderIdx * 330) + 'px)">' +
        VIDEOS.map(sliderCard).join('') +
      '</div>' +
    '</div>' +
    '<div class="sctrl">' +
      '<button class="sbtn" onclick="moveSlider(-1)"' + (sliderIdx === 0 ? ' disabled' : '') + '>←</button>' +
      '<button class="sbtn" onclick="moveSlider(1)"' + (sliderIdx >= maxIdx ? ' disabled' : '') + '>→</button>' +
      '<div class="dots">' + dots + '</div>' +
    '</div>';
}

function moveSlider(d) {
  sliderIdx = Math.max(0, Math.min(sliderIdx + d, Math.max(0, VIDEOS.length - 3)));
  renderGallery();
}

function dotClick(i) {
  sliderIdx = i;
  renderGallery();
}


// ═══ PÁGINA DE VIDEOS ═══

function renderVideos() {
  var inner = document.getElementById('vpage-inner');
  if (!inner) return;

  var filtered = getFilteredVideos();
  var tags = ['all', 'familia', 'dibujo', 'ia', 'tech'];

  // Construir botones de filtro
  var filterBtns = tags.map(function(t) {
    var label = t === 'all' ? 'Todos' : TAG_LABEL[t];
    var isActive = activeTag === t;
    return '<button class="filter-btn' + (isActive ? ' active' : '') + '" ' +
      'onclick="activeTag=\'' + t + '\';renderVideos()">' + label + '</button>';
  }).join('');

  // Construir tarjetas
  var cards = '';
  if (filtered.length > 0) {
    cards = filtered.map(function(v) {
      var tagClass = TAG_CLASS[v.tag] || 't-f';
      var tagLabel = TAG_LABEL[v.tag] || 'General';
      var thumbStyle = '';
      if (v.thumbnail_key) {
        thumbStyle = 'background:url(' + SUPABASE_URL + '/storage/v1/object/public/thumbnails/' + encodeURIComponent(v.thumbnail_key) + ') center/cover';
      }

      return '<div class="scard" onclick="openModal(\'' + v.id + '\')">' +
        '<div class="sthumb" style="' + thumbStyle + '">' +
          (v.thumbnail_key ? '' : escapeHTML(v.emoji || '🎬')) +
          (v.video_path ? '<span class="premium-badge">🔒 Premium</span>' : '') +
          '<button class="play-btn" onclick="openModal(\'' + v.id + '\');event.stopPropagation()">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="sinfo">' +
          '<span class="stag ' + tagClass + '">' + tagLabel + '</span>' +
          '<h3 class="stitle">' + escapeHTML(v.title) + '</h3>' +
          '<p class="sdesc">' + escapeHTML((v.desc || '').substring(0, 95)) + '…</p>' +
          '<div class="smeta">' +
            '<span>▶ ' + (v.views || 0).toLocaleString() + '</span>' +
            (v.dur ? '<span>⏱ ' + escapeHTML(v.dur) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    cards = '<p style="color:var(--tm);text-align:center;padding:40px">No se encontraron videos</p>';
  }

  inner.innerHTML =
    '<div style="margin-bottom:40px">' +
      '<h2 style="font-family:var(--fd);font-size:2.4rem;font-weight:900;letter-spacing:-.03em;margin-bottom:8px">' +
        'Todos los <span style="color:var(--acc)">videos</span></h2>' +
      '<p style="color:var(--tm)">Contenido animado sobre tecnología, diseño y crianza digital</p>' +
    '</div>' +
    '<div class="video-filters">' +
      '<input type="text" class="video-search" placeholder="Buscar videos..." value="' + escapeHTML(searchQuery) + '" ' +
        'oninput="searchQuery=this.value;renderVideos()">' +
      filterBtns +
    '</div>' +
    '<div class="vgrid">' + cards + '</div>';
}


// ═══ BLOG / POSTS ═══

function postCard(p) {
  var long = p.text && p.text.length > 260;
  var tagClass = TAG_CLASS[p.tag] || 't-f';
  var tagLabel = TAG_LABEL[p.tag] || 'General';

  return '<div class="pcard">' +
    '<div class="phead">' +
      '<div class="pav">S</div>' +
      '<div class="pmeta">' +
        '<div class="pauthor">SASIM <span class="vbadge">✓</span></div>' +
        '<div class="ptime">' + fmtTime(p.ts || Date.now()) + '</div>' +
      '</div>' +
      '<span class="ptag stag ' + tagClass + '">' + tagLabel + '</span>' +
    '</div>' +
    '<div class="pbody' + (long ? ' clamp' : '') + '" id="pb' + p.id + '">' + escapeHTML(p.text) + '</div>' +
    (long ? '<span class="pmore show" onclick="expandPost(\'' + p.id + '\')">Ver más</span>' : '') +
    '<div class="pacts">' +
      '<button class="act" id="like' + p.id + '" onclick="likePost(\'' + p.id + '\')">♡ ' + (p.likes || 0) + '</button>' +
      '<button class="act">💬 Comentar</button>' +
      '<button class="act">↗ Compartir</button>' +
    '</div>' +
  '</div>';
}

function renderBlog() {
  var inner = document.getElementById('bpage-inner');
  if (!inner) return;

  var tagBtns = ['familia', 'dibujo', 'ia', 'tech'].map(function(t) {
    return '<button class="tbtn' + (selectedTag === t ? ' on' : '') + '" onclick="selTag(\'' + t + '\')">' +
      TAG_LABEL[t] + '</button>';
  }).join('');

  inner.innerHTML =
    '<div class="bhead">' +
      '<h2>Ideas, <span style="color:var(--acc)">reflexiones</span> y recursos</h2>' +
      '<p>El muro de SASIM — tecnología, crianza y aprendizaje en pequeñas dosis</p>' +
    '</div>' +
    '<div class="composer">' +
      '<div class="ctop">' +
        '<div class="cav">S</div>' +
        '<textarea class="cta" id="ptxt" placeholder="¿Qué quieres compartir hoy?" oninput="checkPost()" rows="3"></textarea>' +
      '</div>' +
      '<div class="cbottom">' +
        '<div class="ctags">' + tagBtns + '</div>' +
        '<button class="btn-post" id="pbtn" disabled onclick="publishPost()">Publicar</button>' +
      '</div>' +
    '</div>' +
    '<div class="feed" id="feed">' + POSTS.map(postCard).join('') + '</div>';
}

function expandPost(id) {
  var el = document.getElementById('pb' + id);
  if (el) el.classList.remove('clamp');
  var more = document.querySelector('[onclick="expandPost(\'' + id + '\')"]');
  if (more) more.style.display = 'none';
}

function selTag(t) {
  selectedTag = selectedTag === t ? '' : t;
  renderBlog();
}

function checkPost() {
  var txt = document.getElementById('ptxt');
  var btn = document.getElementById('pbtn');
  if (txt && btn) {
    btn.disabled = txt.value.trim().length < 3;
  }
}

function likePost(id) {
  var p = POSTS.find(function(x) { return x.id === id; });
  if (!p) return;
  p.likes = (p.likes || 0) + 1;
  var btn = document.getElementById('like' + id);
  if (btn) {
    btn.textContent = '♥ ' + p.likes;
    btn.classList.add('liked');
  }
}

function publishPost() {
  var txtEl = document.getElementById('ptxt');
  if (!txtEl) return;
  var text = txtEl.value.trim();
  if (!text) return;

  var post = {
    id: 'p' + Date.now(),
    text: text,
    tag: selectedTag || 'familia',
    ts: Date.now(),
    likes: 0
  };
  POSTS.unshift(post);
  selectedTag = '';
  renderBlog();
}


// ═══ INICIALIZACIÓN ═══
// Renderizar la galería al cargar (puede estar vacía si Supabase aún no respondió)
renderGallery();
// Cargar datos de Supabase
loadSupabaseData();
