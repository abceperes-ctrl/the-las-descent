// supabase-sync.js — Siempre descarga de Supabase al abrir

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
  el.style.color = (color === '#ffcc4d') ? '#000' : (color === '#ff4d5e' ? '#fff' : '#000');
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

async function initSupabase() {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('[Supabase] Credenciales no encontradas');
    showSyncBadge('☁ Config no encontrado', '#ffcc4d');
    return;
  }

  const supabaseLib = window.supabase;
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    console.warn('[Supabase] SDK no disponible');
    showSyncBadge('☁ SDK no cargado', '#ff4d5e');
    return;
  }

  try {
    window._cedanoDb = supabaseLib.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    showSyncBadge('☁ Conectando...', '#4db5ff');

    const KEY = 'CEDANO_V6';

    const { data, error } = await window._cedanoDb
      .from('cedano_state')
      .select('data, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error al leer:', error.message);
      showSyncBadge('☁ Error al leer', '#ff4d5e');
      return;
    }

    if (!data || !data.data || Object.keys(data.data).length === 0) {
      // Sin datos remotos → subir localStorage
      const localRaw = localStorage.getItem(KEY);
      if (localRaw) {
        const { error: upErr } = await window._cedanoDb
          .from('cedano_state')
          .upsert({
            id: 'main',
            data: JSON.parse(localRaw),
            updated_at: new Date().toISOString()
          });
        if (upErr) {
          showSyncBadge('☁ Error al subir', '#ff4d5e');
        } else {
          showSyncBadge('☁ Datos subidos', '#22d468');
        }
      } else {
        showSyncBadge('☁ Listo', '#22d468');
      }
      return;
    }

    // Siempre usar la versión con updated_at más reciente
    const localRaw = localStorage.getItem(KEY);
    const localUpdated = localRaw
      ? (JSON.parse(localRaw)._updatedAt || '2000-01-01')
      : '2000-01-01';
    const remoteUpdated = data.updated_at || '2000-01-01';

    if (new Date(remoteUpdated) >= new Date(localUpdated)) {
      // Remoto más reciente o igual → siempre descargar
      console.log('[Supabase] Descargando datos remotos...');
      const remoteData = data.data;
      localStorage.setItem(KEY, JSON.stringify(remoteData));
      if (typeof loadState === 'function') window.state = loadState();
      if (typeof render === 'function') render();
      showSyncBadge('☁ Sincronizado', '#22d468');
    } else {
      // Local más reciente → subir
      console.log('[Supabase] Subiendo datos locales...');
      const { error: upErr } = await window._cedanoDb
        .from('cedano_state')
        .upsert({
          id: 'main',
          data: JSON.parse(localRaw),
          updated_at: new Date().toISOString()
        });
      if (upErr) {
        showSyncBadge('☁ Error sync', '#ff4d5e');
      } else {
        showSyncBadge('☁ Sincronizado', '#22d468');
      }
    }

  } catch (e) {
    console.error('[Supabase] Error inesperado:', e);
    showSyncBadge('☁ Sin conexión', '#ff4d5e');
  }
}
