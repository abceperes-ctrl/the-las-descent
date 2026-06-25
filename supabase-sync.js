// supabase-sync.js — Realtime funcional sin autenticación (anon key)
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
  el.style.color = (color === '#ffcc4d' || color === '#22d468') ? '#000' : '#fff';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

function applyRemoteData(remoteData) {
  const KEY = 'CEDANO_V6';
  localStorage.setItem(KEY, JSON.stringify(remoteData));
  if (typeof loadState === 'function') {
    const fresh = loadState();
    // Actualiza la variable global que usa app.js
    try { state = fresh; } catch(e) {}
    window.state = fresh;
  }
  if (typeof checkDayReset === 'function') checkDayReset();
  if (typeof render === 'function') render();
}

function subscribeRealtime(db) {
  if (window._cedanoRealtimeChannel) {
    try { db.removeChannel(window._cedanoRealtimeChannel); } catch(e) {}
  }

  // IMPORTANTE: el nombre del canal NO puede ser 'realtime'
  window._cedanoRealtimeChannel = db
    .channel('cedano-main-sync')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',        // Solo escucha UPDATE (que es lo que hace saveState)
        schema: 'public',
        table: 'cedano_state',
        filter: 'id=eq.main'
      },
      (payload) => {
        console.log('[Realtime] UPDATE recibido');
        const remoteData = payload.new?.data;
        if (!remoteData) return;

        const remoteTs = payload.new?.updated_at || '2000-01-01';
        const localTs  = (window.state && window.state._updatedAt) || '2000-01-01';

        // Solo aplicar si el cambio remoto es más nuevo que lo local
        // Esto evita que un dispositivo se pise a sí mismo
        if (new Date(remoteTs) > new Date(localTs)) {
          showSyncBadge('☁ Actualizando...', '#4db5ff');
          applyRemoteData(remoteData);
          showSyncBadge('☁ Sincronizado ✓', '#22d468');
        }
      }
    )
    .subscribe((status, err) => {
      console.log('[Realtime] Status:', status, err || '');

      if (status === 'SUBSCRIBED') {
        showSyncBadge('☁ En tiempo real ✓', '#22d468');
      } else if (status === 'CHANNEL_ERROR') {
        console.warn('[Realtime] Error de canal:', err);
        showSyncBadge('☁ Error Realtime', '#ff4d5e');
        // Reintento en 6 segundos
        setTimeout(() => subscribeRealtime(db), 6000);
      } else if (status === 'TIMED_OUT') {
        showSyncBadge('☁ Timeout — reintentando...', '#ffcc4d');
        setTimeout(() => subscribeRealtime(db), 6000);
      } else if (status === 'CLOSED') {
        showSyncBadge('☁ Desconectado', '#ff4d5e');
      }
    });
}

async function initSupabase() {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    showSyncBadge('☁ Config faltante', '#ffcc4d');
    return;
  }

  const supabaseLib = window.supabase;
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    showSyncBadge('☁ SDK no cargado', '#ff4d5e');
    return;
  }

  try {
    window._cedanoDb = supabaseLib.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );

    showSyncBadge('☁ Conectando...', '#4db5ff');

    const KEY = 'CEDANO_V6';

    // ── Carga inicial ──────────────────────────────────────
    const { data, error } = await window._cedanoDb
      .from('cedano_state')
      .select('data, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error lectura:', error.message);
      showSyncBadge('☁ Error al leer', '#ff4d5e');
      // Igual intentamos activar Realtime
      subscribeRealtime(window._cedanoDb);
      return;
    }

    if (!data || !data.data) {
      // Primer uso — subir datos locales
      const localRaw = localStorage.getItem(KEY);
      if (localRaw) {
        await window._cedanoDb
          .from('cedano_state')
          .upsert({ id: 'main', data: JSON.parse(localRaw), updated_at: new Date().toISOString() });
        showSyncBadge('☁ Datos subidos', '#22d468');
      } else {
        showSyncBadge('☁ Listo', '#22d468');
      }
    } else {
      // Comparar cuál es más reciente
      const localRaw = localStorage.getItem(KEY);
      const localTs  = localRaw ? (JSON.parse(localRaw)._updatedAt || '2000-01-01') : '2000-01-01';
      const remoteTs = data.updated_at || '2000-01-01';

      if (new Date(remoteTs) >= new Date(localTs)) {
        applyRemoteData(data.data);
        showSyncBadge('☁ Sincronizado', '#22d468');
      } else {
        await window._cedanoDb
          .from('cedano_state')
          .upsert({ id: 'main', data: JSON.parse(localRaw), updated_at: new Date().toISOString() });
        showSyncBadge('☁ Sincronizado', '#22d468');
      }
    }

    // ── Activar Realtime ───────────────────────────────────
    subscribeRealtime(window._cedanoDb);

  } catch (e) {
    console.error('[Supabase] Error inesperado:', e);
    showSyncBadge('☁ Sin conexión', '#ff4d5e');
  }
}
