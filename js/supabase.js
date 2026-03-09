/* ═══════════════════════════════════════════════════════════
   SASIM — Supabase (supabase.js)
   Cliente, autenticación con Google, carga de datos.
   
   Este archivo se carga PRIMERO porque los demás dependen de:
   - _sb (cliente Supabase)
   - _user (usuario actual)
   - _userRole (rol del usuario)
   - VIDEOS[] y POSTS[] (datos cargados)
   ═══════════════════════════════════════════════════════════ */

// ── Configuración ──
var SUPABASE_URL = 'https://soanbvvthhfxwjycxved.supabase.co';
var SUPABASE_ANON = 'sb_publishable_FnI52GgK4i0h-LSCEGZ6sQ_XR-XAnS9';

// ── Estado global ──
// Usamos var para que sean accesibles desde todos los archivos JS.
// (En el futuro con React, esto se reemplaza por un store o context.)
var _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
var _user = null;
var _userRole = null;
var VIDEOS = [];
var POSTS = [];

// ── Constantes de categorías ──
var TAG_CLASS = { dibujo: 't-d', ia: 't-i', familia: 't-f', tech: 't-t' };
var TAG_LABEL = { dibujo: 'Dibujo', ia: 'IA', familia: 'Familia', tech: 'Tech' };

// ═══ AUTENTICACIÓN ═══

// onAuthStateChange es la ÚNICA fuente de verdad para la sesión.
// Supabase detecta automáticamente el hash #access_token=... de OAuth
// y dispara SIGNED_IN. NUNCA borrar el hash manualmente antes de esto.
_sb.auth.onAuthStateChange(function(event, session) {
  _user = session ? session.user : null;
  updateAuthUI();

  if (_user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    // Registrar usuario en tabla users si no existe
    _sb.from('users').upsert({
      id: _user.id,
      email: _user.email,
      name: (_user.user_metadata && _user.user_metadata.full_name) || '',
      photo: (_user.user_metadata && _user.user_metadata.avatar_url) || '',
    }, { onConflict: 'id', ignoreDuplicates: true });

    loadSupabaseData();
  }

  // Limpiar hash de la URL después de que Supabase ya procesó el token
  if (window.location.hash && window.location.hash.includes('access_token')) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

function loginGoogle() {
  _sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://sasim-2g5.pages.dev',
      queryParams: { prompt: 'select_account' }
    }
  });
}

function logout() {
  _sb.auth.signOut();
  _user = null;
  _userRole = null;
  updateAuthUI();
}

// ═══ ACTUALIZAR UI SEGÚN AUTH ═══

function updateAuthUI() {
  var btn = document.getElementById('auth-btn');
  var adminLink = document.getElementById('admin-link');
  var subBtn = document.getElementById('sub-btn');
  if (!btn) return;

  if (_user) {
    var name = 'Usuario';
    if (_user.user_metadata && _user.user_metadata.full_name) {
      name = _user.user_metadata.full_name.split(' ')[0];
    }
    btn.textContent = 'Salir (' + name + ')';
    btn.onclick = logout;

    // Consultar rol del usuario
    _sb.from('users').select('role').eq('id', _user.id).single().then(function(result) {
      _userRole = (result.data && result.data.role) || 'visitor';

      // Mostrar enlace de admin solo para admins
      if (_userRole === 'admin' && adminLink) {
        adminLink.style.display = 'inline-block';
      }

      // Ocultar botón de suscripción si ya es suscriptor o admin
      if (_userRole === 'subscriber' || _userRole === 'admin') {
        if (subBtn) subBtn.style.display = 'none';
      } else {
        if (subBtn) subBtn.style.display = 'inline-block';
      }

      // Verificar suscripción si la función existe (definida en mercadopago.js)
      if (typeof checkSubscription === 'function') {
        checkSubscription();
      }
    });
  } else {
    btn.textContent = 'Iniciar sesión';
    btn.onclick = loginGoogle;
    if (adminLink) adminLink.style.display = 'none';
    if (subBtn) subBtn.style.display = 'none';
  }
}

// ═══ CARGA DE DATOS ═══

async function loadSupabaseData() {
  try {
    // Cargar videos
    var vResult = await _sb.from('videos').select('*').order('created_at', { ascending: false });
    if (vResult.data && vResult.data.length > 0) {
      VIDEOS = vResult.data.map(function(v) {
        return {
          id: v.id,
          title: v.title,
          desc: v.description || '',
          tag: v.tag || 'familia',
          emoji: v.emoji || '🎬',
          yt: v.youtube_id || '',
          video_path: v.r2_key || '',
          thumbnail_key: v.thumbnail_key || '',
          is_premium: v.is_premium !== false,
          dur: v.duration || '',
          views: v.views || 0
        };
      });
      // Actualizar galería si la función existe (definida en app.js)
      if (typeof renderGallery === 'function') renderGallery();
    }

    // Cargar posts
    var pResult = await _sb.from('posts').select('*').order('created_at', { ascending: false });
    if (pResult.data && pResult.data.length > 0) {
      POSTS = pResult.data.map(function(p) {
        return {
          id: p.id,
          text: p.text,
          tag: p.tag || 'familia',
          ts: new Date(p.created_at).getTime(),
          likes: p.likes || 0
        };
      });
      // Actualizar blog si está visible
      if (typeof renderBlog === 'function' && currentPage === 'blog') {
        renderBlog();
      }
    }
  } catch (e) {
    console.warn('Error cargando datos de Supabase:', e);
  }
}
