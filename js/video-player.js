/* ═══════════════════════════════════════════════════════════
   SASIM — Reproductor de Video (video-player.js)
   Modal de video con soporte para:
   - Videos privados en Supabase Storage (signed URLs)
   - Videos públicos de YouTube (embed)
   - Tracking de progreso (guarda cada 5 segundos)
   
   Depende de: supabase.js (para _sb, _user, _userRole, VIDEOS)
   ═══════════════════════════════════════════════════════════ */

// ═══ ABRIR MODAL ═══

function openModal(id) {
  var v = VIDEOS.find(function(x) { return x.id === id; });
  if (!v) return;

  document.getElementById('mtitle').textContent = v.title;
  document.getElementById('mdesc').textContent = v.desc || '';

  var container = document.getElementById('mvideo');

  // Prioridad: Supabase Storage (privado) > YouTube (público) > Placeholder
  if (v.video_path) {
    renderPrivateVideo(v, container);
  } else if (v.yt) {
    renderYouTubeVideo(v, container);
  } else {
    renderPlaceholder(v, container);
  }

  document.getElementById('modal').classList.add('open');
}

// ═══ CERRAR MODAL ═══

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal') || e.target.classList.contains('mclose')) {
    var container = document.getElementById('mvideo');
    container.innerHTML = ''; // Detiene cualquier video/iframe
    document.getElementById('modal').classList.remove('open');
  }
}

// ═══ VIDEO PRIVADO (Supabase Storage) ═══
// Los videos privados requieren una "URL firmada" (signed URL).
// Es como un pase temporal: Supabase genera un enlace que expira en 1 hora.

function renderPrivateVideo(v, container) {
  // Solo suscriptores y admins pueden ver
  if (_userRole === 'subscriber' || _userRole === 'admin') {
    _sb.storage.from('videos').createSignedUrl(v.video_path, 3600)
      .then(function(result) {
        if (result.error || !result.data || !result.data.signedUrl) {
          container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#f87171">Error al cargar video</div>';
          return;
        }

        container.innerHTML =
          '<video controls autoplay style="width:100%;height:100%;background:#000" id="active-video">' +
            '<source src="' + result.data.signedUrl + '" type="video/mp4">' +
            'Tu navegador no soporta video HTML5.' +
          '</video>';

        // Iniciar tracking de progreso
        initProgressTracking(v.id);
      });
  } else {
    // Mostrar paywall
    container.innerHTML =
      '<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;' +
        'background:linear-gradient(135deg,#111 0%,#1a1a2e 100%)">' +
        '<span style="font-size:3rem">🔒</span>' +
        '<span style="color:#ccc;font-size:1.1rem;text-align:center">Contenido exclusivo para suscriptores</span>' +
        '<button onclick="suscribirse()" style="padding:10px 24px;border-radius:9px;' +
          'background:linear-gradient(135deg,#009ee3,#00b4d8);color:#fff;font-weight:700;' +
          'border:none;cursor:pointer">Suscribirse</button>' +
      '</div>';
  }
}

// ═══ VIDEO YOUTUBE (Público) ═══

function renderYouTubeVideo(v, container) {
  container.innerHTML =
    '<iframe src="https://www.youtube.com/embed/' + v.yt + '?autoplay=1" ' +
      'style="width:100%;height:100%;border:none" ' +
      'allow="autoplay;encrypted-media" allowfullscreen></iframe>';
}

// ═══ PLACEHOLDER (Sin video) ═══

function renderPlaceholder(v, container) {
  container.innerHTML =
    '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
      'font-size:5.5rem;background:linear-gradient(135deg,#111 0%,#1a1a2e 100%)">' +
      (v.emoji || '🎬') +
    '</div>';
}

// ═══ TRACKING DE PROGRESO ═══
// Guarda la posición de reproducción cada 5 segundos.
// Así el usuario puede retomar donde lo dejó.

function initProgressTracking(videoId) {
  var videoEl = document.getElementById('active-video');
  if (!videoEl || !_user) return;

  // Restaurar posición guardada
  _sb.from('video_progress')
    .select('seconds')
    .eq('video_id', videoId)
    .eq('user_id', _user.id)
    .single()
    .then(function(result) {
      if (result.data && result.data.seconds > 0) {
        videoEl.currentTime = result.data.seconds;
      }
    });

  // Guardar progreso cada 5 segundos
  var lastSaved = 0;
  videoEl.addEventListener('timeupdate', function() {
    var now = Math.floor(videoEl.currentTime);
    if (now - lastSaved >= 5) {
      lastSaved = now;
      _sb.from('video_progress').upsert({
        user_id: _user.id,
        video_id: videoId,
        seconds: now,
        completed: videoEl.duration > 0 && now >= videoEl.duration - 5,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,video_id' });
    }
  });
}
