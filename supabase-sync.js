// supabase-sync.js — CORREGIDO para Supabase JS v2
// Define showSyncBadge() e initSupabase()
// Debe cargarse ANTES de app.js

/* ── Badge de sincronización ── */
function showSyncBadge(msg, color) {
  let el = document.getElementById('cedano-sync');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cedano-sync';
    el.style.cssText = [
      'position:fixed','top:10px','left:50%','transform:translateX(-50%)',
      'padding:4px 14px','border-radius:20px','font-size:11px',
      'font-weight:700','z-index:9999','pointer-events:none',
      'transition:opacity .4s','white-space:nowrap',
      'box-shadow:0 2px 12px rgba(0,0,0,.3)'
    ].join(';');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = color;
  el.style.color = (color === '#ff4d5e' || color === '#ffcc4d') ? (color === '#ffcc4d' ? '#000' : '#fff') : '#000';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

/* ── Inicializar Supabase v2 y sincronizar datos ── */
async function initSupabase() {
  // Verificar credenciales
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('[Supabase] Credenciales no encontradas — verifica config.js');
    showSyncBadge('☁ Config no encontrado', '#ffcc4d');
    return;
  }

  // En Supabase JS v2, el CDN expone window.supabase como objeto con createClient
  const supabaseLib = window.supabase;
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    console.warn('[Supabase] SDK v2 no disponible');
    showSyncBadge('☁ SDK no cargado', '#ff4d5e');
    return;
  }

  try {
    // Crear cliente Supabase v2
    window._cedanoDb = supabaseLib.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false }
      }
    );

    showSyncBadge('☁ Conectando...', '#4db5ff');

    const KEY = 'CEDANO_V6';

    // Intentar cargar datos remotos
    const { data, error } = await window._cedanoDb
      .from('cedano_state')
      .select('data, updated_at')
      .eq('id', 'main')
      .maybeSingle(); // maybeSingle() no lanza error si no hay fila

    const localRaw = localStorage.getItem(KEY);

    if (error) {
      console.error('[Supabase] Error al leer:', error.message);
      showSyncBadge('☁ Error al leer', '#ff4d5e');
      return;
    }

    if (!data || !data.data || Object.keys(data.data).length === 0) {
      // Sin datos remotos → subir localStorage si existe
      if (localRaw) {
        const { error: upErr } = await window._cedanoDb
          .from('cedano_state')
          .upsert({
            id: 'main',
            data: JSON.parse(localRaw),
            updated_at: new Date().toISOString()
          });
        if (upErr) {
          console.error('[Supabase] Error al subir:', upErr.message);
          showSyncBadge('☁ Error al subir', '#ff4d5e');
        } else {
          console.log('[Supabase] Datos subidos ✅');
          showSyncBadge('☁ Datos subidos', '#22d468');
        }
      } else {
        showSyncBadge('☁ Listo', '#22d468');
      }
      return;
    }

    // Comparar fechas para decidir qué versión usar
    const remoteLastOpen = data.data.lastOpenDate || '2000-01-01';
    const localLastOpen  = localRaw
      ? (JSON.parse(localRaw).lastOpenDate || '2000-01-01')
      : '2000-01-01';

    const remoteDate = new Date(remoteLastOpen);
    const localDate  = new Date(localLastOpen);

    if (remoteDate > localDate) {
      // Remoto más reciente → descargar
      console.log('[Supabase] Datos remotos más recientes → descargando...');
      localStorage.setItem(KEY, JSON.stringify(data.data));
      if (typeof loadState === 'function') window.state = loadState();
      if (typeof render === 'function') render();
      showSyncBadge('☁ Datos descargados', '#22d468');
    } else {
      // Local más reciente → subir
      console.log('[Supabase] Datos locales más recientes → subiendo...');
      if (localRaw) {
        const { error: upErr } = await window._cedanoDb
          .from('cedano_state')
          .upsert({
            id: 'main',
            data: JSON.parse(localRaw),
            updated_at: new Date().toISOString()
          });
        if (upErr) {
          console.error('[Supabase] Error sync:', upErr.message);
          showSyncBadge('☁ Error sync', '#ff4d5e');
        } else {
          showSyncBadge('☁ Sincronizado', '#22d468');
        }
      }
    }

  } catch (e) {
    console.error('[Supabase] Error inesperado:', e);
    showSyncBadge('☁ Sin conexión', '#ff4d5e');
  }
}