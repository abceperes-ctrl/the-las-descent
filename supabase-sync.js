// supabase-sync.js — Multi-usuario con Supabase Auth (email + contraseña)
// Cada usuario tiene sus propios datos completamente aislados.

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
      'transition:opacity.4s','white-space:nowrap',
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

/* ── Vincular usuario con OneSignal (multi-dispositivo) ── */
function linkOneSignalToUser(userId) {
  if (!userId) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    try {
      await OneSignal.login(userId);
      console.log('[OneSignal] Usuario vinculado:', userId);
    } catch(e) {
      console.warn('[OneSignal] Error al vincular usuario:', e.message);
    }
  });
}

/* ── Desvincular usuario de OneSignal al cerrar sesión ── */
function unlinkOneSignalUser() {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    try {
      await OneSignal.logout();
      console.log('[OneSignal] Usuario desvinculado');
    } catch(e) {
      console.warn('[OneSignal] Error al desvincular:', e.message);
    }
  });
}

/* ── Aplicar datos remotos al estado local ── */
function applyRemoteData(remoteData) {
  const KEY = 'CEDANO_V6';
  localStorage.setItem(KEY, JSON.stringify(remoteData));
  state = remoteData;
  window.state = remoteData;
  if (typeof checkDayReset === 'function') checkDayReset();
  if (typeof render === 'function') render();
}

/* ── Realtime ── */
function subscribeRealtime(db, userId) {
  if (window._cedanoRealtimeChannel) {
    try { db.removeChannel(window._cedanoRealtimeChannel); } catch(e) {}
  }

  window._cedanoRealtimeChannel = db
    .channel('cedano-user-' + userId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cedano_state',
        filter: 'user_id=eq.' + userId
      },
      (payload) => {
        console.log('[Realtime] UPDATE recibido para usuario:', userId);
        const remoteData = payload.new?.data;
        if (!remoteData) return;

        const remoteTs = payload.new?.updated_at || '2000-01-01';
        const localTs = (window.state && window.state._updatedAt) || '2000-01-01';

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
        showSyncBadge('☁ Error Realtime', '#ff4d5e');
        setTimeout(() => subscribeRealtime(db, userId), 6000);
      } else if (status === 'TIMED_OUT') {
        showSyncBadge('☁ Timeout — reintentando...', '#ffcc4d');
        setTimeout(() => subscribeRealtime(db, userId), 6000);
      } else if (status === 'CLOSED') {
        showSyncBadge('☁ Desconectado', '#ff4d5e');
      }
    });
}

/* =========================================================
   PANTALLA DE AUTH (Login / Registro)
   ========================================================= */
