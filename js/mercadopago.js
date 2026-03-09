/* ═══════════════════════════════════════════════════════════
   SASIM — MercadoPago (mercadopago.js)
   Suscripciones y verificación de estado.
   
   La suscripción funciona con URL directa al checkout de MP.
   El SDK se carga por si se necesita en el futuro, pero
   actualmente no se usa activamente (el botón abre la URL).
   
   Depende de: supabase.js (para _sb, _user)
   ═══════════════════════════════════════════════════════════ */

var MP_KEY = 'APP_USR-ad50aecf-4177-44e7-b508-b90a7045a124';
var PLAN_ID = '1a22a11fecaa48d8b38ea219cabaeb89';

// ═══ INICIALIZAR SDK ═══
// Se ejecuta al cargar el DOM. El SDK puede fallar en conexiones lentas
// pero no bloquea nada porque usamos URL directa.

function initMercadoPago() {
  try {
    window._mp = new MercadoPago(MP_KEY, { locale: 'es-CL' });
  } catch (e) {
    console.warn('MercadoPago SDK no disponible:', e.message);
  }
}

// ═══ SUSCRIBIRSE ═══
// Abre el checkout de MercadoPago en una nueva pestaña.
// El plan cobra CLP $6.000/mes con tarjeta (no requiere cuenta MP).

function suscribirse() {
  var planUrl = 'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=' + PLAN_ID;
  window.open(planUrl, '_blank');
}

// ═══ VERIFICAR SUSCRIPCIÓN ═══
// Consulta el rol del usuario en Supabase para actualizar la UI.
// El webhook (Cloudflare Worker) ya actualizó el rol cuando MP confirmó el pago.

async function checkSubscription() {
  if (!_sb || !_user) return;

  try {
    var result = await _sb.from('users').select('role').eq('id', _user.id).single();
    var role = result.data ? result.data.role : null;

    if (role === 'subscriber' || role === 'admin') {
      // Ocultar candados, mostrar contenido premium
      document.querySelectorAll('.premium-lock').forEach(function(el) {
        el.style.display = 'none';
      });
      document.querySelectorAll('.premium-content').forEach(function(el) {
        el.style.display = 'block';
      });
    } else {
      // Mostrar candados, ocultar contenido premium
      document.querySelectorAll('.premium-lock').forEach(function(el) {
        el.style.display = 'flex';
      });
      document.querySelectorAll('.premium-content').forEach(function(el) {
        el.style.display = 'none';
      });
    }
  } catch (e) {
    console.warn('Error verificando suscripción:', e);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initMercadoPago);
