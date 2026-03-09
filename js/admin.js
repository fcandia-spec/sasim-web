/* ═══════════════════════════════════════════════════════════
   SASIM — Panel Admin (admin.js)
   Autenticación con verificación de rol, CRUD completo,
   dashboard con estadísticas.
   
   Usa un async IIFE porque necesitamos await al inicio
   para verificar la sesión (Bug #6: top-level await no
   funciona en todos los navegadores sin type=module).
   ═══════════════════════════════════════════════════════════ */

(async function() {

  // ── Configuración ──
  var SUPABASE_URL  = 'https://soanbvvthhfxwjycxved.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_FnI52GgK4i0h-LSCEGZ6sQ_XR-XAnS9';
  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  var TAG_CLASS = { dibujo: 't-d', ia: 't-i', familia: 't-f', tech: 't-t' };
  var TAG_LABEL = { dibujo: 'Dibujo', ia: 'IA', familia: 'Familia', tech: 'Tech' };


  // ═══ CONTROL DE PANTALLAS ═══
  // El admin tiene 3 pantallas excluyentes: login, denegado, panel.
  // Solo una se muestra a la vez.

  function show(id) {
    ['login-screen', 'denied-screen', 'admin-panel'].forEach(function(s) {
      var el = document.getElementById(s);
      if (el) {
        el.style.display = s === id ? (s === 'admin-panel' ? 'block' : 'flex') : 'none';
      }
    });
  }


  // ═══ AUTENTICACIÓN + VERIFICACIÓN DE ROL ═══

  async function checkAccess(user) {
    if (!user) {
      show('login-screen');
      return;
    }

    var result = await sb.from('users').select('role').eq('id', user.id).single();
    var role = (result.data && result.data.role) || 'visitor';

    if (role !== 'admin') {
      show('denied-screen');
      return;
    }

    // Usuario es admin — mostrar panel
    var photoEl = document.getElementById('user-photo');
    var nameEl = document.getElementById('user-name');

    if (photoEl && user.user_metadata) {
      photoEl.src = user.user_metadata.avatar_url || '';
    }
    if (nameEl && user.user_metadata) {
      nameEl.textContent = (user.user_metadata.full_name || 'Admin').split(' ')[0];
    }

    show('admin-panel');
    loadAll();
  }

  // Verificar sesión existente
  var sessionResult = await sb.auth.getSession();
  var session = sessionResult.data ? sessionResult.data.session : null;
  await checkAccess(session ? session.user : null);

  // Escuchar cambios de autenticación
  sb.auth.onAuthStateChange(async function(event, session) {
    await checkAccess(session ? session.user : null);
  });

  // Botones de auth
  document.getElementById('btn-google-login').onclick = function() {
    sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://sasim-2g5.pages.dev/admin.html' }
    });
  };

  document.getElementById('btn-logout').onclick = function() {
    sb.auth.signOut();
  };

  document.getElementById('btn-denied-logout').onclick = function() {
    sb.auth.signOut();
  };


  // ═══ NAVEGACIÓN INTERNA (Sidebar) ═══

  function goSection(s) {
    document.querySelectorAll('.section').forEach(function(el) {
      el.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-link[data-section]').forEach(function(el) {
      el.classList.remove('active');
    });

    var sectionEl = document.getElementById('section-' + s);
    var linkEl = document.querySelector('[data-section="' + s + '"]');
    if (sectionEl) sectionEl.classList.add('active');
    if (linkEl) linkEl.classList.add('active');
  }

  // Exponer para onclick en HTML
  window.goSection = goSection;

  // Vincular clicks del sidebar
  document.querySelectorAll('.sidebar-link[data-section]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      goSection(btn.dataset.section);
    });
  });


  // ═══ CARGAR TODOS LOS DATOS ═══

  function loadAll() {
    loadDashboard();
    loadVideosTable();
    loadPostsTable();
    loadUsersTable();
  }


  // ═══ DASHBOARD ═══

  async function loadDashboard() {
    var results = await Promise.all([
      sb.from('videos').select('*', { count: 'exact', head: true }),
      sb.from('posts').select('*', { count: 'exact', head: true }),
      sb.from('users').select('*', { count: 'exact', head: true }),
      sb.from('posts').select('likes'),
    ]);

    document.getElementById('stat-videos').textContent = results[0].count || 0;
    document.getElementById('stat-posts').textContent  = results[1].count || 0;
    document.getElementById('stat-users').textContent  = results[2].count || 0;

    var totalLikes = 0;
    if (results[3].data) {
      results[3].data.forEach(function(p) { totalLikes += (p.likes || 0); });
    }
    document.getElementById('stat-likes').textContent = totalLikes;
  }


  // ═══ VIDEOS — TABLA ═══

  async function loadVideosTable() {
    var wrap = document.getElementById('videos-table-wrap');
    var result = await sb.from('videos').select('*').order('created_at', { ascending: false });
    var data = result.data;

    if (!data || data.length === 0) {
      wrap.innerHTML = '<table class="data-table"><tr class="empty-row"><td>No hay videos todavía</td></tr></table>';
      return;
    }

    var rows = data.map(function(v) {
      var premiumMark = v.is_premium ? ' <span style="color:var(--acc);font-size:.75rem">★ Premium</span>' : '';
      var sourceClass = v.r2_key ? 'source-private' : (v.youtube_id ? 'source-youtube' : 'source-none');
      var sourceLabel = v.r2_key ? 'Privado' : (v.youtube_id ? 'YouTube' : '—');
      var tagClass = TAG_CLASS[v.tag] || 't-f';
      var tagLabel = TAG_LABEL[v.tag] || '—';

      return '<tr>' +
        '<td class="td-title">' + escapeHTML(v.title) + premiumMark + '</td>' +
        '<td><span class="source-badge ' + sourceClass + '">' + sourceLabel + '</span></td>' +
        '<td><span class="tag-badge ' + tagClass + '">' + tagLabel + '</span></td>' +
        '<td class="td-muted">' + escapeHTML(v.duration || '—') + '</td>' +
        '<td class="td-muted">' + (v.views || 0).toLocaleString() + '</td>' +
        '<td><button class="btn-del" onclick="deleteVideo(\'' + v.id + '\',\'' + (v.r2_key || '') + '\',\'' + (v.thumbnail_key || '') + '\')">Eliminar</button></td>' +
      '</tr>';
    }).join('');

    wrap.innerHTML = '<table class="data-table">' +
      '<thead><tr><th>Título</th><th>Fuente</th><th>Cat.</th><th>Duración</th><th>Vistas</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
  }


  // ═══ VIDEOS — ELIMINAR ═══

  window.deleteVideo = async function(id, videoPath, thumbKey) {
    if (!confirm('¿Eliminar este video?')) return;

    // Eliminar archivos de Supabase Storage
    if (videoPath) {
      try { await sb.storage.from('videos').remove([videoPath]); }
      catch (e) { console.error('Error eliminando video:', e); }
    }
    if (thumbKey) {
      try { await sb.storage.from('thumbnails').remove([thumbKey]); }
      catch (e) { console.error('Error eliminando thumbnail:', e); }
    }

    await sb.from('videos').delete().eq('id', id);
    loadVideosTable();
    loadDashboard();
  };


  // ═══ VIDEOS — GUARDAR NUEVO ═══

  document.getElementById('btn-save-video').onclick = async function() {
    var title = document.getElementById('vt').value.trim();
    if (!title) return;

    var btn = document.getElementById('btn-save-video');
    btn.disabled = true;

    var videoFile = document.getElementById('vfile').files[0];
    var thumbFile = document.getElementById('vthumb').files[0];
    var youtubeId = document.getElementById('vyt').value.trim();
    var videoPath = '';
    var thumbnailKey = '';

    var progress = document.getElementById('upload-progress');
    var bar = document.getElementById('upload-bar');
    var status = document.getElementById('upload-status');

    // Subir video a Supabase Storage
    if (videoFile) {
      progress.style.display = 'block';
      bar.style.width = '20%';
      status.textContent = 'Subiendo video...';

      videoPath = Date.now() + '-' + videoFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_');

      var uploadResult = await sb.storage.from('videos').upload(videoPath, videoFile, {
        contentType: videoFile.type || 'video/mp4'
      });

      if (uploadResult.error) {
        status.textContent = 'Error subiendo video: ' + uploadResult.error.message;
        btn.disabled = false;
        return;
      }
      bar.style.width = '60%';
      status.textContent = 'Video subido. ';
    }

    // Subir thumbnail
    if (thumbFile) {
      if (progress.style.display === 'none' || !progress.style.display) {
        progress.style.display = 'block';
      }
      bar.style.width = '70%';
      status.textContent += 'Subiendo miniatura...';

      thumbnailKey = Date.now() + '-' + thumbFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_');

      var thumbResult = await sb.storage.from('thumbnails').upload(thumbnailKey, thumbFile, {
        contentType: thumbFile.type || 'image/jpeg'
      });

      if (thumbResult.error) {
        status.textContent = 'Error subiendo miniatura: ' + thumbResult.error.message;
        btn.disabled = false;
        return;
      }
      bar.style.width = '90%';
    }

    // Validar que haya al menos una fuente de video
    if (!videoPath && !youtubeId) {
      alert('Debes seleccionar un archivo de video o ingresar un YouTube ID');
      btn.disabled = false;
      return;
    }

    // Guardar metadata en Supabase
    await sb.from('videos').insert([{
      title: title,
      tag: document.getElementById('vtag').value,
      youtube_id: youtubeId,
      r2_key: videoPath,
      thumbnail_key: thumbnailKey,
      is_premium: document.getElementById('vpremium').checked,
      duration: document.getElementById('vdur').value.trim(),
      emoji: document.getElementById('vem').value.trim() || '🎬',
      description: document.getElementById('vdesc').value.trim(),
      views: 0,
    }]);

    bar.style.width = '100%';
    status.textContent = 'Todo guardado correctamente';

    // Limpiar formulario
    clearVideoForm();
    setTimeout(function() { progress.style.display = 'none'; }, 2000);

    var ok = document.getElementById('video-ok');
    ok.classList.add('show');
    setTimeout(function() { ok.classList.remove('show'); }, 3000);

    loadVideosTable();
    loadDashboard();
    btn.disabled = false;
  };


  // ═══ VIDEOS — LIMPIAR FORMULARIO ═══

  function clearVideoForm() {
    ['vt', 'vyt', 'vdur', 'vem', 'vdesc'].forEach(function(id) {
      document.getElementById(id).value = '';
    });
    document.getElementById('vfile').value = '';
    document.getElementById('vthumb').value = '';
    document.getElementById('vpremium').checked = true;
  }

  document.getElementById('btn-clear-video').onclick = function() {
    clearVideoForm();
    document.getElementById('upload-progress').style.display = 'none';
  };


  // ═══ POSTS — TABLA ═══

  async function loadPostsTable() {
    var wrap = document.getElementById('posts-table-wrap');
    var result = await sb.from('posts').select('*').order('created_at', { ascending: false });
    var data = result.data;

    if (!data || data.length === 0) {
      wrap.innerHTML = '<table class="data-table"><tr class="empty-row"><td>No hay posts todavía</td></tr></table>';
      return;
    }

    var rows = data.map(function(p) {
      var text = (p.text || '').substring(0, 80);
      var ellipsis = p.text && p.text.length > 80 ? '…' : '';
      var tagClass = TAG_CLASS[p.tag] || 't-f';
      var tagLabel = TAG_LABEL[p.tag] || '—';

      return '<tr>' +
        '<td class="td-title">' + escapeHTML(text) + ellipsis + '</td>' +
        '<td><span class="tag-badge ' + tagClass + '">' + tagLabel + '</span></td>' +
        '<td class="td-muted">♡ ' + (p.likes || 0) + '</td>' +
        '<td><button class="btn-del" onclick="deletePost(\'' + p.id + '\')">Eliminar</button></td>' +
      '</tr>';
    }).join('');

    wrap.innerHTML = '<table class="data-table">' +
      '<thead><tr><th>Contenido</th><th>Cat.</th><th>Likes</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
  }


  // ═══ POSTS — ELIMINAR ═══

  window.deletePost = async function(id) {
    if (!confirm('¿Eliminar este post?')) return;
    await sb.from('posts').delete().eq('id', id);
    loadPostsTable();
    loadDashboard();
  };


  // ═══ POSTS — PUBLICAR ═══

  document.getElementById('btn-save-post').onclick = async function() {
    var text = document.getElementById('ptext').value.trim();
    if (text.length < 3) return;

    var btn = document.getElementById('btn-save-post');
    btn.disabled = true;

    await sb.from('posts').insert([{
      text: text,
      tag: document.getElementById('ptag').value,
      author: 'SASIM',
      likes: 0
    }]);

    document.getElementById('ptext').value = '';

    var ok = document.getElementById('post-ok');
    ok.classList.add('show');
    setTimeout(function() { ok.classList.remove('show'); }, 3000);

    loadPostsTable();
    loadDashboard();
    btn.disabled = false;
  };


  // ═══ USUARIOS — TABLA ═══

  async function loadUsersTable() {
    var wrap = document.getElementById('users-table-wrap');
    var result = await sb.from('users').select('*').order('created_at', { ascending: false });
    var data = result.data;

    if (!data || data.length === 0) {
      wrap.innerHTML = '<table class="data-table"><tr class="empty-row"><td>No hay usuarios registrados</td></tr></table>';
      return;
    }

    var rows = data.map(function(u) {
      var roleClass = u.role === 'admin' ? 'role-admin' : (u.role === 'subscriber' ? 'role-sub' : '');
      var roleLabel = u.role || 'visitor';

      return '<tr>' +
        '<td>' +
          '<span class="td-title">' + escapeHTML(u.name || '—') + '</span><br>' +
          '<span class="td-muted" style="font-size:.78rem">' + escapeHTML(u.email || '') + '</span>' +
        '</td>' +
        '<td><span class="role-badge ' + roleClass + '">' + roleLabel + '</span></td>' +
        '<td>' +
          '<select class="role-select" onchange="changeRole(\'' + u.id + '\',this.value)">' +
            '<option value="visitor"' + (u.role === 'visitor' ? ' selected' : '') + '>Visitante</option>' +
            '<option value="subscriber"' + (u.role === 'subscriber' ? ' selected' : '') + '>Suscriptor</option>' +
            '<option value="admin"' + (u.role === 'admin' ? ' selected' : '') + '>Admin</option>' +
          '</select>' +
        '</td>' +
      '</tr>';
    }).join('');

    wrap.innerHTML = '<table class="data-table">' +
      '<thead><tr><th>Usuario</th><th>Rol</th><th>Cambiar rol</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
  }


  // ═══ USUARIOS — CAMBIAR ROL ═══

  window.changeRole = async function(id, role) {
    await sb.from('users').update({ role: role }).eq('id', id);
    loadUsersTable();
  };


  // ═══ UTILIDAD: Escape HTML ═══
  // Previene inyección de código malicioso al renderizar datos de usuario.

  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
