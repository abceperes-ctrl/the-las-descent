// supabase-sync.js — Sincronización Supabase para Cedano Business
// Estrategia: localStorage = cache rápido | Supabase = fuente de verdad en la nube

const SUPABASE_USER = 'royer';
let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('Supabase no configurado. Usando solo localStorage.');
    return null;
  }
  // Cliente ligero sin npm — usando la API REST directamente
  supabaseClient = {
    url: window.SUPABASE_URL,
    key: window.SUPABASE_ANON_KEY,
    headers: {
      'Content-Type': 'application/json',
      'apikey': window.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    }
  };
  return supabaseClient;
}

// Guarda el estado completo en Supabase (upsert)
async function syncSaveState(stateObj) {
  const sb = initSupabase();
  if (!sb) return; // Sin config → solo localStorage

  try {
    const res = await fetch(`${sb.url}/rest/v1/cedano_state`, {
      method: 'POST',
      headers: {
        ...sb.headers,
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
      console.error('Supabase save error:', err);
    }
  } catch (e) {
    // Sin internet → no pasa nada, localStorage ya tiene los datos
    console.warn('Sin conexión. Guardado solo local.');
  }
}

// Carga el estado desde Supabase
async function syncLoadState() {
  const sb = initSupabase();
  if (!sb) return null;

  try {
    const res = await fetch(
      `${sb.url}/rest/v1/cedano_state?id=eq.${SUPABASE_USER}&select=data,updated_at`,
      { headers: { 'apikey': sb.key, 'Authorization': `Bearer ${sb.key}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    return rows[0].data;
  } catch (e) {
    console.warn('Sin conexión. Cargando desde localStorage.');
    return null;
  }
}

// Muestra un indicador de sincronización
function showSyncIndicator(status) {
  let el = document.getElementById('sync-indicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sync-indicator';
    el.style.cssText = `
      position:fixed;top:10px;right:10px;z-index:9998;
      padding:5px 10px;border-radius:999px;font-size:11px;font-weight:800;
      transition:opacity .5s;pointer-events:none;
    `;
    document.body.appendChild(el);
  }
  if (status === 'saving') {
    el.style.cssText += 'background:rgba(255,204,77,.2);color:#ffcc4d;border:1px solid rgba(255,204,77,.4);opacity:1';
    el.textContent = '↑ Sincronizando...';
  } else if (status === 'saved') {
    el.style.cssText += 'background:rgba(34,212,104,.15);color:#22d468;border:1px solid rgba(34,212,104,.3);opacity:1';
    el.textContent = '✓ Sincronizado';
    setTimeout(() => { el.style.opacity = '0'; }, 2000);
  } else if (status === 'offline') {
    el.style.cssText += 'background:rgba(255,77,94,.1);color:#ff4d5e;border:1px solid rgba(255,77,94,.3);opacity:1';
    el.textContent = '⚡ Sin conexión';
    setTimeout(() => { el.style.opacity = '0'; }, 3000);
  }
}

// Debounce para no spamear Supabase en cada keystroke
let syncTimer = null;
function debouncedSave(stateObj) {
  clearTimeout(syncTimer);
  showSyncIndicator('saving');
  syncTimer = setTimeout(async () => {
    await syncSaveState(stateObj);
    showSyncIndicator('saved');
  }, 1500); // Espera 1.5s después del último cambio
}