function renderAuthScreen(errorMsg) {
  const existing = document.getElementById('cedano-auth-screen');
  if (existing) existing.remove();

  const sk = document.getElementById('skeletonLoader');
  if (sk) sk.remove();

  clearTimeout(window._cedanoRenderSafetyNet);

  const screen = document.createElement('div');
  screen.id = 'cedano-auth-screen';
  screen.style.cssText = `
    position:fixed;inset:0;background:var(--bg,#0b1012);
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;z-index:500;padding:24px;
  `;

  screen.innerHTML = `
    <div style="width:100%;max-width:380px">
      <div style="text-align:center;margin-bottom:32px">
        <div style="font-size:48px;margin-bottom:10px">💼</div>
        <h1 style="font-size:22px;font-weight:900;color:#22d468;letter-spacing:2px">CEDANO BUSINESS</h1>
        <p style="color:#6b7f8f;font-size:13px;margin-top:6px">Accede a tu espacio personal</p>
      </div>

      <div style="display:flex;border-radius:10px;overflow:hidden;border:1.5px solid #1e2a35;margin-bottom:20px">
        <button id="authTabLogin" onclick="switchAuthTab('login')"
          style="flex:1;padding:11px;font-weight:700;font-size:13px;border:none;cursor:pointer;
                 background:#22d468;color:#000;transition:all.15s">
          Iniciar sesión
        </button>
        <button id="authTabRegister" onclick="switchAuthTab('register')"
          style="flex:1;padding:11px;font-weight:700;font-size:13px;border:none;cursor:pointer;
                 background:#151d26;color:#6b7f8f;transition:all.15s">
          Crear cuenta
        </button>
      </div>

      <div id="authForm" style="display:flex;flex-direction:column;gap:12px">
        <div id="authNameField" style="display:none">
          <label style="font-size:11px;color:#6b7f8f;font-weight:700;letter-spacing:.3px;display:block;margin-bottom:4px">TU NOMBRE</label>
          <input id="authName" type="text" placeholder="Ej: Royer"
            style="width:100%;padding:12px 14px;border-radius:8px;border:1.5px solid #1e2a35;
                   background:#151d26;color:#e8edf2;font-size:14px;font-family:inherit;box-sizing:border-box"/>
        </div>

        <div>
          <label style="font-size:11px;color:#6b7f8f;font-weight:700;letter-spacing:.3px;display:block;margin-bottom:4px">CORREO ELECTRÓNICO</label>
          <input id="authEmail" type="email" placeholder="tucorreo@email.com"
            style="width:100%;padding:12px 14px;border-radius:8px;border:1.5px solid #1e2a35;
                   background:#151d26;color:#e8edf2;font-size:14px;font-family:inherit;box-sizing:border-box"/>
        </div>

        <div>
          <label style="font-size:11px;color:#6b7f8f;font-weight:700;letter-spacing:.3px;display:block;margin-bottom:4px">CONTRASEÑA</label>
          <div style="position:relative">
            <input id="authPassword" type="password" placeholder="Mínimo 6 caracteres"
              style="width:100%;padding:12px 14px;border-radius:8px;border:1.5px solid #1e2a35;
                     background:#151d26;color:#e8edf2;font-size:14px;font-family:inherit;box-sizing:border-box;padding-right:48px"/>
            <button onclick="togglePasswordVisibility()" tabindex="-1"
              style="position:absolute;right:12px;top:50%;transform:translateY(-50%);
                     background:none;border:none;cursor:pointer;font-size:16px;color:#6b7f8f">
              👁
            </button>
          </div>
        </div>

        <div id="authMsgBox" style="display:none;border-radius:8px;padding:10px 14px;font-size:13px;font-weight:600"></div>

        <button id="authSubmitBtn" onclick="submitAuth()"
          style="width:100%;padding:14px;border-radius:8px;border:none;cursor:pointer;
                 background:#22d468;color:#000;font-size:15px;font-weight:800;
                 font-family:inherit;margin-top:4px;transition:opacity.15s">
          Iniciar sesión
        </button>

        <button id="authForgotBtn" onclick="sendPasswordReset()"
          style="background:none;border:none;cursor:pointer;color:#6b7f8f;font-size:12px;
                 font-family:inherit;margin-top:4px;text-decoration:underline">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(screen);
  screen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitAuth();
  });
}

let _authMode = 'login';

function switchAuthTab(mode) {
  _authMode = mode;
  const isLogin = mode === 'login';
  const tabLogin    = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');
  const nameField   = document.getElementById('authNameField');
  const submitBtn   = document.getElementById('authSubmitBtn');
  const forgotBtn   = document.getElementById('authForgotBtn');
  const msgBox      = document.getElementById('authMsgBox');

  if (tabLogin)    { tabLogin.style.background    = isLogin ? '#22d468' : '#151d26'; tabLogin.style.color    = isLogin ? '#000' : '#6b7f8f'; }
  if (tabRegister) { tabRegister.style.background = !isLogin ? '#22d468' : '#151d26'; tabRegister.style.color = !isLogin ? '#000' : '#6b7f8f'; }
  if (nameField)   nameField.style.display  = isLogin ? 'none' : 'block';
  if (submitBtn)   submitBtn.textContent    = isLogin ? 'Iniciar sesión' : 'Crear cuenta';
  if (forgotBtn)   forgotBtn.style.display  = isLogin ? 'block' : 'none';
  if (msgBox)      { msgBox.style.display = 'none'; msgBox.textContent = ''; }
}

function togglePasswordVisibility() {
  const input = document.getElementById('authPassword');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showAuthMsg(msg, isError) {
  const box = document.getElementById('authMsgBox');
  if (!box) return;
  box.style.display  = 'block';
  box.textContent    = msg;
  box.style.background = isError ? 'rgba(255,77,94,.12)' : 'rgba(34,212,104,.12)';
  box.style.border     = isError ? '1.5px solid rgba(255,77,94,.35)' : '1.5px solid rgba(34,212,104,.35)';
  box.style.color      = isError ? '#ff4d5e' : '#22d468';
}

function setAuthLoading(loading) {
  const btn = document.getElementById('authSubmitBtn');
  if (!btn) return;
  btn.disabled      = loading;
  btn.style.opacity = loading ? '0.6' : '1';
  btn.textContent   = loading ? 'Cargando...' : (_authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta');
}

async function submitAuth() {
  const db = window._cedanoDb;
  if (!db) return;
  const email    = (document.getElementById('authEmail')?.value    || '').trim();
  const password =  document.getElementById('authPassword')?.value || '';
  const name     = (document.getElementById('authName')?.value     || '').trim();

  if (!email || !password) { showAuthMsg('❌ Ingresa tu correo y contraseña.', true); return; }
  if (_authMode === 'register' && !name) { showAuthMsg('❌ Ingresa tu nombre.', true); return; }
  if (password.length < 6) { showAuthMsg('❌ La contraseña debe tener al menos 6 caracteres.', true); return; }

  setAuthLoading(true);
  try {
    if (_authMode === 'login') {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) { showAuthMsg('❌ ' + translateAuthError(error.message), true); setAuthLoading(false); return; }
    } else {
      const { data, error } = await db.auth.signUp({
        email, password, options: { data: { display_name: name } }
      });
      if (error) { showAuthMsg('❌ ' + translateAuthError(error.message), true); setAuthLoading(false); return; }
      if (!data.session) {
        showAuthMsg('✅ Cuenta creada. Revisa tu correo para confirmar.', false);
        setAuthLoading(false);
      }
    }
  } catch(e) {
    showAuthMsg('❌ Error de conexión. Intenta de nuevo.', true);
    setAuthLoading(false);
  }
}

async function sendPasswordReset() {
  const db    = window._cedanoDb;
  const email = (document.getElementById('authEmail')?.value || '').trim();
  if (!email) { showAuthMsg('❌ Ingresa tu correo primero.', true); return; }
  const { error } = await db.auth.resetPasswordForEmail(email);
  if (error) showAuthMsg('❌ ' + translateAuthError(error.message), true);
  else        showAuthMsg('✅ Correo de recuperación enviado a ' + email, false);
}

function translateAuthError(msg) {
  if (!msg) return 'Error desconocido.';
  if (msg.includes('Invalid login credentials'))   return 'Correo o contraseña incorrectos.';
  if (msg.includes('Email not confirmed'))         return 'Debes confirmar tu correo antes de entrar.';
  if (msg.includes('User already registered'))     return 'Este correo ya tiene una cuenta. Inicia sesión.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate email'))    return 'Correo no válido.';
  if (msg.includes('rate limit'))                  return 'Demasiados intentos. Espera un momento.';
  return msg;
}

/* =========================================================
   CERRAR SESIÓN
   ========================================================= */
async function cerrarSesion() {
  if (!confirm('¿Cerrar sesión?')) return;
  const db = window._cedanoDb;
  unlinkOneSignalUser();
  if (db) await db.auth.signOut();
  localStorage.removeItem('CEDANO_V6');
  localStorage.removeItem('CEDANO_AI_HIST');
  window._cedanoCurrentUser = null;
  window.state = null;
  if (document.getElementById('cedano-auth-screen')) return;
  renderAuthScreen();
}
window.cerrarSesion = cerrarSesion;

/* =========================================================
   CARGA Y GUARDADO POR USUARIO
   ========================================================= */
async function loadUserData(db, userId) {
  const KEY = 'CEDANO_V6';
  const { data, error } = await db
    .from('cedano_state')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Error lectura:', error.message);
    showSyncBadge('☁ Error al leer datos', '#ff4d5e');
    return null;
  }

  if (!data || !data.data) {
    // No hay datos remotos — subir localStorage si existe, si no devolver null (cuenta nueva)
    const localRaw = localStorage.getItem(KEY);
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw);
        await db.from('cedano_state').upsert({
          user_id: userId, data: parsed, updated_at: new Date().toISOString()
        });
        showSyncBadge('☁ Datos iniciales subidos', '#22d468');
        return parsed;
      } catch(e) {}
    }
    showSyncBadge('☁ Cuenta nueva — iniciando', '#22d468');
    return null; // cuenta nueva, sin datos
  }

  const localRaw = localStorage.getItem(KEY);
  const localTs  = localRaw ? (JSON.parse(localRaw)._updatedAt || '2000-01-01') : '2000-01-01';
  const remoteTs = data.updated_at || '2000-01-01';

  if (new Date(remoteTs) >= new Date(localTs)) {
    // Remoto es más nuevo o igual → usar remoto
    localStorage.setItem(KEY, JSON.stringify(data.data));
    showSyncBadge('☁ Sincronizado', '#22d468');
    return data.data;
  } else {
    // Local es más nuevo → subir local
    const parsed = JSON.parse(localRaw);
    await db.from('cedano_state').upsert({
      user_id: userId, data: parsed, updated_at: new Date().toISOString()
    });
    showSyncBadge('☁ Datos locales sincronizados', '#22d468');
    return parsed;
  }
}

/* =========================================================
   GUARDAR DATOS (llamado desde app.js saveState)
   ========================================================= */
window.saveUserDataToSupabase = async function(stateObj) {
  const db     = window._cedanoDb;
  const userId = window._cedanoCurrentUser?.id;
  if (!db || !userId) return;
  try {
    const { error } = await db.from('cedano_state').upsert({
      user_id:    userId,
      data:       stateObj,
      updated_at: new Date().toISOString()
    });
    if (error) showSyncBadge('☁ Error sync', '#ff4d5e');
    else        showSyncBadge('☁ Guardado',   '#22d468');
  } catch {
    showSyncBadge('☁ Sin conexión', '#ff4d5e');
  }
};

/* =========================================================
   HELPER — limpiar skeleton y reconstruir DOM
   ========================================================= */
function _forceClearSkeleton() {
  clearTimeout(window._cedanoRenderSafetyNet);
  const sk = document.getElementById('skeletonLoader');
  if (sk) sk.remove();
  if (typeof rebuildDOM === 'function' && !document.getElementById('screen')) {
    rebuildDOM();
  }
}

/* =========================================================
   HELPER — aplicar state remoto y ejecutar funciones post-carga
   ESTA es la única función que debe tocar `state` al inicio
   ========================================================= */
function _applyLoadedState(remoteData, user) {
  const KEY = 'CEDANO_V6';

  if (remoteData) {
    // Tenemos datos reales del servidor
    localStorage.setItem(KEY, JSON.stringify(remoteData));
    state        = remoteData;
    window.state = remoteData;
  } else {
    // Cuenta nueva sin datos — usar initialState (definido en app.js)
    state        = JSON.parse(JSON.stringify(initialState));
    window.state = state;
  }

  // Sincronizar nombre de usuario desde auth metadata
  if (user && user.user_metadata && user.user_metadata.display_name) {
    if (!state.userName || state.userName === 'Royer') {
      state.userName = user.user_metadata.display_name;
    }
  }

  // AHORA es seguro hacer checkDayReset — state ya tiene datos reales
  if (typeof checkDayReset       === 'function') checkDayReset();
  if (typeof checkBackupReminder === 'function') checkBackupReminder();
  if (typeof checkWeeklyReview   === 'function') checkWeeklyReview();
  if (typeof initNotifications   === 'function') setTimeout(initNotifications, 1000);
  if (typeof checkBirthdays      === 'function') setTimeout(checkBirthdays, 3000);
}

/* =========================================================
   INIT PRINCIPAL
   ========================================================= */
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

  window._cedanoDb = supabaseLib.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY,
    {
      auth:     { persistSession: true, autoRefreshToken: true, storageKey: 'cedano_auth' },
      realtime: { params: { eventsPerSecond: 10 } }
    }
  );

  const db = window._cedanoDb;

  db.auth.onAuthStateChange(async (event, session) => {
    console.log('[Auth] Evento:', event, session?.user?.email || '(sin usuario)');

    /* ── Sin sesión al inicio ── */
    if (event === 'INITIAL_SESSION') {
      if (!session) {
        _forceClearSkeleton();
        renderAuthScreen();
        return;
      }

      // Hay sesión válida → cargar datos remotos PRIMERO
      window._cedanoCurrentUser = session.user;
      linkOneSignalToUser(session.user.id);
      showSyncBadge('☁ Cargando datos...', '#4db5ff');

      const remoteData = await loadUserData(db, session.user.id);

      // Aplicar state con datos reales (o initialState si cuenta nueva)
      _applyLoadedState(remoteData, session.user);

      _forceClearSkeleton();
      subscribeRealtime(db, session.user.id);
      if (typeof render === 'function') render();
      return;
    }

    /* ── Login exitoso (desde pantalla de auth) ── */
    if (event === 'SIGNED_IN' && session?.user) {
      // Evitar doble ejecución si el usuario ya estaba cargado
      if (window._cedanoCurrentUser?.id === session.user.id) return;

      window._cedanoCurrentUser = session.user;
      linkOneSignalToUser(session.user.id);

      const authScreen = document.getElementById('cedano-auth-screen');
      if (authScreen) authScreen.remove();

      showSyncBadge('☁ Cargando datos...', '#4db5ff');

      const remoteData = await loadUserData(db, session.user.id);

      // Aplicar state con datos reales
      _applyLoadedState(remoteData, session.user);

      _forceClearSkeleton();
      subscribeRealtime(db, session.user.id);
      if (typeof render === 'function') render();
      return;
    }

    /* ── Cierre de sesión ── */
    if (event === 'SIGNED_OUT') {
      window._cedanoCurrentUser = null;
      localStorage.removeItem('CEDANO_V6');
      localStorage.removeItem('CEDANO_AI_HIST');
      renderAuthScreen();
      return;
    }
  });
}
