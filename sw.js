self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', event => {
  const msg = event.data || {};
  if (msg.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      showNotif(msg.title || 'Cedano Business', msg.body || '', msg.tag || 'cedano')
    );
  }
  if (msg.type === 'CHECK_AND_NOTIFY') {
    event.waitUntil(processReminders(msg.state, msg.hora));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('the-las-descent') && 'focus' in c) return c.focus();
      }
      return clients.openWindow('/the-las-descent/');
    })
  );
});

async function showNotif(title, body, tag) {
  const existing = await self.registration.getNotifications({ tag });
  if (existing.length) return;
  return self.registration.showNotification(title, {
    body, tag,
    icon: '/the-las-descent/icon-192.png',
    badge: '/the-las-descent/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: false
  });
}

async function processReminders(state, horaActual) {
  if (!state) return;
  const hoy = todayStr();
  const ahora = new Date();
  const minAct = ahora.getMinutes();

  if (horaActual >= 8 && horaActual < 9) {
    const citas = (state.barberAppointments || []).filter(a => a.date === hoy && !a.completed);
    if (citas.length) await showNotif(`✂ ${citas.length} cita${citas.length > 1 ? 's' : ''} hoy`, citas.map(a => `${a.client} — ${a.time}`).join('\n'), 'citas-hoy');
  }
  if (horaActual >= 9 && horaActual < 10) {
    const morosos = (state.loans || []).filter(l => calcLateDays(l) > 0 || l.status === 'En mora');
    if (morosos.length) await showNotif(`🔴 ${morosos.length} cliente${morosos.length > 1 ? 's' : ''} en mora`, morosos.slice(0,3).map(l => l.client).join(', '), 'morosos-dia');
    const venc = (state.billsToPay || []).filter(b => !b.paid && b.dueDate && new Date(b.dueDate) < ahora);
    if (venc.length) await showNotif(`💳 ${venc.length} cuenta${venc.length > 1 ? 's' : ''} vencida${venc.length > 1 ? 's' : ''}`, venc.slice(0,2).map(b => b.name).join(', '), 'bills-venc');
    const hoyMD = hoy.slice(5);
    const cumples = (state.barberClients || []).filter(c => c.birthday && c.birthday.slice(5) === hoyMD);
    if (cumples.length) await showNotif('🎂 Cumpleaños hoy', cumples.map(c => c.name).join(', '), 'cumples');
  }
  for (const apt of (state.barberAppointments || [])) {
    if (apt.date !== hoy || apt.completed) continue;
    const t = parseHora(apt.time);
    if (!t) continue;
    const diffMin = (t.h * 60 + t.m) - (horaActual * 60 + minAct);
    if (diffMin >= 25 && diffMin <= 35) await showNotif('✂ Cita en 30 min', `${apt.client} — ${apt.service} a las ${apt.time}`, 'cita-30-' + apt.id);
  }
  if (horaActual >= 12 && horaActual < 13) {
    const pend = (state.tasks || []).filter(t => !t.done && t.date === hoy);
    if (pend.length) await showNotif(`✅ ${pend.length} tarea${pend.length > 1 ? 's' : ''} pendiente${pend.length > 1 ? 's' : ''}`, pend.slice(0,3).map(t => t.text).join('\n'), 'tareas-mediodia');
  }
  if (horaActual >= 14 && horaActual < 15) {
    const bajos = (state.vaperInventory || []).filter(p => Number(p.quantity) <= Number(p.minStock || 3));
    if (bajos.length) await showNotif('⚠ Stock bajo', bajos.map(p => `${p.product}: ${p.quantity} uds`).join('\n'), 'stock-bajo');
  }
  if (horaActual === 21 && minAct < 30) {
    await showNotif('🌙 Cierre nocturno', '¡Registra tu día antes de dormir!', 'cierre-nocturno');
  }
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function parseHora(str) {
  if (!str) return null;
  const am = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (am) {
    let h = parseInt(am[1]); const m = parseInt(am[2]);
    if (am[3].toUpperCase() === 'PM' && h < 12) h += 12;
    if (am[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return { h, m };
  }
  const h24 = str.match(/^(\d+):(\d+)$/);
  if (h24) return { h: parseInt(h24[1]), m: parseInt(h24[2]) };
  return null;
}
function calcLateDays(loan) {
  if (!loan.dueDate) return loan.lateDays || 0;
  const due = new Date(loan.dueDate);
  return new Date() > due ? Math.floor((new Date() - due) / 86400000) : 0;
}
