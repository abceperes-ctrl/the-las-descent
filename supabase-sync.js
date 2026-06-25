// supabase-sync.js — Cedano Business
// localStorage = cache rápido | Supabase = nube

const SUPABASE_USER = 'royer';
let _sb = null;

function initSupabase() {
  if (_sb) return _sb;
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('[Cedano] Supabase no configurado.');
    return null;
  }
  _sb = {
    url: window.SUPABASE_URL,
    key: window.SUPABASE_ANON_KEY
  };
  return _sb;
}

// ── Guardar estado en Supabase ──────────────────────────────
async function syncSaveState(stateObj) {
  const sb = initSupabase();
  if (!sb) return;

  try {
    const res = await fetch(`${sb.url}/rest/v1/cedano_state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': sb.key,
        'Authorization': `Bearer ${sb.key}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        id: SUPABASE_USER,
        data: stateObj,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Cedano] Error guardando en Supabase:', err);
      showSyncIndicator('offline');
    }
  } catch (e) {
    console.warn('[Cedano] Sin conexión. Solo localStorage.');
    showSyncIndicator('offline');
  }
}

// ── Cargar estado desde Supabase ────────────────────────────
async function syncLoadState() {
  const sb = initSupabase();
  if (!sb) return null;

  try {
    const res = await fetch(
      `${sb.url}/rest/v1/cedano_state?id=eq.${SUPABASE_USER}&select=data,updated_at`,
      {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      }
    );

    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    return rows[0].data;
  } catch (e) {
    console.warn('[Cedano] No se pudo cargar desde Supabase.');
    return null;
  }
}

// ── Indicador visual de sincronización ─────────────────────
function showSyncIndicator(status) {
  let el = document.getElementById('sync-indicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sync-indicator';
    el.style.cssText = [
      'position:fixed',
      'top:12px',
      'right:12px',
      'z-index:9998',
      'padding:4px 12px',
      'border-radius:999px',
      'font-size:11px',
      'font-weight:800',
      'transition:opacity .6s',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(el);
  }

  // Resetea estilos inline acumulados
  el.removeAttribute('style');
  el.style.cssText = [
    'position:fixed',
    'top:12px',
    'right:12px',
    'z-index:9998',
    'padding:4px 12px',
    'border-radius:999px',
    'font-size:11px',
    'font-weight:800',
    'transition:opacity .6s',
    'pointer-events:none',
    'opacity:1'
  ].join(';');

  if (status === 'saving') {
    el.style.background = 'rgba(255,204,77,.15)';
    el.style.color = '#ffcc4d';
    el.style.border = '1px solid rgba(255,204,77,.4)';
    el.textContent = '↑ Sincronizando...';
  } else if (status === 'saved') {
    el.style.background = 'rgba(34,212,104,.12)';
    el.style.color = '#22d468';
    el.style.border = '1px solid rgba(34,212,104,.3)';
    el.textContent = '✓ Sincronizado';
    setTimeout(() => { el.style.opacity = '0'; }, 2000);
  } else if (status === 'offline') {
    el.style.background = 'rgba(255,77,94,.1)';
    el.style.color = '#ff4d5e';
    el.style.border = '1px solid rgba(255,77,94,.3)';
    el.textContent = '⚡ Sin conexión';
    setTimeout(() => { el.style.opacity = '0'; }, 3000);
  }
}

// ── Debounce: guarda 1.5s después del último cambio ────────
let _syncTimer = null;
function debouncedSave(stateObj) {
  clearTimeout(_syncTimer);
  showSyncIndicator('saving');
  _syncTimer = setTimeout(async () => {
    await syncSaveState(stateObj);
    showSyncIndicator('saved');
  }, 1500);
}