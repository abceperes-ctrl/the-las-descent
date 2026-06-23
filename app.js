/* =====================================================================
   CEDANO BUSINESS — app.js v4.0
   Mejoras v4:
   ✅ Búsqueda global (clientes, préstamos, citas, vaper)
   ✅ Archivar préstamos cancelados (historial separado)
   ✅ Historial de pagos filtrable por cliente y fecha
   ✅ Stock mínimo configurable por producto
   ✅ Alerta automática de restock con lista de productos
   ✅ Comisiones automáticas por barbero desde citas completadas
   ✅ Comparación mes vs mes anterior en Reportes
   ✅ Reporte PDF imprimible mejorado con todos los datos
   ✅ Notificación visual de cobros vencidos en el header
   ✅ Onboarding de primera vez con tour por módulos
   ✅ Multi-moneda real con tasa editable en vivo
   ✅ Historial de cortes con notas por cliente de barbería
   ✅ Fix bug duplicación en calendario
   ✅ Fix comisiones calculadas desde citas reales por empleado
   ✅ Préstamos archivados movidos a sección separada
   ✅ Contador de notificaciones en tab bar
   ✅ Exportar reporte mensual completo
   ===================================================================== */

const KEY = "CEDANO_V4";
const $ = s => document.querySelector(s);

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function money(v, cur) {
  const n = Number(v || 0);
  if (cur === "USD") return `US$${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  return `RD$${n.toLocaleString("es-DO")}`;
}
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function inp(id, ph, type="text", val="") { return `<input id="${id}" type="${type}" placeholder="${ph}" value="${esc(val)}"/>`; }
function sel(id, opts, val="") { return `<select id="${id}">${opts.map(o=>`<option${o===val?" selected":""}>${o}</option>`).join("")}</select>`; }
function ta(id, ph, val="") { return `<textarea id="${id}" placeholder="${ph}">${esc(val)}</textarea>`; }
function btn(label, action, cls="") { return `<button class="btn ${cls}" onclick="${action}">${label}</button>`; }
function sm(label, action, cls="") { return `<button class="small-btn ${cls}" onclick="${action}">${label}</button>`; }
function card(title, body) { return `<article class="card"><h3 class="title">${title}</h3>${body}</article>`; }
function metric(icon, title, val, sub, cls="") {
  return `<article class="card metric${cls?" "+cls:""}"><h3 class="title">${icon} ${title}</h3><div class="value">${esc(String(val))}</div><div class="muted">${sub}</div></article>`;
}

/* ── Toast ── */
function showToast(msg, type="ok") {
  const existing = document.getElementById("cedano-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "cedano-toast";
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:${type==="ok"?"#22d468":"#ff4d5e"};
    color:#000;font-weight:700;font-size:13px;
    padding:8px 18px;border-radius:20px;z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.3);
    animation:fadeInUp .2s ease;pointer-events:none;`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function hideSkeleton() {
  const sk = document.getElementById("skeletonLoader");
  if (sk) sk.remove();
}

/* =====================================================================
   ESTADO INICIAL
   ===================================================================== */
const initialState = {
  userName: "Royer", businessName: "Cedano Business",
  capital: 1250000, savings: 50000,
  mission: "Conseguir 3 clientes", moneyGoal: 10000, moneyToday: 5450, moneySpent: 0,
  xp: 1250, productiveHours: 0, dailyNote: "", usdRate: 59,
  habits: [
    { id: uid(), text: "Levantarme temprano", done: false, streak: 0 },
    { id: uid(), text: "Gym", done: false, streak: 3 },
    { id: uid(), text: "Estudiar Derecho", done: false, streak: 1 },
    { id: uid(), text: "Revisar negocios", done: false, streak: 5 },
    { id: uid(), text: "Dormir temprano", done: false, streak: 2 }
  ],
  habitStats: { daysTraining: 3, daysMeta: 5, avgSleep: 6.5 },
  tasks: [
    { id: uid(), text: "Cobrar a Pedro", type: "Diario", priority: "Alta", date: today(), time: "10:00 AM", done: true },
    { id: uid(), text: "Comprar líquido para vapers", type: "Diario", priority: "Media", date: today(), time: "2:00 PM", done: false },
    { id: uid(), text: "Ir al gimnasio", type: "Diario", priority: "Baja", date: today(), time: "7:00 PM", done: true },
    { id: uid(), text: "Revisar gastos de la barbería", type: "Semanal", priority: "Urgente", date: today(), time: "8:30 PM", done: false }
  ],
  tomorrow: { mission: "", moneyGoal: "", tasks: [], reminders: [], followups: [] },
  history: [],
  contacts: [
    { id: uid(), name: "Pedro Gómez", phone: "809-000-0000", address: "Santo Domingo", source: "Referido", note: "Quiere préstamo pequeño.", priority: "Alta", status: "Interesado" },
    { id: uid(), name: "María López", phone: "829-000-0000", address: "Los Alcarrizos", source: "Facebook", note: "Llamar en la tarde.", priority: "Media", status: "Pendiente" }
  ],
  loanClients: [
    { id: uid(), name: "Pedro Gómez", photo: "", cedula: "000-0000000-0", phone: "809-000-0000", address: "Santo Domingo", reference: "Juan Pérez", notes: "Cliente recomendado.", lastVisit: today() }
  ],
  loans: [
    { id: uid(), client: "Pedro Gómez", capital: 15000, interest: 20, currency: "RD$", startDate: today(), dueDate: "", frequency: "Semanal", paid: 3000, lateDays: 0, status: "En mora" }
  ],
  archivedLoans: [], /* ✅ NUEVO: préstamos cancelados archivados */
  payments: [],
  vaperInventory: [
    { id: uid(), product: "Vaper Blue Ice", brand: "Elf Bar", model: "BC5000", type: "Desechable", flavor: "Blue Ice", quantity: 8, cost: 450, price: 750, minStock: 3 },
    { id: uid(), product: "Vaper Mango Ice", brand: "Elf Bar", model: "BC5000", type: "Desechable", flavor: "Mango Ice", quantity: 2, cost: 450, price: 750, minStock: 4 }
  ],
  vaperSales: [],
  vaperClients: [{ id: uid(), name: "Luis Mateo", phone: "849-000-0000", totalSpent: 1500, history: "Compró Blue Ice." }],
  barberAppointments: [
    { id: uid(), client: "Carlos", phone: "809-222-2222", service: "Corte + barba", date: today(), time: "6:00 PM", price: 600, reminder: true, completed: false, employeeId: "" }
  ],
  barberClients: [
    { id: uid(), name: "Carlos", phone: "809-222-2222", history: "Corte degradado", frequency: "Cada 15 días", birthday: "1995-04-10", cutNotes: "" }
  ],
  barberServices: [
    { id: uid(), name: "Corte", price: 400, duration: "35 min" },
    { id: uid(), name: "Corte + barba", price: 600, duration: "50 min" }
  ],
  barberEmployees: [{ id: uid(), name: "Cedano", percent: 100, schedule: "9AM - 8PM", paid: 0 }],
  barberExpenses: [],
  achievements: [
    { id: "a1", icon: "🥉", title: "Primera venta", desc: "Registrar primera venta de vaper", unlocked: true },
    { id: "a2", icon: "🥈", title: "30 días de disciplina", desc: "Completar hábitos 30 días seguidos", unlocked: false },
    { id: "a3", icon: "🥇", title: "RD$1,000,000 de capital", desc: "Alcanzar RD$1M en patrimonio", unlocked: false },
    { id: "a4", icon: "👑", title: "Empresario Élite", desc: "Completar todos los logros", unlocked: false },
    { id: "a5", icon: "💰", title: "Primer RD$100,000 ahorrados", desc: "Ahorrar RD$100,000", unlocked: false },
    { id: "a6", icon: "⚡", title: "Meta 7 días seguidos", desc: "Cumplir la meta diaria 7 veces", unlocked: false }
  ],
  calendarEvents: [
    { id: uid(), date: today(), title: "Cobro Pedro", type: "cobro", time: "10:00 AM" },
    { id: uid(), date: today(), title: "Cita Carlos", type: "cita", time: "6:00 PM" }
  ],
  dailyRevenue: [4200, 6800, 3100, 7500, 5450, 0, 0],
  monthlyRevenue: [32000, 45000, 51000, 38000, 67000, 72000],
  prevMonthRevenue: [28000, 40000, 46000, 34000, 60000, 65000], /* ✅ NUEVO: mes anterior */
  lawExams: [], disciplineScore: 72, pinEnabled: false, pin: "",
  onboardingDone: false, /* ✅ NUEVO: onboarding */
  notifSettings: { loanOverdueDays: 3, lowStockDefault: 3 } /* ✅ NUEVO */
};

let state = loadState();
let currentTab = "Inicio";
let chartInstances = {};
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let pinUnlocked = !state.pinEnabled;
let darkMode = localStorage.getItem("CEDANO_THEME") !== "light";
let editingId = null;
let editingType = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return structuredClone(initialState);
    /* Migraciones: agregar campos nuevos que no existían */
    if (!saved.archivedLoans) saved.archivedLoans = [];
    if (!saved.prevMonthRevenue) saved.prevMonthRevenue = [28000,40000,46000,34000,60000,65000];
    if (!saved.notifSettings) saved.notifSettings = { loanOverdueDays: 3, lowStockDefault: 3 };
    if (saved.onboardingDone === undefined) saved.onboardingDone = true; /* usuarios existentes no ven onboarding */
    saved.vaperInventory = saved.vaperInventory.map(p => ({ minStock: 3, ...p }));
    saved.barberClients = saved.barberClients.map(c => ({ cutNotes: "", ...c }));
    saved.barberAppointments = saved.barberAppointments.map(a => ({ employeeId: "", ...a }));
    return saved;
  } catch { return structuredClone(initialState); }
}
function saveState() { localStorage.setItem(KEY, JSON.stringify(state)); }
function setState(patch) { state = { ...state, ...patch }; saveState(); render(); }

/* ── Cálculos base ── */
function completedTasks() { return state.tasks.filter(t => t.done).length; }
function pendingTasks() { return state.tasks.filter(t => !t.done).length; }
function progress() { return state.moneyGoal ? Math.min(100, Math.round(state.moneyToday / state.moneyGoal * 100)) : 0; }
function rank() {
  if (state.xp >= 5000) return "General"; if (state.xp >= 3000) return "Coronel";
  if (state.xp >= 2000) return "Capitán"; if (state.xp >= 1200) return "Mayor";
  if (state.xp >= 600) return "Sargento"; return "Recluta";
}
function rankIcon() {
  if (state.xp >= 5000) return "⭐⭐⭐"; if (state.xp >= 3000) return "⭐⭐";
  if (state.xp >= 2000) return "⭐"; if (state.xp >= 1200) return "🎖";
  if (state.xp >= 600) return "🏅"; return "🪖";
}
function nextRankXP() {
  if (state.xp < 600) return 600; if (state.xp < 1200) return 1200;
  if (state.xp < 2000) return 2000; if (state.xp < 3000) return 3000;
  if (state.xp < 5000) return 5000; return 9999;
}
function calcLateDays(loan) {
  if (!loan.dueDate) return loan.lateDays || 0;
  const due = new Date(loan.dueDate); const now = new Date();
  return now > due ? Math.floor((now - due) / (1000*60*60*24)) : 0;
}
function loanBalance(loan) {
  const total = Number(loan.capital) + Number(loan.capital) * Number(loan.interest || 0) / 100;
  return Math.max(0, total - Number(loan.paid || 0));
}
function totalLoanBalance() { return state.loans.reduce((s,l) => s + loanBalance(l), 0); }
function vaperGain() { return state.vaperSales.reduce((s,sale) => s + Number(sale.gain || 0), 0); }
function vaperInventoryValue() { return state.vaperInventory.reduce((s,p) => s + Number(p.quantity||0) * Number(p.cost||0), 0); }
function barberIncome() {
  return state.barberAppointments.filter(a => a.completed === true).reduce((s,a) => s + Number(a.price||0), 0);
}
/* ✅ NUEVO: ingresos por empleado */
function barberIncomeByEmployee(employeeId) {
  return state.barberAppointments
    .filter(a => a.completed && a.employeeId === employeeId)
    .reduce((s,a) => s + Number(a.price||0), 0);
}
function barberExpenseTotal() { return state.barberExpenses.reduce((s,e) => s + Number(e.amount||0), 0); }
function patrimonyTotal() {
  return Number(state.capital) + totalLoanBalance() + vaperInventoryValue() + vaperGain() + Number(state.savings||0);
}
function loanStatusClass(s) { return s==="Al día"?"status-verde":s==="En mora"?"status-mora":"status-riesgo"; }
function loanStatusDot(s) { return s==="Al día"?"🟢":s==="En mora"?"🔴":"🟡"; }

/* ✅ NUEVO: conteo de notificaciones (mora + stock bajo) */
function notifCount() {
  const mora = state.loans.filter(l => calcLateDays(l) >= (state.notifSettings?.loanOverdueDays||3) || l.status==="En mora").length;
  const stock = state.vaperInventory.filter(p => Number(p.quantity) <= Number(p.minStock||3)).length;
  return mora + stock;
}

function generateSchedule(loan) {
  const total = Number(loan.capital) * (1 + Number(loan.interest||0)/100);
  const freqMap = { "Diario":1,"Semanal":7,"Quincenal":15,"Mensual":30 };
  const days = freqMap[loan.frequency] || 7;
  const start = loan.startDate ? new Date(loan.startDate) : new Date();
  const maxP = loan.frequency==="Diario"?30:loan.frequency==="Mensual"?12:loan.frequency==="Quincenal"?24:52;
  const cuota = total / maxP; const rows = []; let remaining = total; let paid = Number(loan.paid||0);
  for (let i=0; i<maxP && remaining>0.01; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i*days);
    const thisPay = Math.min(cuota, remaining);
    rows.push({ n:i+1, date:d.toLocaleDateString("es-DO"), amount:thisPay, paid: paid >= thisPay*(i+1) });
    remaining -= thisPay;
  }
  return rows;
}

/* =====================================================================
   TABS con badge de notificaciones
   ===================================================================== */
const tabs = [["Inicio","⌂"],["Mi Día","⚑"],["Préstamos","$"],["Vaper","☁"],["Barbería","✂"],["Reportes","▥"],["Imperio","♛"]];

function renderTabs() {
  const nc = notifCount();
  document.getElementById("tabs").innerHTML = tabs.map(([name,icon]) =>
    `<button class="tab ${currentTab===name?"active":""}" onclick="go('${name}')" aria-current="${currentTab===name?"page":"false"}">
      <b>${icon}</b>
      ${name==="Inicio" && nc>0 ? `<span class="notif-badge">${nc}</span>` : ""}
      <span>${name}</span>
    </button>`
  ).join("");
}
function go(tab) { currentTab = tab; render(); }
function destroyCharts() { Object.values(chartInstances).forEach(c=>{try{c.destroy();}catch{}}); chartInstances={}; }

/* =====================================================================
   PIN
   ===================================================================== */
let pinEntry = "";
function renderPin() {
  return `<div class="pin-screen" id="pinScreen">
    <div style="font-size:40px">🔐</div>
    <h2 style="color:var(--neon)">Cedano Business</h2>
    <p style="color:var(--muted)">Ingresa tu PIN</p>
    <div class="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot${pinEntry.length>i?" filled":""}" id="pd${i}"></div>`).join("")}</div>
    <div id="pinError" style="color:var(--danger);min-height:20px;font-size:13px"></div>
    <div class="pin-grid">${[1,2,3,4,5,6,7,8,9,"","0","⌫"].map(k=>`<button class="pin-btn" onclick="pinPress('${k}')">${k}</button>`).join("")}</div>
  </div>`;
}
function pinPress(k) {
  if (k==="⌫") pinEntry = pinEntry.slice(0,-1);
  else if (k!=="") pinEntry += k;
  updatePinDots();
  if (pinEntry.length===4) {
    if (pinEntry===state.pin) { pinUnlocked=true; pinEntry=""; rebuildDOM(); render(); }
    else {
      const e = document.getElementById("pinError");
      if (e) e.textContent = "PIN incorrecto";
      pinEntry=""; updatePinDots();
      setTimeout(()=>{ const e=document.getElementById("pinError"); if(e) e.textContent=""; },1500);
    }
  }
}
function updatePinDots() {
  [0,1,2,3].forEach(i=>{ const d=document.getElementById("pd"+i); if(d) d.className="pin-dot"+(pinEntry.length>i?" filled":""); });
}

function rebuildDOM() {
  document.body.innerHTML = `
    <main class="app"><section id="screen"></section></main>
    <nav class="tabs" id="tabs" role="navigation" aria-label="Navegación principal"></nav>
    <div class="modal" id="searchModal" role="dialog" aria-modal="true" aria-labelledby="searchTitle"><div class="modal-inner"><div class="modal-head"><h2 id="searchTitle">🔍 Búsqueda global</h2><button onclick="closeModal('searchModal')">×</button></div><div id="searchContent"><input id="globalSearchInput" placeholder="Buscar..." oninput="runGlobalSearch(this.value)"/><div id="globalSearchResults" style="margin-top:12px"></div></div></div></div>
    <div class="modal" id="nightModal" role="dialog" aria-modal="true" aria-labelledby="nightModalTitle"><div class="modal-inner"><div class="modal-head"><h2 id="nightModalTitle">🌙 Cierre Nocturno</h2><button onclick="closeNightSummary()">×</button></div><div id="nightContent"></div></div></div>
    <div class="modal" id="editModal" role="dialog" aria-modal="true" aria-labelledby="editTitle"><div class="modal-inner"><div class="modal-head"><h2 id="editTitle">Editar</h2><button onclick="closeEditModal()">×</button></div><div id="editContent"></div></div></div>
    <div class="modal" id="detailModal" role="dialog" aria-modal="true" aria-labelledby="detailTitle"><div class="modal-inner"><div class="modal-head"><h2 id="detailTitle">Detalle</h2><button onclick="closeDetail()">×</button></div><div id="detailContent"></div></div></div>
    <div class="modal" id="aiModal" role="dialog" aria-modal="true" aria-labelledby="aiModalTitle"><div class="modal-inner"><div class="modal-head"><h2 id="aiModalTitle">🧠 IA Cedano</h2><button onclick="closeAI()">×</button></div><div id="aiContent">
      <input id="aiInput" placeholder="Ej: ¿Cuánto gané esta semana?" aria-label="Pregunta para la IA"/>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
        <button class="small-btn green" onclick="askAI('¿Cuánto gané esta semana?')">Esta semana</button>
        <button class="small-btn green" onclick="askAI('¿Quiénes debo cobrar hoy?')">Cobrar hoy</button>
        <button class="small-btn green" onclick="askAI('¿Qué negocio está creciendo más?')">Mayor crecimiento</button>
        <button class="small-btn warn" onclick="askAI('¿Cuánto debo producir hoy para llegar a mi meta mensual?')">Meta mensual</button>
        <button class="small-btn" onclick="askAI('Resumen de patrimonio total')">Patrimonio</button>
        <button class="small-btn blue" onclick="askAI('Dame consejos para crecer mis préstamos')">Consejos</button>
      </div>
      <button class="btn" style="margin-top:10px" onclick="runAI()">Preguntar ›</button>
      <div id="aiResponse" class="summary-box" style="margin-top:12px;display:none" aria-live="polite" aria-atomic="true"></div>
    </div></div></div>
    <div class="modal" id="payHistModal" role="dialog" aria-modal="true"><div class="modal-inner"><div class="modal-head"><h2>💳 Historial de pagos</h2><button onclick="closeModal('payHistModal')">×</button></div><div id="payHistContent"></div></div></div>
    <div class="modal" id="onboardModal" role="dialog" aria-modal="true" style="z-index:60"><div class="modal-inner"><div class="modal-head"><h2>👋 Bienvenido</h2><button onclick="closeOnboard()">×</button></div><div id="onboardContent"></div></div></div>`;
}

/* =====================================================================
   FOCO EN MODALES
   ===================================================================== */
function trapFocus(modalEl) {
  const focusable = modalEl.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0]; const last = focusable[focusable.length-1];
  first.focus();
  modalEl._trapHandler = e => {
    if (e.key!=="Tab") return;
    if (e.shiftKey) { if (document.activeElement===first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement===last) { e.preventDefault(); first.focus(); } }
  };
  modalEl.addEventListener("keydown", modalEl._trapHandler);
}
function releaseFocus(modalEl) {
  if (modalEl._trapHandler) { modalEl.removeEventListener("keydown", modalEl._trapHandler); delete modalEl._trapHandler; }
}
function openModal(id) {
  const m = document.getElementById(id); if (!m) return;
  m.classList.add("open"); setTimeout(()=>trapFocus(m), 50);
}
function closeModal(id) {
  const m = document.getElementById(id); if (!m) return;
  releaseFocus(m); m.classList.remove("open");
}

/* =====================================================================
   ONBOARDING ✅ NUEVO
   ===================================================================== */
const onboardSteps = [
  { icon:"💰", title:"Módulo Préstamos", desc:"Registra clientes, crea préstamos con tabla de cuotas automática y cobra por WhatsApp con un toque." },
  { icon:"☁", title:"Módulo Vaper", desc:"Controla tu inventario, registra ventas y recibe alertas cuando el stock está bajo." },
  { icon:"✂", title:"Módulo Barbería", desc:"Agenda citas, gestiona clientes frecuentes y registra ingresos al marcar citas como completadas." },
  { icon:"▥", title:"Reportes", desc:"Ve tus ganancias en gráficas, compara con el mes anterior y exporta reportes en CSV o PDF." },
  { icon:"🧠", title:"IA Cedano", desc:"Presiona el ícono 🧠 en cualquier pantalla para preguntarle a la IA sobre tu negocio en tiempo real." }
];
let onboardStep = 0;

function openOnboard() {
  onboardStep = 0; renderOnboardStep(); openModal("onboardModal");
}
function renderOnboardStep() {
  const s = onboardSteps[onboardStep];
  const el = document.getElementById("onboardContent"); if (!el) return;
  el.innerHTML = `
    <div style="text-align:center;padding:20px 10px">
      <div style="font-size:52px;margin-bottom:14px">${s.icon}</div>
      <h3 style="color:var(--neon);margin-bottom:10px">${s.title}</h3>
      <p style="color:var(--muted);line-height:1.6;margin-bottom:20px">${s.desc}</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px">
        ${onboardSteps.map((_,i)=>`<div style="width:8px;height:8px;border-radius:50%;background:${i===onboardStep?"var(--neon)":"var(--line)"}"></div>`).join("")}
      </div>
      <div class="row">
        ${onboardStep>0?btn("← Anterior","prevOnboard()","secondary"):""}
        ${onboardStep<onboardSteps.length-1?btn("Siguiente →","nextOnboard()"):btn("¡Empezar!","closeOnboard()")}
      </div>
    </div>`;
}
function nextOnboard() { onboardStep++; renderOnboardStep(); }
function prevOnboard() { onboardStep--; renderOnboardStep(); }
function closeOnboard() {
  state.onboardingDone = true; saveState(); closeModal("onboardModal");
}

/* =====================================================================
   BÚSQUEDA GLOBAL ✅ NUEVO
   ===================================================================== */
function openSearch() { openModal("searchModal"); setTimeout(()=>document.getElementById("globalSearchInput")?.focus(), 80); }

function runGlobalSearch(q) {
  const el = document.getElementById("globalSearchResults"); if (!el) return;
  if (!q || q.length < 2) { el.innerHTML = `<p class="muted" style="text-align:center;padding:14px">Escribe al menos 2 caracteres</p>`; return; }
  const ql = q.toLowerCase();
  const results = [];

  state.loanClients.filter(c => c.name.toLowerCase().includes(ql) || (c.phone||"").includes(ql))
    .forEach(c => results.push({ type:"👤 Cliente préstamo", title:c.name, sub:c.phone, action:`go('Préstamos')` }));

  state.loans.filter(l => l.client.toLowerCase().includes(ql))
    .forEach(l => results.push({ type:"💵 Préstamo", title:l.client, sub:`Balance: ${money(loanBalance(l))} · ${l.status}`, action:`go('Préstamos')` }));

  state.contacts.filter(c => c.name.toLowerCase().includes(ql) || (c.phone||"").includes(ql))
    .forEach(c => results.push({ type:"📇 Contacto", title:c.name, sub:`${c.phone} · ${c.status}`, action:`go('Préstamos')` }));

  state.barberAppointments.filter(a => a.client.toLowerCase().includes(ql))
    .forEach(a => results.push({ type:"✂ Cita barbería", title:a.client, sub:`${a.date} ${a.time} · ${a.service}`, action:`go('Barbería')` }));

  state.barberClients.filter(c => c.name.toLowerCase().includes(ql))
    .forEach(c => results.push({ type:"💈 Cliente barbería", title:c.name, sub:c.phone, action:`go('Barbería')` }));

  state.vaperInventory.filter(p => p.product.toLowerCase().includes(ql) || p.flavor.toLowerCase().includes(ql))
    .forEach(p => results.push({ type:"☁ Producto vaper", title:p.product, sub:`Stock: ${p.quantity} · ${money(p.price)}`, action:`go('Vaper')` }));

  state.vaperClients.filter(c => c.name.toLowerCase().includes(ql))
    .forEach(c => results.push({ type:"☁ Cliente vaper", title:c.name, sub:c.phone, action:`go('Vaper')` }));

  if (!results.length) {
    el.innerHTML = `<div class="empty">Sin resultados para "${esc(q)}"</div>`;
    return;
  }
  el.innerHTML = results.slice(0,12).map(r => `
    <div class="list-item" onclick="closeModal('searchModal');${r.action}" style="cursor:pointer">
      <div>
        <span class="pill" style="margin-bottom:4px">${r.type}</span>
        <div style="font-weight:700">${esc(r.title)}</div>
        <div class="muted" style="font-size:12px">${esc(r.sub)}</div>
      </div>
    </div>`).join("");
}

/* =====================================================================
   RENDER PRINCIPAL
   ===================================================================== */
function render() {
  if (state.pinEnabled && !pinUnlocked) { document.body.innerHTML = renderPin(); return; }
  if (!document.getElementById("screen")) rebuildDOM();
  hideSkeleton(); destroyCharts(); renderTabs();
  const views = {
    "Inicio":renderHome,"Mi Día":renderMyDay,"Préstamos":renderLoans,
    "Vaper":renderVaper,"Barbería":renderBarber,"Reportes":renderReports,"Imperio":renderImperio
  };
  document.getElementById("screen").innerHTML = views[currentTab]();
  const bar = document.getElementById("moneyProgress");
  if (bar) bar.style.width = progress()+"%";
  document.body.classList.toggle("light-mode",!darkMode);
  setTimeout(initCharts,100);

  /* Mostrar onboarding si es la primera vez */
  if (!state.onboardingDone) setTimeout(openOnboard, 600);
}

function header() {
  const nc = notifCount();
  return `<div class="topbar">
    <button class="icon-btn" onclick="openSearch()" aria-label="Búsqueda global">🔍</button>
    <div class="brand">CEDANO BUSINESS</div>
    <button class="icon-btn" onclick="toggleTheme()" aria-label="Cambiar tema">${darkMode?"☀":"🌙"}</button>
    <button class="icon-btn" onclick="openAI()" aria-label="Abrir IA" style="position:relative">
      🧠${nc>0?`<span class="topbar-badge">${nc}</span>`:""}
    </button>
  </div>`;
}
function toggleTheme() {
  darkMode = !darkMode; localStorage.setItem("CEDANO_THEME",darkMode?"dark":"light");
  document.body.classList.toggle("light-mode",!darkMode);
  const b = document.querySelector(".topbar .icon-btn:nth-child(3)");
  if (b) b.textContent = darkMode?"☀":"🌙";
}

/* =====================================================================
   HOME
   ===================================================================== */
function renderHome() {
  const missing = Math.max(0, state.moneyGoal - state.moneyToday);
  const mora = state.loans.filter(l => calcLateDays(l)>0 || l.status==="En mora").length;
  const pendingC = state.contacts.filter(c => c.status==="Pendiente").length;
  const taskPct = state.tasks.length ? Math.round(completedTasks()/state.tasks.length*100) : 0;
  const todayCitas = state.barberAppointments.filter(a => a.date===today()).length;
  const lowStockItems = state.vaperInventory.filter(p => Number(p.quantity) <= Number(p.minStock||3));
  const moraLoans = state.loans.filter(l => calcLateDays(l)>0 || l.status==="En mora");
  const overdueAlert = state.loans.filter(l => calcLateDays(l) >= (state.notifSettings?.loanOverdueDays||3));
  const d = new Date(); const hLeft = Math.max(0, 22-d.getHours());
  return `
    ${header()}
    <div class="hero-title"><div class="logo-mark">$</div><div><h1>CEDANO</h1><p>DISCIPLINA • NEGOCIOS • PRODUCTIVIDAD</p></div></div>
    <p class="hello">Buen día, <strong>${esc(state.userName)}</strong> 👋</p>
    <p class="sub">Enfocado hoy, imparable siempre.</p>
    <div class="clock" id="clock">${d.toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"})}</div>
    <section class="card capital"><div><p class="label">Capital en efectivo</p><p class="big-money">${money(state.capital)}</p></div><span class="muted">›</span></section>
    <h2 class="section-title">📊 Panel de Hoy</h2>
    <section class="grid-3">
      ${metric("💵","Dinero hoy",money(state.moneyToday),"Generado")}
      ${metric("📅","Citas barbería",todayCitas,"Hoy")}
      ${metric("⏰","Tiempo libre",hLeft+"h","Estimado")}
    </section>
    ${lowStockItems.length?`<div class="card alert-card warn-card">
      <p class="title" style="color:var(--warn)">⚠ Stock bajo — reponer pronto</p>
      ${lowStockItems.map(p=>`<p class="pill warn">☁ ${esc(p.product)} — ${p.quantity}/${p.minStock} uds.</p>`).join("")}
      <small class="muted">Toca Vaper para agregar stock</small>
    </div>`:""}
    ${overdueAlert.length?`<div class="card alert-card danger-card">
      <p class="title" style="color:var(--danger)">🔴 Cobros urgentes (≥${state.notifSettings?.loanOverdueDays||3} días)</p>
      ${overdueAlert.map(l=>`<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:8px 0">
        <span>💸 ${esc(l.client)} — <strong>${calcLateDays(l)} días</strong></span>
        <button class="small-btn green" onclick="whatsappLoan('${l.id}')">WA</button>
      </div>`).join("")}
    </div>`:""}
    ${card("🎯 Misión del día",`<p>${esc(state.mission||"Sin misión establecida")}</p>${inp("missionInput","Ej: Conseguir 3 clientes")}<div class="row" style="margin-top:8px">${btn("Guardar","saveMission()")}${btn("✔ Completar (+50 XP)","completeMission()","secondary")}</div>`)}
    ${card("💰 Meta diaria",`<p class="big-money">${money(state.moneyGoal)}</p><p>Generado: ${money(state.moneyToday)}</p><div class="progress"><span id="moneyProgress"></span></div><p class="green">${progress()}% completado — faltan ${money(missing)}</p>${inp("goalInput","Meta RD$","number")}${inp("todayMoneyInput","Dinero generado hoy","number")}${btn("Guardar","saveMoney()")}`)}
    <section class="grid">
      ${metric("⚔","XP",state.xp,"Puntos")}${metric("🏆","Rango",rank(),"Sigue avanzando")}
      ${metric("🎯","Pendientes",pendingTasks(),"Tareas")}${metric("📌","Seguimientos",state.contacts.length,"Activos")}
    </section>
    ${card("📖 Verso del Día",`<p><em>Porque yo sé los planes que tengo para vosotros.</em></p><p class="green">Jeremías 29:11</p>`)}
    <h2 class="section-title">Módulos</h2>
    ${["💰,Préstamos,Clientes préstamos y cobros.,Préstamos","☁,Vaper,Inventario y ventas.,Vaper","✂,Barbería,Agenda y clientes.,Barbería","▥,Reportes,Ganancias y estado general.,Reportes","⚑,Productividad,Metas hábitos y XP.,Mi Día","♛,Mi Imperio,Patrimonio y crecimiento.,Imperio"].map(s=>{const[ic,nm,dc,tb]=s.split(",");return`<div class="module" onclick="go('${tb}')"><div class="module-icon">${ic}</div><div><strong>${nm}</strong><small>${dc}</small></div><div class="arrow">›</div></div>`;}).join("")}
    ${card("🧠 Resumen IA",`<p class="pill green">Faltan ${money(missing)} para cumplir tu meta.</p><p class="pill ${mora?"danger":"green"}">${mora} clientes en mora.</p><p class="pill warn">${pendingC} personas pendientes por contactar.</p><p class="pill green">Completaste el ${taskPct}% de tus tareas.</p><p class="pill">Balance en préstamos: ${money(totalLoanBalance())}</p><p class="pill blue">Patrimonio total: ${money(patrimonyTotal())}</p>${btn("Abrir IA completa","openAI()","secondary")}`)}
    <h2 class="section-title">Accesos rápidos</h2>
    <section class="quick-grid">
      ${[["👥","Clientes","Préstamos"],["☁","Vaper","Vaper"],["✂","Barbería","Barbería"],["▥","Reportes","Reportes"],["⚑","Metas","Mi Día"],["$","Finanzas","Reportes"],["📅","Agenda","Mi Día"],["♛","Imperio","Imperio"]].map(([ic,nm,tb])=>`<button class="quick" onclick="go('${tb}')"><span>${ic}</span><small>${nm}</small></button>`).join("")}
    </section>`;
}

/* =====================================================================
   MI DÍA
   ===================================================================== */
function renderMyDay() {
  return `
    <h1 class="section-title">⚑ Mi Día</h1>
    ${card("🌅 Hábitos de hoy", state.habits.map(h=>`
      <div class="habit-item ${h.done?"done":""}" onclick="toggleHabit('${h.id}')" role="checkbox" aria-checked="${h.done}" tabindex="0">
        <div class="habit-check">${h.done?"✓":""}</div>
        <span>${esc(h.text)}</span>
        <span class="pill green" style="margin-left:auto">${h.streak}🔥</span>
        ${sm("🗑","deleteHabit('"+h.id+"')","red")}
      </div>`).join("")+inp("newHabitInput","Agregar hábito")+btn("Agregar hábito","addHabit()"))}
    ${card("📊 Estadísticas personales",`
      <div class="grid-3">
        <div class="card metric"><div class="title">🏋 Gym</div><div class="value">${state.habitStats.daysTraining}</div><div class="muted">días seguidos</div></div>
        <div class="card metric"><div class="title">🎯 Metas</div><div class="value">${state.habitStats.daysMeta}</div><div class="muted">días cumplidos</div></div>
        <div class="card metric"><div class="title">😴 Sueño</div><div class="value">${state.habitStats.avgSleep}h</div><div class="muted">promedio</div></div>
      </div>
      <div style="margin-top:12px"><p class="label">Racha semanal</p>
        <div style="display:flex;gap:6px;margin-top:6px">
          ${["L","M","M","J","V","S","D"].map((d,i)=>`<div style="text-align:center"><div class="streak-box${i<5?" hit":""}"></div><small style="color:var(--muted);font-size:10px">${d}</small></div>`).join("")}
        </div>
      </div>`)}
    ${card("✅ Tareas del día",`
      ${inp("taskText","Ej: Cobrar a Pedro")}
      <div class="row">${sel("taskType",["Diario","Semanal","Mensual"],"Diario")}${sel("taskPriority",["Baja","Media","Alta","Urgente"],"Media")}</div>
      <div class="row">${inp("taskDate","Fecha")}${inp("taskTime","Hora")}</div>
      ${btn("Agregar tarea","addTask()")}
      <div style="margin-top:12px">${state.tasks.length?state.tasks.map(taskHTML).join(""):`<div class="empty">No hay tareas.</div>`}</div>`)}
    ${card("📅 Planificar Mañana",`
      ${inp("tomorrowMission","Misión principal mañana","text",state.tomorrow.mission)}
      ${inp("tomorrowGoal","Meta de dinero mañana","number",state.tomorrow.moneyGoal)}
      ${inp("tomorrowTask","Tarea para mañana")}
      ${inp("tomorrowReminder","Recordatorio")}
      ${btn("Guardar plan","saveTomorrowPlan()")}
      <div class="summary-box">
        <strong class="green">Plan guardado</strong>
        <p>Misión: ${esc(state.tomorrow.mission||"Sin misión")}</p>
        <p>Meta: ${state.tomorrow.moneyGoal?money(state.tomorrow.moneyGoal):"Sin meta"}</p>
        ${state.tomorrow.tasks.map(t=>`<p class="pill green">• ${esc(t.text)}</p>`).join("")}
      </div>`)}
    ${btn("🌙 Cierre Nocturno","openNightSummary()")}`;
}

function taskHTML(task) {
  return `<div class="list-item task ${task.done?"done":""}">
    <div onclick="toggleTask('${task.id}')" style="flex:1;cursor:pointer" role="checkbox" aria-checked="${task.done}" tabindex="0">
      <div class="task-text">${task.done?"☑":"☐"} ${esc(task.text)}</div>
      <small class="muted">${task.type||"Diario"} • ${task.date||"Sin fecha"} • ${task.time||"Sin hora"}</small>
    </div>
    <span class="pill ${task.priority==="Urgente"?"danger":task.priority==="Alta"?"warn":"green"}">${task.priority}</span>
    ${sm("✏","openEdit('task','"+task.id+"')","")}
    ${sm("🗑","deleteRecord('task','"+task.id+"')","red")}
  </div>`;
}

/* =====================================================================
   PRÉSTAMOS
   ===================================================================== */
function renderLoans() {
  const pending = state.contacts.filter(c=>c.status==="Pendiente").length;
  const interested = state.contacts.filter(c=>c.status==="Interesado").length;
  const converted = state.contacts.filter(c=>c.status==="Convertido").length;
  return `
    <h1 class="section-title">💰 Módulo Préstamos</h1>
    <section class="grid-3">
      ${metric("👥","Clientes",state.loanClients.length,"Registrados")}
      ${metric("💵","Préstamos",state.loans.length,"Activos")}
      ${metric("⚠","En mora",state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length,"Clientes")}
    </section>
    ${card("🔍 Buscar",`<div class="search-box">${inp("loanSearch","Buscar cliente o préstamo...")}${sm("🔍","filterLoans()","green")}</div>`)}
    ${card("🧮 Calculadora de préstamos",`
      <div class="row">${inp("calcCapital","Capital","number")}${inp("calcInterest","Interés %","number")}</div>
      <div class="row">${sel("calcFreq",["Diario","Semanal","Quincenal","Mensual"],"Semanal")}${inp("calcPeriods","Períodos","number")}</div>
      ${btn("Calcular","calcLoan()")}
      <div class="calc-result" id="calcResult" style="display:none"></div>`)}
    ${card("➕ Agregar cliente",`
      ${inp("clientName","Nombre completo")}${inp("clientCedula","Cédula")}
      ${inp("clientPhone","Teléfono")}${inp("clientAddress","Dirección")}
      ${inp("clientReference","Referencia personal")}${ta("clientNotes","Notas")}
      ${btn("Guardar cliente","addLoanClient()")}`)}
    <h2 class="section-title">Clientes</h2>
    <div id="clientList">${state.loanClients.map(clientHTML).join("")}</div>
    ${card("📇 Personas por contactar",`
      <div class="row" style="margin-bottom:10px">
        <span class="pill warn">⏳ Pendientes: ${pending}</span>
        <span class="pill blue">🙋 Interesados: ${interested}</span>
        <span class="pill green">✔ Convertidos: ${converted}</span>
      </div>
      ${inp("contactName","Nombre")}${inp("contactPhone","Teléfono")}${inp("contactAddress","Dirección")}
      ${inp("contactSource","Fuente del contacto")}${ta("contactNote","Nota")}
      ${sel("contactPriority",["Baja","Media","Alta"],"Media")}
      ${btn("Agregar persona","addContact()")}`)}
    <div id="contactList">${state.contacts.map(contactHTML).join("")}</div>
    ${card("📝 Crear préstamo",`
      <div class="currency-toggle">
        <button class="currency-btn active" id="btnRD" onclick="setCurrency('RD$')">RD$</button>
        <button class="currency-btn" id="btnUSD" onclick="setCurrency('USD')">USD</button>
      </div>
      <div id="usdRateRow" style="display:none">
        <p class="muted" style="font-size:12px;margin-bottom:4px">Tasa actual: RD$<span id="rateDisplay">${Number(state.usdRate||59)}</span>/USD</p>
        ${inp("usdRateLive","Nueva tasa RD$/USD","number",state.usdRate)}
        ${sm("Actualizar tasa","updateUsdRate()","green")}
      </div>
      ${inp("loanClient","Cliente")}${inp("loanCapital","Capital prestado","number")}
      ${inp("loanInterest","Interés %","number")}${inp("loanStartDate","Fecha de inicio","text",today())}
      ${inp("loanDueDate","Fecha de vencimiento")}
      ${sel("loanFrequency",["Diario","Semanal","Quincenal","Mensual"],"Semanal")}
      ${btn("Guardar préstamo","addLoan()")}`)}
    <h2 class="section-title">Préstamos activos</h2>
    <div id="loanList">${state.loans.map(loanHTML).join("")}</div>
    ${card("💳 Registrar pago",`
      ${inp("paymentLoan","Nombre del cliente")}${inp("paymentAmount","Monto pagado","number")}
      ${inp("paymentDate","Fecha","text",today())}
      ${btn("Registrar pago","addPayment()")}
      ${btn("📋 Ver historial de pagos","openPayHistory()","secondary")}`)}
    ${card("📊 Resumen préstamos",`
      <p>Total prestado: ${money(state.loans.reduce((s,l)=>s+Number(l.capital||0),0))}</p>
      <p>Por cobrar: ${money(totalLoanBalance())}</p>
      <p>Cobrado: ${money(state.payments.reduce((s,p)=>s+Number(p.amount||0),0))}</p>
      <p>Morosos: ${state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length}</p>`)}
    ${state.archivedLoans.length?`
      <h2 class="section-title">📁 Préstamos archivados</h2>
      ${state.archivedLoans.map(l=>`<article class="card" style="opacity:.65">
        <h3 class="title">✅ ${esc(l.client)} <span class="pill green">Cancelado</span></h3>
        <p>Capital: ${money(l.capital)} | Interés: ${l.interest}% | Cobrado: ${money(l.paid)}</p>
        <p class="muted">Archivado el ${esc(l.archivedDate||"")}</p>
        ${sm("🗑 Eliminar","deleteArchivedLoan('"+l.id+"')","red")}
      </article>`).join("")}`:""}`;
}

/* ✅ NUEVO: historial de pagos filtrable */
function openPayHistory() {
  renderPayHistory(""); openModal("payHistModal");
}
function renderPayHistory(filter) {
  const el = document.getElementById("payHistContent"); if (!el) return;
  const filtered = filter
    ? state.payments.filter(p => p.client.toLowerCase().includes(filter.toLowerCase()))
    : state.payments;
  const total = filtered.reduce((s,p) => s+Number(p.amount||0), 0);
  el.innerHTML = `
    ${inp("payHistFilter","Filtrar por cliente","text",filter)}
    ${btn("Filtrar","renderPayHistory(document.getElementById('payHistFilter').value)","secondary")}
    <p style="margin-top:10px"><strong>Total mostrado: ${money(total)}</strong> (${filtered.length} pagos)</p>
    ${filtered.length?filtered.slice().reverse().map(p=>`
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${esc(p.client)}</strong>
          <p class="muted" style="font-size:12px">${esc(p.date)}</p>
        </div>
        <span class="pill green">${money(p.amount)}</span>
      </div>`).join(""):
      `<div class="empty">Sin pagos registrados${filter?" para este filtro":""}</div>`}`;
}

let loanCurrency = "RD$";
function setCurrency(cur) {
  loanCurrency = cur;
  document.getElementById("btnRD").className = "currency-btn"+(cur==="RD$"?" active":"");
  document.getElementById("btnUSD").className = "currency-btn"+(cur==="USD"?" active":"");
  const row = document.getElementById("usdRateRow");
  if (row) row.style.display = cur==="USD"?"block":"none";
}
/* ✅ NUEVO: actualizar tasa USD en vivo */
function updateUsdRate() {
  const val = Number(document.getElementById("usdRateLive")?.value||0);
  if (!val) return;
  state.usdRate = val; saveState();
  const disp = document.getElementById("rateDisplay");
  if (disp) disp.textContent = val;
  showToast(`✅ Tasa actualizada: RD$${val}/USD`);
}

function filterLoans() {
  const q = (document.getElementById("loanSearch")?.value||"").toLowerCase();
  const cl = document.getElementById("clientList"); const ll = document.getElementById("loanList"); const co = document.getElementById("contactList");
  if (cl) cl.innerHTML = state.loanClients.filter(c=>c.name.toLowerCase().includes(q)).map(clientHTML).join("");
  if (ll) ll.innerHTML = state.loans.filter(l=>l.client.toLowerCase().includes(q)).map(loanHTML).join("");
  if (co) co.innerHTML = state.contacts.filter(c=>c.name.toLowerCase().includes(q)).map(contactHTML).join("");
}
function calcLoan() {
  const capital = Number(document.getElementById("calcCapital")?.value||0);
  const interest = Number(document.getElementById("calcInterest")?.value||0);
  const freq = document.getElementById("calcFreq")?.value||"Semanal";
  const periods = Number(document.getElementById("calcPeriods")?.value||12);
  if (!capital) return;
  const total = capital*(1+interest/100); const cuota = total/periods; const ganancia = total-capital;
  const el = document.getElementById("calcResult");
  if (el) {
    el.style.display="block"; el.innerHTML=`
    <p>💵 Capital: <strong>${money(capital)}</strong></p>
    <p>💰 Total a cobrar: <strong>${money(total)}</strong></p>
    <p class="green">📈 Ganancia: <strong>${money(ganancia)}</strong></p>
    <p>📅 Cuota ${freq.toLowerCase()}: <strong>${money(cuota)}</strong></p>
    <p class="muted">En ${periods} períodos</p>`;
  }
}

function clientHTML(c) {
  const clientLoans = state.loans.filter(l=>l.client.toLowerCase()===c.name.toLowerCase());
  return `<article class="card">
    <h3 class="title">👤 ${esc(c.name)}</h3>
    <p>Cédula: ${esc(c.cedula)} | Tel: ${esc(c.phone)}</p>
    <p>Dirección: ${esc(c.address)} | Ref: ${esc(c.reference)}</p>
    <p class="muted">${esc(c.notes)}</p>
    <p class="muted">Última visita: ${esc(c.lastVisit||"N/A")}</p>
    ${clientLoans.map(l=>`<div style="margin-top:8px"><span class="status-badge ${loanStatusClass(l.status)}">${loanStatusDot(l.status)} ${l.status}</span> <span class="muted">Balance: ${money(loanBalance(l))}</span></div>`).join("")}
    <div class="row" style="margin-top:10px">
      ${sm("✏ Editar","openEdit('loanClient','"+c.id+"')","")}
      ${sm("🗑 Eliminar","deleteRecord('loanClient','"+c.id+"')","red")}
    </div>
  </article>`;
}

function contactHTML(c) {
  return `<article class="card">
    <h3 class="title">📇 ${esc(c.name)}</h3>
    <p>${esc(c.phone||"Sin teléfono")} | ${esc(c.address||"Sin dirección")}</p>
    <p class="muted">${esc(c.note||"")}</p>
    <span class="pill green">${c.priority}</span><span class="pill">${c.status}</span>
    <div class="row" style="margin-top:10px">
      ${sm("📞 Llamar","callContact('"+c.id+"')","")}
      ${sm("💬 WhatsApp","whatsappCobro('"+c.id+"')","")}
      ${sm("✔ Convertido","setContactStatus('"+c.id+"','Convertido')","green")}
      ${sm("🗑","deleteContact('"+c.id+"')","red")}
    </div>
    ${sel("status-"+c.id,["Pendiente","Llamado","Visitado","Interesado","No interesado","Convertido"],c.status)}
    ${btn("Cambiar estado","updateContactStatus('"+c.id+"')","")}
  </article>`;
}

function loanHTML(loan) {
  const lateDays = calcLateDays(loan);
  const effectiveStatus = lateDays>0&&loan.status==="Al día"?"En mora (auto)":loan.status;
  const schedule = generateSchedule(loan);
  const scheduleHTML = `<div style="overflow-x:auto;margin-top:10px">
    <table class="schedule-table">
      <thead><tr><th>#</th><th>Fecha</th><th>Cuota</th><th>Estado</th></tr></thead>
      <tbody>${schedule.slice(0,8).map(r=>`<tr class="${r.paid?"paid-row":""}"><td>${r.n}</td><td>${r.date}</td><td>${money(r.amount)}</td><td>${r.paid?"✅":"⏳"}</td></tr>`).join("")}</tbody>
    </table>
    ${schedule.length>8?`<p class="muted" style="font-size:12px;margin-top:6px">Mostrando 8 de ${schedule.length} cuotas</p>`:""}
  </div>`;
  return `<article class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
      <h3 class="title" style="margin:0">💵 ${esc(loan.client)}</h3>
      <span class="status-badge ${loanStatusClass(loan.status)}">${loanStatusDot(loan.status)} ${esc(effectiveStatus)}</span>
    </div>
    <p>Capital: ${money(loan.capital,loan.currency==="USD"?"USD":"")} | Interés: ${loan.interest}%</p>
    <p>Inicio: ${esc(loan.startDate||"Sin fecha")} | Vence: ${esc(loan.dueDate||"Sin fecha")}</p>
    <p>Frecuencia: ${loan.frequency} | Días de atraso: <span class="pill ${lateDays>5?"danger":"warn"}">${lateDays}</span></p>
    <p>Pagado: ${money(loan.paid)}</p>
    <p class="green" style="font-size:18px;font-weight:900">Balance: ${money(loanBalance(loan))}</p>
    <details style="margin-top:10px">
      <summary style="cursor:pointer;color:var(--neon);font-weight:700">📅 Ver tabla de cuotas</summary>
      ${scheduleHTML}
    </details>
    ${sel("loanstatus-"+loan.id,["Al día","En riesgo","En mora","Cancelado"],loan.status)}
    ${btn("Actualizar estado","updateLoanStatus('"+loan.id+"')","")}
    <div class="row" style="margin-top:8px">
      ${sm("✏ Editar","openEdit('loan','"+loan.id+"')","")}
      ${sm("💬 Cobro WA","whatsappLoan('"+loan.id+"')","green")}
      ${loanBalance(loan)===0?sm("📁 Archivar","archiveLoan('"+loan.id+"')",""):""} 
      ${sm("🗑 Eliminar","deleteRecord('loan','"+loan.id+"')","red")}
    </div>
  </article>`;
}

/* ✅ NUEVO: archivar préstamo cancelado */
function archiveLoan(id) {
  const loan = state.loans.find(l=>l.id===id); if (!loan) return;
  if (!confirm(`¿Archivar el préstamo de ${loan.client}?`)) return;
  state.archivedLoans = [...(state.archivedLoans||[]), { ...loan, archivedDate: today() }];
  state.loans = state.loans.filter(l=>l.id!==id);
  saveState(); render(); showToast("📁 Préstamo archivado");
}
function deleteArchivedLoan(id) {
  if (!confirm("¿Eliminar del archivo?")) return;
  state.archivedLoans = state.archivedLoans.filter(l=>l.id!==id);
  saveState(); render();
}

function whatsappCobro(contactId) {
  const c = state.contacts.find(x=>x.id===contactId); if (!c) return;
  const msg = `Hola ${c.name}, te recordamos que tienes un seguimiento pendiente en Cedano Business. Por favor comunícate con nosotros. 🙏`;
  window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappLoan(loanId) {
  const l = state.loans.find(x=>x.id===loanId); if (!l) return;
  const balance = loanBalance(l); const lateDays = calcLateDays(l);
  const msg = `Hola ${l.client}, te recordamos que tienes un pago pendiente de *${money(balance)}* en Cedano Business.${lateDays>0?` Llevas *${lateDays} días de atraso*.`:""} Por favor realiza tu pago a la brevedad. Gracias 🙏`;
  const client = state.loanClients.find(c=>c.name.toLowerCase()===l.client.toLowerCase());
  window.open(`https://wa.me/${(client?.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

/* =====================================================================
   VAPER
   ===================================================================== */
function renderVaper() {
  /* ✅ NUEVO: ranking de productos más vendidos */
  const salesByProduct = {};
  state.vaperSales.forEach(s => {
    salesByProduct[s.product] = (salesByProduct[s.product]||0) + Number(s.gain||0);
  });
  const topProducts = Object.entries(salesByProduct).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return `
    <h1 class="section-title">☁ Módulo Vaper</h1>
    <section class="grid-3">
      ${metric("☁","Productos",state.vaperInventory.length,"Inventario")}
      ${metric("🛒","Ventas",state.vaperSales.length,"Registradas")}
      ${metric("💚","Ganancia",money(vaperGain()),"Total")}
    </section>
    <div class="search-box">${inp("vaperSearch","Buscar producto...")}${sm("🔍","filterVaper()","green")}</div>
    ${card("📦 Agregar producto",`
      ${inp("vpProduct","Producto")}${inp("vpBrand","Marca")}${inp("vpModel","Modelo")}
      ${sel("vpType",["Desechable","Recargable","Líquido","Accesorio"],"Desechable")}
      ${inp("vpFlavor","Sabor / Presentación")}
      <div class="row">${inp("vpQty","Cantidad","number")}${inp("vpCost","Costo","number")}${inp("vpPrice","Precio de venta","number")}</div>
      <div class="row"><div>${inp("vpMinStock","Stock mínimo (alerta)","number","3")}</div></div>
      ${btn("Agregar","addVaperProduct()")}`)}
    <h2 class="section-title">Inventario</h2>
    <div id="vaperList">${state.vaperInventory.map(vaperProductHTML).join("")}</div>
    ${topProducts.length?card("🏆 Top productos por ganancia",`
      ${topProducts.map(([name,gain],i)=>`
        <div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
          <span>${i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "} ${esc(name)}</span>
          <span class="pill green">${money(gain)}</span>
        </div>`).join("")}`):""}
    ${card("🛒 Registrar venta",`
      ${inp("saleClient","Cliente")}${inp("saleProduct","Producto exacto")}
      <div class="row">${inp("saleQty","Cantidad","number")}${inp("saleDate","Fecha","text",today())}</div>
      ${sel("saleMethod",["Efectivo","Transferencia","Tarjeta","Crédito"],"Efectivo")}
      ${btn("Guardar venta","addVaperSale()")}`)}
    ${card("👥 Clientes Vaper",`
      ${inp("vaperClientName","Nombre")}${inp("vaperClientPhone","Teléfono")}${ta("vaperClientHistory","Historial")}
      ${btn("Agregar cliente","addVaperClient()")}
      ${state.vaperClients.map(cl=>`<div class="list-item" style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><strong>${esc(cl.name)}</strong> <span class="muted">${esc(cl.phone)}</span>
        <p class="muted">${esc(cl.history)}</p><p class="green">Total gastado: ${money(cl.totalSpent)}</p></div>
        ${sm("🗑","deleteRecord('vaperClient','"+cl.id+"')","red")}
      </div>`).join("")}`)}`;
}

function filterVaper() {
  const q = (document.getElementById("vaperSearch")?.value||"").toLowerCase();
  const el = document.getElementById("vaperList");
  if (el) el.innerHTML = state.vaperInventory.filter(p=>p.product.toLowerCase().includes(q)||p.flavor.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q)).map(vaperProductHTML).join("");
}

function vaperProductHTML(p) {
  const gain = Number(p.price)-Number(p.cost); const low = Number(p.quantity) <= Number(p.minStock||3);
  return `<article class="card" style="${low?"border-color:rgba(255,204,77,.6)":""}">
    <h3 class="title">☁ ${esc(p.product)} ${low?`<span class="pill warn">⚠ Stock bajo (mín: ${p.minStock||3})</span>`:""}</h3>
    <p>Marca: ${esc(p.brand)} | Modelo: ${esc(p.model)} | Sabor: ${esc(p.flavor)} | Tipo: ${esc(p.type)}</p>
    <p>Cantidad: <strong>${p.quantity}</strong> uds. | Costo: ${money(p.cost)} → Venta: ${money(p.price)}</p>
    <p class="green">Ganancia/ud: ${money(gain)} | Valor inventario: ${money(Number(p.quantity)*Number(p.cost))}</p>
    <div class="row" style="margin-top:8px">
      ${sm("✏ Editar","openEdit('vaperProduct','"+p.id+"')","")}
      ${sm("🗑 Eliminar","deleteRecord('vaperProduct','"+p.id+"')","red")}
    </div>
  </article>`;
}

/* =====================================================================
   BARBERÍA
   ===================================================================== */
function renderBarber() {
  const todayApts = state.barberAppointments.filter(a=>a.date===today());
  return `
    <h1 class="section-title">✂ Módulo Barbería</h1>
    <section class="grid-3">
      ${metric("📅","Citas",state.barberAppointments.length,"Total")}
      ${metric("👥","Clientes",state.barberClients.length,"Registrados")}
      ${metric("💈","Ingresos",money(barberIncome()),"Solo completadas")}
    </section>
    <div class="search-box">${inp("barberSearch","Buscar cliente...")}${sm("🔍","filterBarber()","green")}</div>
    ${card("📅 Agenda de hoy",todayApts.length?todayApts.map(a=>`
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${esc(a.client)}</strong> — ${esc(a.service)} <span class="muted">${esc(a.time)}</span>
          ${a.employeeId?`<span class="pill blue">${esc(state.barberEmployees.find(e=>e.id===a.employeeId)?.name||"")}</span>`:""}
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="pill green">${money(a.price)}</span>
          ${a.completed
            ?`<span class="pill green">✅ Completada</span>`
            :`${sm("✅ Completar","completeBarberApt('"+a.id+"')","green")}`}
          ${sm("💬","whatsappBarber('"+a.id+"')","green")}
          ${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}
        </div>
      </div>`).join(""):`<div class="empty">Sin citas hoy</div>`)}
    ${card("➕ Agendar cita",`
      <div class="row">${inp("barberClient","Cliente")}${inp("barberPhone","Teléfono")}</div>
      ${inp("barberService","Servicio")}
      <div class="row">${inp("barberDate","Fecha","text",today())}${inp("barberTime","Hora")}${inp("barberPrice","Precio","number")}</div>
      <label class="muted" style="font-size:12px">Barbero</label>
      ${sel("barberEmployeeSel",["(Sin asignar)",...state.barberEmployees.map(e=>e.name)],"(Sin asignar)")}
      ${sel("barberReminder",["Sí","No"],"Sí")}
      ${btn("Agregar cita","addBarberAppointment()")}`)}
    <h2 class="section-title">Todas las citas</h2>
    <div id="barberAptList">
      ${state.barberAppointments.map(a=>`<article class="card">
        <h3 class="title">✂ ${esc(a.client)} ${a.completed?'<span class="pill green">✅ Completada</span>':'<span class="pill warn">⏳ Pendiente</span>'}</h3>
        <p>${esc(a.service)} | ${esc(a.date)} ${esc(a.time)} | Tel: ${esc(a.phone)}</p>
        ${a.employeeId?`<p class="muted">Barbero: ${esc(state.barberEmployees.find(e=>e.id===a.employeeId)?.name||"")}</p>`:""}
        <p class="green">${money(a.price)}</p>
        <div class="row" style="margin-top:8px">
          ${!a.completed?sm("✅ Marcar completada","completeBarberApt('"+a.id+"')","green"):""}
          ${sm("💬 WA","whatsappBarber('"+a.id+"')","green")}
          ${sm("✏ Editar","openEdit('barberApt','"+a.id+"')","")}
          ${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}
        </div>
      </article>`).join("")}
    </div>
    ${card("👥 Clientes frecuentes",`
      <div class="row">${inp("barberClientName","Nombre")}${inp("barberClientPhone","Teléfono")}</div>
      ${ta("barberClientHistory","Historial de cortes")}
      ${ta("barberClientCutNotes","Notas del estilo (largo, fade, degradado...)")}
      <div class="row">${inp("barberClientFrequency","Frecuencia")}${inp("barberClientBirthday","Cumpleaños")}</div>
      ${btn("Agregar cliente","addBarberClient()")}
      <div id="barberClientList">
        ${state.barberClients.map(cl=>`<div class="list-item">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div><strong>${esc(cl.name)}</strong> ${cl.birthday?`<span class="pill gold">🎂 ${esc(cl.birthday)}</span>`:""}
            <p class="muted">${esc(cl.frequency||"")} | ${esc(cl.phone||"")}</p>
            ${cl.cutNotes?`<p class="muted" style="font-size:12px">✂ ${esc(cl.cutNotes)}</p>`:""}
            <p class="muted" style="font-size:12px">${esc(cl.history||"")}</p></div>
            <div class="row">${sm("💬","whatsappBarberClient('"+cl.id+"')","green")}${sm("✏","openEdit('barberClient','"+cl.id+"')","")}${sm("🗑","deleteRecord('barberClient','"+cl.id+"')","red")}</div>
          </div>
        </div>`).join("")}
      </div>`)}
    ${card("💈 Servicios",`
      <div class="row">${inp("serviceName","Servicio")}${inp("servicePrice","Precio","number")}${inp("serviceDuration","Duración")}</div>
      ${btn("Agregar servicio","addBarberService()")}
      ${state.barberServices.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:8px 0">
        <span class="pill green">${esc(s.name)} • ${money(s.price)} • ${esc(s.duration)}</span>
        ${sm("🗑","deleteRecord('barberService','"+s.id+"')","red")}
      </div>`).join("")}`)}
    ${card("👷 Empleados y comisiones",`
      <div class="row">${inp("employeeName","Nombre")}${inp("employeePercent","Comisión %","number")}</div>
      <div class="row">${inp("employeeSchedule","Horario")}${inp("employeePaid","Pagos realizados","number")}</div>
      ${btn("Agregar empleado","addEmployee()")}
      ${state.barberEmployees.map(e=>{
        /* ✅ NUEVO: comisiones desde citas completadas asignadas */
        const empIncome = barberIncomeByEmployee(e.id);
        const empCommission = empIncome * Number(e.percent||0) / 100;
        const generalIncome = barberIncome() - (state.barberAppointments.filter(a=>a.completed&&a.employeeId).reduce((s,a)=>s+Number(a.price||0),0));
        const generalCommission = generalIncome * Number(e.percent||0) / 100;
        return `<div class="list-item">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div><strong>${esc(e.name)}</strong> — ${e.percent}% comisión<br>
            <span class="muted">${esc(e.schedule||"")}</span></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
            <div class="card metric" style="min-height:auto">
              <div class="title" style="font-size:12px">Citas asignadas</div>
              <div class="value" style="font-size:16px">${money(empIncome)}</div>
              <div class="muted">Comisión: <strong class="green">${money(empCommission)}</strong></div>
            </div>
            <div class="card metric" style="min-height:auto">
              <div class="title" style="font-size:12px">Sin asignar</div>
              <div class="value" style="font-size:16px">${money(generalIncome)}</div>
              <div class="muted">Comisión: <strong class="green">${money(generalCommission)}</strong></div>
            </div>
          </div>
          <p style="margin-top:8px">Ya pagado: ${money(e.paid)} | <strong class="green">Pendiente: ${money(empCommission+generalCommission-Number(e.paid||0))}</strong></p>
          ${sm("🗑","deleteRecord('employee','"+e.id+"')","red")}
        </div>`;
      }).join("")}`)}
    ${card("💰 Finanzas Barbería",`
      ${inp("barberExpense","Gasto diario","number")}${inp("barberExpenseDesc","Descripción del gasto")}
      ${btn("Guardar gasto","addBarberExpense()")}
      <p style="margin-top:10px">Ingresos (completadas): ${money(barberIncome())}</p>
      <p>Gastos: ${money(barberExpenseTotal())}</p>
      <p class="green" style="font-size:18px;font-weight:900">Ganancia: ${money(barberIncome()-barberExpenseTotal())}</p>
      ${state.barberExpenses.length?`<details style="margin-top:10px"><summary style="cursor:pointer;color:var(--neon)">Ver gastos registrados</summary>
        ${state.barberExpenses.slice().reverse().map(e=>`<div class="list-item" style="display:flex;justify-content:space-between"><span>${esc(e.desc||e.date)}</span><span class="pill warn">${money(e.amount)}</span></div>`).join("")}
      </details>`:""}`)}`;
}

function completeBarberApt(id) {
  const apt = state.barberAppointments.find(a=>a.id===id);
  if (!apt||apt.completed) return;
  state.barberAppointments = state.barberAppointments.map(a=>a.id===id?{...a,completed:true}:a);
  state.moneyToday += Number(apt.price||0);
  saveState(); render();
  showToast(`✅ Cita de ${apt.client} completada — ${money(apt.price)} registrado`);
}

function filterBarber() {
  const q = (document.getElementById("barberSearch")?.value||"").toLowerCase();
  const el = document.getElementById("barberAptList");
  if (el) el.innerHTML = state.barberAppointments.filter(a=>a.client.toLowerCase().includes(q)).map(a=>`<article class="card">
    <h3 class="title">✂ ${esc(a.client)}</h3>
    <p>${esc(a.service)} | ${esc(a.date)} ${esc(a.time)}</p>
    <p class="green">${money(a.price)}</p>
    <div class="row">${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}</div>
  </article>`).join("");
}

function whatsappBarber(aptId) {
  const a = state.barberAppointments.find(x=>x.id===aptId); if (!a) return;
  const msg = `Hola ${a.client} 💈, te recordamos tu cita en la barbería el *${a.date}* a las *${a.time}* para *${a.service}*. Precio: *${money(a.price)}*. ¡Te esperamos!`;
  window.open(`https://wa.me/${(a.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappBarberClient(clientId) {
  const c = state.barberClients.find(x=>x.id===clientId); if (!c) return;
  const msg = `Hola ${c.name} 💈, te contactamos desde Cedano Barbería. ¿Deseas agendar una cita?`;
  window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

/* =====================================================================
   REPORTES
   ===================================================================== */
function renderReports() {
  const mora = state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length;
  const totalGains = Number(state.moneyToday)-Number(state.moneySpent);
  /* ✅ NUEVO: comparación mes vs anterior */
  const curMonthTotal = state.monthlyRevenue.reduce((s,v)=>s+v,0);
  const prevMonthTotal = (state.prevMonthRevenue||[]).reduce((s,v)=>s+v,0);
  const monthDiff = curMonthTotal - prevMonthTotal;
  const monthPct = prevMonthTotal ? Math.round(Math.abs(monthDiff)/prevMonthTotal*100) : 0;
  return `
    <h1 class="section-title">▥ Reportes</h1>
    <section class="grid-3">
      ${metric("💚","Ganancia hoy",money(totalGains),"Hoy")}
      ${metric("☁","Vaper",money(vaperGain()),"Ganancia")}
      ${metric("✂","Barbería",money(barberIncome()-barberExpenseTotal()),"Ganancia")}
    </section>
    ${card("📅 Calendario",renderCalendar())}
    ${card("📈 Ganancias diarias",`<div class="chart-wrap"><canvas id="chartDaily" role="img" aria-label="Ganancias diarias de la semana"></canvas></div>`)}
    ${card("📊 Comparación mensual",`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <p class="label">Este mes</p>
          <p class="big-money" style="font-size:22px">${money(curMonthTotal)}</p>
        </div>
        <div style="text-align:center">
          <p class="label">vs mes anterior</p>
          <p style="font-size:18px;font-weight:900;color:${monthDiff>=0?"var(--neon)":"var(--danger)"}">
            ${monthDiff>=0?"▲":"▼"} ${monthPct}%
          </p>
          <p class="muted" style="font-size:12px">${monthDiff>=0?"+":" "}${money(Math.abs(monthDiff))}</p>
        </div>
        <div style="text-align:right">
          <p class="label">Mes anterior</p>
          <p class="big-money" style="font-size:22px;color:var(--muted)">${money(prevMonthTotal)}</p>
        </div>
      </div>
      <div class="chart-wrap"><canvas id="chartMonthly" role="img" aria-label="Comparación de ganancias mensuales"></canvas></div>`)}
    ${card("🏢 Rendimiento por negocio",`<div class="chart-wrap"><canvas id="chartBusiness" role="img" aria-label="Distribución de ingresos por negocio"></canvas></div>`)}
    ${card("💰 Patrimonio total",patrimonioHTML())}
    ${card("📊 Reportes automáticos",`
      <p>Ganancias del día: ${money(totalGains)}</p>
      <p>Estimado semanal: ${money(totalGains*7)}</p>
      <p>Estimado mensual: ${money(totalGains*30)}</p>
      <p>Gastos registrados: ${money(Number(state.moneySpent)+barberExpenseTotal())}</p>
      <p>Clientes morosos: ${mora}</p>
      <p>Mora total: ${money(state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").reduce((s,l)=>s+loanBalance(l),0))}</p>
      <p>Estado: <span class="${totalGains>=0?"green":""}" style="${totalGains<0?"color:var(--danger)":""}">${totalGains>=0?"✅ Positivo":"❌ Negativo"}</span></p>
      <div class="backup-bar">
        ${btn("📤 Exportar backup","exportBackup()","secondary")}
        ${btn("📥 Importar backup","importBackupTrigger()","secondary")}
      </div>
      <input type="file" id="importFile" accept=".json" style="display:none" onchange="importBackup(this)"/>
      ${btn("📊 CSV Préstamos","exportCSV('loans')","secondary")}
      ${btn("📊 CSV Ventas Vaper","exportCSV('vaper')","secondary")}
      ${btn("🖨 Imprimir reporte","printReport()","secondary")}`)}
    ${card("⚙ Configuración de alertas",`
      <label class="muted" style="font-size:12px">Días de atraso para alerta de mora</label>
      ${inp("notifOverdueDays","Días","number",state.notifSettings?.loanOverdueDays||3)}
      ${btn("Guardar alertas","saveNotifSettings()")}
    `)}
    ${card("🔒 Seguridad PIN",`
      <p class="muted" style="margin-bottom:10px">Protege la app con un PIN de 4 dígitos.</p>
      ${inp("newPin","PIN de 4 dígitos","number")}
      ${btn(state.pinEnabled?"Actualizar PIN":"Activar PIN","savePin()")}
      ${state.pinEnabled?btn("Desactivar PIN","disablePin()","danger-btn"):""}`)}
    <h2 class="section-title">Configuración</h2>
    ${card("⚙ Configuración general",`
      ${inp("profileName","Tu nombre","text",state.userName)}
      ${inp("profileBusiness","Nombre del negocio","text",state.businessName)}
      ${inp("profileCapital","Capital en efectivo","number",state.capital)}
      ${inp("usdRateInput","Tasa USD → RD$","number",state.usdRate)}
      ${btn("Guardar configuración","saveProfile()")}
      ${btn("👋 Ver onboarding","openOnboard()","secondary")}
      ${btn("🗑 Reiniciar todos los datos","resetData()","danger-btn")}`)}
    <h2 class="section-title">Historial (últimos 7 días)</h2>
    ${state.history.length?state.history.map(dayHTML).join(""):`<div class="card"><div class="empty">Guarda un cierre nocturno para ver el historial.</div></div>`}`;
}

/* ✅ NUEVO: configuración de alertas */
function saveNotifSettings() {
  const days = Number(document.getElementById("notifOverdueDays")?.value||3);
  state.notifSettings = { ...state.notifSettings, loanOverdueDays: days };
  saveState(); render(); showToast("✅ Configuración de alertas guardada");
}

/* ✅ NUEVO: imprimir reporte completo */
function printReport() {
  const mora = state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora");
  const win = window.open("","_blank","width=800,height=900");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte Cedano Business</title>
  <style>
    body{font-family:Arial,sans-serif;padding:30px;color:#111;max-width:780px;margin:0 auto}
    h1{color:#0a7a34;border-bottom:2px solid #0a7a34;padding-bottom:10px}
    h2{color:#0a7a34;margin-top:24px}
    table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}
    th{background:#0a7a34;color:#fff;padding:8px;text-align:left}
    td{padding:7px 8px;border-bottom:1px solid #ddd}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0}
    .metric{border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center}
    .metric .val{font-size:22px;font-weight:900;color:#0a7a34}
    .metric .lbl{font-size:12px;color:#666;margin-top:4px}
    .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:12px;color:#888;font-size:12px;text-align:center}
    @media print{body{padding:15px}}
  </style></head><body>
  <h1>📊 Reporte Cedano Business</h1>
  <p>Generado el ${new Date().toLocaleDateString("es-DO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
  <p>Empresario: <strong>${esc(state.userName)}</strong> | Negocio: <strong>${esc(state.businessName)}</strong></p>
  <div class="grid">
    <div class="metric"><div class="val">${money(state.capital)}</div><div class="lbl">Capital efectivo</div></div>
    <div class="metric"><div class="val">${money(patrimonyTotal())}</div><div class="lbl">Patrimonio total</div></div>
    <div class="metric"><div class="val">${money(state.moneyToday)}</div><div class="lbl">Generado hoy</div></div>
    <div class="metric"><div class="val">${money(totalLoanBalance())}</div><div class="lbl">Por cobrar (préstamos)</div></div>
    <div class="metric"><div class="val">${money(vaperGain())}</div><div class="lbl">Ganancias vaper</div></div>
    <div class="metric"><div class="val">${money(barberIncome())}</div><div class="lbl">Ingresos barbería</div></div>
  </div>
  <h2>💵 Préstamos activos (${state.loans.length})</h2>
  <table><thead><tr><th>Cliente</th><th>Capital</th><th>Balance</th><th>Estado</th><th>Días atraso</th></tr></thead><tbody>
    ${state.loans.map(l=>`<tr><td>${esc(l.client)}</td><td>${money(l.capital)}</td><td>${money(loanBalance(l))}</td><td>${l.status}</td><td>${calcLateDays(l)}</td></tr>`).join("")}
  </tbody></table>
  ${mora.length?`<h2 style="color:#d42030">🔴 Clientes en mora (${mora.length})</h2>
  <table><thead><tr><th>Cliente</th><th>Balance</th><th>Días</th></tr></thead><tbody>
    ${mora.map(l=>`<tr><td>${esc(l.client)}</td><td>${money(loanBalance(l))}</td><td>${calcLateDays(l)}</td></tr>`).join("")}
  </tbody></table>`:""}
  <h2>☁ Inventario Vaper (${state.vaperInventory.length} productos)</h2>
  <table><thead><tr><th>Producto</th><th>Marca</th><th>Stock</th><th>Costo</th><th>Venta</th><th>Ganancia/ud</th></tr></thead><tbody>
    ${state.vaperInventory.map(p=>`<tr style="${Number(p.quantity)<=Number(p.minStock||3)?"background:#fff3cd":""}"><td>${esc(p.product)}</td><td>${esc(p.brand)}</td><td>${p.quantity}</td><td>${money(p.cost)}</td><td>${money(p.price)}</td><td>${money(Number(p.price)-Number(p.cost))}</td></tr>`).join("")}
  </tbody></table>
  <h2>✂ Barbería</h2>
  <p>Ingresos totales: <strong>${money(barberIncome())}</strong> | Gastos: <strong>${money(barberExpenseTotal())}</strong> | Ganancia neta: <strong>${money(barberIncome()-barberExpenseTotal())}</strong></p>
  <table><thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Precio</th><th>Estado</th></tr></thead><tbody>
    ${state.barberAppointments.map(a=>`<tr><td>${esc(a.client)}</td><td>${esc(a.service)}</td><td>${esc(a.date)}</td><td>${money(a.price)}</td><td>${a.completed?"Completada":"Pendiente"}</td></tr>`).join("")}
  </tbody></table>
  <div class="footer">Cedano Business — Generado automáticamente</div>
  </body></html>`);
  win.document.close();
  setTimeout(()=>win.print(),500);
}

function renderCalendar() {
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const weekDays = ["L","M","M","J","V","S","D"];
  const firstDay = new Date(calendarYear,calendarMonth,1);
  const lastDay = new Date(calendarYear,calendarMonth+1,0);
  let startDow = firstDay.getDay(); if (startDow===0) startDow=7;
  const todayStr = today();
  const eventsByDate = {};
  /* ✅ FIX: usar calendarEvents por ID propio, no mezclar con appointments */
  state.calendarEvents.forEach(e=>{
    if (!eventsByDate[e.date]) eventsByDate[e.date]=[];
    eventsByDate[e.date].push(e);
  });
  /* Agregar citas de barbería sin duplicar con calendarEvents */
  const calEventKeys = new Set(state.calendarEvents.map(e=>e.type+e.date+e.title));
  state.barberAppointments.forEach(a=>{
    const key = "cita"+a.date+a.client;
    if (calEventKeys.has(key)) return;
    if (!eventsByDate[a.date]) eventsByDate[a.date]=[];
    eventsByDate[a.date].push({ type:"cita", title:a.client });
  });
  state.loans.forEach(l=>{
    if (!l.dueDate) return;
    if (!eventsByDate[l.dueDate]) eventsByDate[l.dueDate]=[];
    eventsByDate[l.dueDate].push({ type:"cobro", title:"Vence: "+l.client });
  });
  let cells=[];
  for (let i=1;i<startDow;i++) cells.push({empty:true});
  for (let d=1;d<=lastDay.getDate();d++) {
    const ds=`${calendarYear}-${String(calendarMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({d,ds,events:eventsByDate[ds]||[],isToday:ds===todayStr});
  }
  while(cells.length%7!==0) cells.push({empty:true});
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <button class="small-btn" onclick="prevMonth()" aria-label="Mes anterior">◀</button>
      <strong>${months[calendarMonth]} ${calendarYear}</strong>
      <button class="small-btn" onclick="nextMonth()" aria-label="Mes siguiente">▶</button>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:8px;flex-wrap:wrap">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--neon);margin-right:4px"></span><small>Cobro</small>
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--purple);margin-right:4px"></span><small>Cita</small>
    </div>
    <div class="cal-grid">
      ${weekDays.map(d=>`<div style="text-align:center;font-size:11px;color:var(--muted);font-weight:800;padding-bottom:4px">${d}</div>`).join("")}
      ${cells.map(c=>c.empty?`<div class="cal-day other-month"></div>`:`
        <div class="cal-day${c.isToday?" today":""}">
          <div class="cal-day-num">${c.d}</div>
          ${c.events.slice(0,3).map(e=>`<span class="cal-dot ${e.type||"cobro"}" title="${esc(e.title||"")}"></span>`).join("")}
        </div>`).join("")}
    </div>`;
}

function prevMonth() { calendarMonth--; if(calendarMonth<0){calendarMonth=11;calendarYear--;} render(); }
function nextMonth() { calendarMonth++; if(calendarMonth>11){calendarMonth=0;calendarYear++;} render(); }

function patrimonioHTML() {
  const items=[
    {label:"Efectivo",val:Number(state.capital)},
    {label:"Préstamos (por cobrar)",val:totalLoanBalance()},
    {label:"Inventario Vaper (costo)",val:vaperInventoryValue()},
    {label:"Ganancia Vaper (realizada)",val:vaperGain()},
    {label:"Ahorros",val:Number(state.savings||0)}
  ];
  const total=patrimonyTotal();
  return `
    <div style="margin-bottom:12px">
      <p class="label">Patrimonio Total</p>
      <p style="font-size:28px;font-weight:900;color:var(--neon)">${money(total)}</p>
      <p class="muted" style="font-size:12px">Efectivo + Préstamos + Inventario + Ganancias Vaper + Ahorros</p>
    </div>
    ${items.map(i=>`<div class="pat-row">
      <div class="pat-label">${i.label}</div>
      <div class="pat-bar"><div class="pat-fill" style="width:${total?Math.round(i.val/total*100):0}%"></div></div>
      <div class="pat-val">${money(i.val)}</div>
    </div>`).join("")}
    <div style="margin-top:14px">
      ${inp("capitalInput","Efectivo disponible","number",state.capital)}
      ${inp("savingsInput","Ahorros","number",state.savings)}
      ${btn("Actualizar patrimonio","updatePatrimony()")}
    </div>`;
}

function dayHTML(day) {
  return `<article class="card">
    <h3 class="title">📅 ${esc(day.date)}</h3>
    <p>Completadas: ${day.completed} | Pendientes: ${day.pending}</p>
    <p>Misión: ${esc(day.mission||"Sin misión")}</p>
    <p>Dinero: ${money(day.moneyToday)} | Gastos: ${money(day.moneySpent)}</p>
    <p>Horas productivas: ${day.productiveHours}</p>
    <p class="green">Estado: ${day.status} | Disciplina: ${day.discipline||0}%</p>
    <p class="muted">${esc(day.note||"Sin nota")}</p>
  </article>`;
}

function initCharts() {
  const days = ["L","M","M","J","V","S","D"];
  const months = ["Ene","Feb","Mar","Abr","May","Jun"];
  const tickColor = "#a8b0b7";
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false} },
    scales:{
      x:{grid:{color:"rgba(128,128,128,.1)"},ticks:{color:tickColor}},
      y:{grid:{color:"rgba(128,128,128,.1)"},ticks:{color:tickColor,callback:v=>"RD$"+v.toLocaleString()}}
    }
  };
  const dEl = document.getElementById("chartDaily");
  if (dEl) chartInstances.daily = new Chart(dEl,{type:"bar",data:{labels:days,datasets:[{data:state.dailyRevenue,backgroundColor:"rgba(34,212,104,.75)",borderRadius:6}]},options:chartOpts});
  const mEl = document.getElementById("chartMonthly");
  if (mEl) chartInstances.monthly = new Chart(mEl,{type:"line",data:{labels:months,datasets:[
    {label:"Este mes",data:state.monthlyRevenue,borderColor:"#22d468",backgroundColor:"rgba(34,212,104,.1)",fill:true,tension:.4},
    {label:"Mes anterior",data:state.prevMonthRevenue||[],borderColor:"#4db5ff",backgroundColor:"rgba(77,181,255,.05)",fill:true,tension:.4,borderDash:[5,3]}
  ]},options:{...chartOpts,plugins:{legend:{display:true,labels:{color:tickColor}}}}});
  const bEl = document.getElementById("chartBusiness");
  if (bEl) chartInstances.biz = new Chart(bEl,{type:"doughnut",data:{labels:["Préstamos","Vaper","Barbería"],datasets:[{data:[totalLoanBalance(),vaperGain(),barberIncome()],backgroundColor:["#22d468","#4db5ff","#c084fc"],borderColor:"transparent"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tickColor}}}}});
}

/* =====================================================================
   IMPERIO
   ===================================================================== */
function renderImperio() {
  const total = patrimonyTotal();
  const xpPct = Math.min(100,Math.round(state.xp/nextRankXP()*100));
  const habitsCompleted = state.habits.filter(h=>h.done).length;
  const discipline = Math.round(habitsCompleted/Math.max(1,state.habits.length)*100);
  return `
    <div class="imperio-hero">
      <div class="imperio-rank">${rankIcon()}</div>
      <div class="imperio-name">${esc(state.userName)} — ${rank()}</div>
      <div class="imperio-sub">${esc(state.businessName)}</div>
    </div>
    <div class="card">
      <div class="row" style="margin-bottom:6px"><span class="label">XP: ${state.xp}</span><span class="label" style="text-align:right">Próximo rango: ${nextRankXP()} XP</span></div>
      <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
    </div>
    <section class="grid">
      ${metric("💰","Patrimonio total",money(total),"Actualizado")}
      ${metric("📈","Disciplina hoy",discipline+"%","Hábitos completados")}
      ${metric("⚔","XP total",state.xp,"Puntos")}
      ${metric("🏆","Rango",rank(),"Nivel actual")}
    </section>
    ${card("💰 Patrimonio desglosado",patrimonioHTML())}
    ${card("🎯 Metas anuales",`
      <p>💰 <strong>Patrimonio:</strong> Meta RD$2,000,000 — actual ${money(total)}</p>
      <div class="progress"><span style="width:${Math.min(100,Math.round(total/2000000*100))}%"></span></div>
      <p>💪 <strong>Gym:</strong> Streak de ${state.habitStats.daysTraining} días</p>
      <p>🏢 <strong>Negocios:</strong> ${state.loans.length} préstamos | ${state.vaperInventory.length} productos | ${state.barberClients.length} clientes barbería</p>`)}
    ${card("📊 Rendimiento por negocio",`
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
        ${[["💰 Préstamos","#22d468",totalLoanBalance(),2000000],["☁ Vaper","#4db5ff",vaperGain(),50000],["✂ Barbería","#c084fc",barberIncome(),30000]].map(([n,c,v,max])=>`
          <div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${n}</span><span style="color:${c};font-weight:800">${money(v)}</span></div>
          <div class="progress"><span style="width:${Math.min(100,Math.round(v/max*100))}%;background:${c}"></span></div></div>`).join("")}
      </div>`)}
    <h2 class="section-title">🏆 Logros</h2>
    ${state.achievements.map(a=>`<div class="achievement${a.unlocked?" unlocked":" locked"}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-info"><strong>${esc(a.title)}</strong><small>${esc(a.desc)}</small></div>
      ${a.unlocked?'<span class="pill gold">✔ Desbloqueado</span>':'<span class="pill">🔒 Bloqueado</span>'}
    </div>`).join("")}
    ${card("🏆 Sistema de niveles",`
      <p class="pill">🪖 Recluta — 0 XP</p><p class="pill">🏅 Sargento — 600 XP</p>
      <p class="pill warn">🎖 Mayor — 1,200 XP</p><p class="pill blue">⭐ Capitán — 2,000 XP</p>
      <p class="pill gold">⭐⭐ Coronel — 3,000 XP</p><p class="pill green">⭐⭐⭐ General — 5,000 XP</p>`)}`;
}

/* =====================================================================
   EDIT MODAL
   ===================================================================== */
function openEdit(type, id) {
  editingType=type; editingId=id;
  const m=document.getElementById("editModal");
  const h=document.getElementById("editTitle");
  const c=document.getElementById("editContent");
  if (!m) return;
  if (type==="task") {
    const t=state.tasks.find(x=>x.id===id); if (!t) return;
    h.textContent="✏ Editar tarea";
    c.innerHTML=`<div class="edit-form">
      <label>Texto</label>${inp("eText","Texto","text",t.text)}
      <label>Tipo</label>${sel("eType",["Diario","Semanal","Mensual"],t.type)}
      <label>Prioridad</label>${sel("ePriority",["Baja","Media","Alta","Urgente"],t.priority)}
      <label>Fecha</label>${inp("eDate","Fecha","text",t.date)}
      <label>Hora</label>${inp("eTime","Hora","text",t.time)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if (type==="loan") {
    const l=state.loans.find(x=>x.id===id); if (!l) return;
    h.textContent="✏ Editar préstamo";
    c.innerHTML=`<div class="edit-form">
      <label>Cliente</label>${inp("eClient","Cliente","text",l.client)}
      <label>Capital</label>${inp("eCapital","Capital","number",l.capital)}
      <label>Interés %</label>${inp("eInterest","Interés","number",l.interest)}
      <label>Fecha inicio</label>${inp("eStart","Fecha inicio","text",l.startDate)}
      <label>Fecha vencimiento</label>${inp("eDue","Fecha vencimiento","text",l.dueDate)}
      <label>Frecuencia</label>${sel("eFreq",["Diario","Semanal","Quincenal","Mensual"],l.frequency)}
      <label>Pagado</label>${inp("ePaid","Monto pagado","number",l.paid)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if (type==="loanClient") {
    const c2=state.loanClients.find(x=>x.id===id); if (!c2) return;
    h.textContent="✏ Editar cliente";
    c.innerHTML=`<div class="edit-form">
      <label>Nombre</label>${inp("eName","Nombre","text",c2.name)}
      <label>Cédula</label>${inp("eCedula","Cédula","text",c2.cedula)}
      <label>Teléfono</label>${inp("ePhone","Teléfono","text",c2.phone)}
      <label>Dirección</label>${inp("eAddress","Dirección","text",c2.address)}
      <label>Referencia</label>${inp("eRef","Referencia","text",c2.reference)}
      <label>Notas</label>${ta("eNotes","Notas",c2.notes)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if (type==="vaperProduct") {
    const p=state.vaperInventory.find(x=>x.id===id); if (!p) return;
    h.textContent="✏ Editar producto";
    c.innerHTML=`<div class="edit-form">
      <label>Producto</label>${inp("eProd","Producto","text",p.product)}
      <label>Marca</label>${inp("eBrand","Marca","text",p.brand)}
      <label>Sabor</label>${inp("eFlavor","Sabor","text",p.flavor)}
      <label>Cantidad</label>${inp("eQty","Cantidad","number",p.quantity)}
      <label>Costo</label>${inp("eCost","Costo","number",p.cost)}
      <label>Precio</label>${inp("ePrice","Precio","number",p.price)}
      <label>Stock mínimo</label>${inp("eMinStock","Stock mínimo","number",p.minStock||3)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if (type==="barberApt") {
    const a=state.barberAppointments.find(x=>x.id===id); if (!a) return;
    h.textContent="✏ Editar cita";
    c.innerHTML=`<div class="edit-form">
      <label>Cliente</label>${inp("eClient","Cliente","text",a.client)}
      <label>Servicio</label>${inp("eService","Servicio","text",a.service)}
      <label>Fecha</label>${inp("eDate","Fecha","text",a.date)}
      <label>Hora</label>${inp("eTime","Hora","text",a.time)}
      <label>Precio</label>${inp("ePrice","Precio","number",a.price)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if (type==="barberClient") {
    const bc=state.barberClients.find(x=>x.id===id); if (!bc) return;
    h.textContent="✏ Editar cliente barbería";
    c.innerHTML=`<div class="edit-form">
      <label>Nombre</label>${inp("eBcName","Nombre","text",bc.name)}
      <label>Teléfono</label>${inp("eBcPhone","Teléfono","text",bc.phone)}
      <label>Historial</label>${ta("eBcHistory","Historial",bc.history)}
      <label>Notas del estilo</label>${ta("eBcCutNotes","Notas del corte",bc.cutNotes||"")}
      <label>Frecuencia</label>${inp("eBcFreq","Frecuencia","text",bc.frequency)}
      <label>Cumpleaños</label>${inp("eBcBday","Cumpleaños","text",bc.birthday)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  }
  openModal("editModal");
}

function closeEditModal() { closeModal("editModal"); editingId=null; editingType=null; }

function saveEdit() {
  const g = id=>{ const el=document.getElementById(id); return el?el.value:""; };
  if (editingType==="task") {
    state.tasks=state.tasks.map(t=>t.id!==editingId?t:{...t,text:g("eText"),type:g("eType"),priority:g("ePriority"),date:g("eDate"),time:g("eTime")});
  } else if (editingType==="loan") {
    state.loans=state.loans.map(l=>l.id!==editingId?l:{...l,client:g("eClient"),capital:Number(g("eCapital")),interest:Number(g("eInterest")),startDate:g("eStart"),dueDate:g("eDue"),frequency:g("eFreq"),paid:Number(g("ePaid"))});
  } else if (editingType==="loanClient") {
    state.loanClients=state.loanClients.map(c=>c.id!==editingId?c:{...c,name:g("eName"),cedula:g("eCedula"),phone:g("ePhone"),address:g("eAddress"),reference:g("eRef"),notes:g("eNotes")});
  } else if (editingType==="vaperProduct") {
    state.vaperInventory=state.vaperInventory.map(p=>p.id!==editingId?p:{...p,product:g("eProd"),brand:g("eBrand"),flavor:g("eFlavor"),quantity:Number(g("eQty")),cost:Number(g("eCost")),price:Number(g("ePrice")),minStock:Number(g("eMinStock")||3)});
  } else if (editingType==="barberApt") {
    state.barberAppointments=state.barberAppointments.map(a=>a.id!==editingId?a:{...a,client:g("eClient"),service:g("eService"),date:g("eDate"),time:g("eTime"),price:Number(g("ePrice"))});
  } else if (editingType==="barberClient") {
    state.barberClients=state.barberClients.map(c=>c.id!==editingId?c:{...c,name:g("eBcName"),phone:g("eBcPhone"),history:g("eBcHistory"),cutNotes:g("eBcCutNotes"),frequency:g("eBcFreq"),birthday:g("eBcBday")});
  }
  saveState(); closeEditModal(); render();
  showToast("✅ Cambios guardados");
}

/* =====================================================================
   DELETE
   ===================================================================== */
function deleteRecord(type,id) {
  if (!confirm("¿Eliminar este registro?")) return;
  if (type==="task") state.tasks=state.tasks.filter(x=>x.id!==id);
  else if (type==="loan") state.loans=state.loans.filter(x=>x.id!==id);
  else if (type==="loanClient") state.loanClients=state.loanClients.filter(x=>x.id!==id);
  else if (type==="vaperProduct") state.vaperInventory=state.vaperInventory.filter(x=>x.id!==id);
  else if (type==="vaperClient") state.vaperClients=state.vaperClients.filter(x=>x.id!==id);
  else if (type==="barberApt") state.barberAppointments=state.barberAppointments.filter(x=>x.id!==id);
  else if (type==="barberClient") state.barberClients=state.barberClients.filter(x=>x.id!==id);
  else if (type==="barberService") state.barberServices=state.barberServices.filter(x=>x.id!==id);
  else if (type==="employee") state.barberEmployees=state.barberEmployees.filter(x=>x.id!==id);
  saveState(); render();
}
function deleteHabit(id) { state.habits=state.habits.filter(h=>h.id!==id); saveState(); render(); }

/* =====================================================================
   BACKUP & CSV
   ===================================================================== */
function exportBackup() {
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=`cedano-backup-${today()}.json`; a.click();
}
function importBackupTrigger() { document.getElementById("importFile").click(); }
function importBackup(input) {
  const file=input.files[0]; if (!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try {
      const data=JSON.parse(e.target.result);
      state={...initialState,...data}; saveState(); render();
      showToast("✅ Backup restaurado");
    } catch { showToast("❌ Archivo inválido","err"); }
  };
  reader.readAsText(file);
}
function exportCSV(type) {
  let rows=[]; let filename="";
  if (type==="loans") {
    filename=`cedano-prestamos-${today()}.csv`;
    rows=[["Cliente","Capital","Interés","Frecuencia","Fecha inicio","Fecha venc.","Pagado","Balance","Estado","Días atraso"]];
    state.loans.forEach(l=>rows.push([l.client,l.capital,l.interest+"%",l.frequency,l.startDate||"",l.dueDate||"",l.paid,loanBalance(l),l.status,calcLateDays(l)]));
  } else if (type==="vaper") {
    filename=`cedano-ventas-vaper-${today()}.csv`;
    rows=[["Cliente","Producto","Cantidad","Fecha","Método","Ganancia"]];
    state.vaperSales.forEach(s=>rows.push([s.client,s.product,s.quantity,s.date,s.method,s.gain]));
  }
  const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
}

/* =====================================================================
   PIN
   ===================================================================== */
function savePin() {
  const p=document.getElementById("newPin")?.value;
  if (!p||p.length!==4||isNaN(p)) { showToast("❌ Ingresa exactamente 4 dígitos","err"); return; }
  state.pinEnabled=true; state.pin=p; pinUnlocked=true;
  saveState(); render(); showToast("✅ PIN activado");
}
function disablePin() {
  state.pinEnabled=false; state.pin=""; pinUnlocked=true;
  saveState(); render(); showToast("PIN desactivado");
}

/* =====================================================================
   ACCIONES
   ===================================================================== */
function saveMission() {
  const v=document.getElementById("missionInput")?.value.trim();
  if (!v) { showToast("❌ Escribe una misión primero","err"); return; }
  setState({mission:v}); showToast("✅ Misión guardada");
}
function completeMission() { setState({xp:state.xp+50}); showToast("⚔ +50 XP — ¡Misión completada!"); }
function saveMoney() {
  setState({moneyGoal:Number(document.getElementById("goalInput")?.value||state.moneyGoal),moneyToday:Number(document.getElementById("todayMoneyInput")?.value||state.moneyToday)});
  showToast("✅ Meta actualizada");
}
function updatePatrimony() {
  setState({capital:Number(document.getElementById("capitalInput")?.value||state.capital),savings:Number(document.getElementById("savingsInput")?.value||state.savings)});
  showToast("✅ Patrimonio actualizado");
}
function saveProfile() {
  setState({userName:document.getElementById("profileName")?.value||state.userName,businessName:document.getElementById("profileBusiness")?.value||state.businessName,capital:Number(document.getElementById("profileCapital")?.value||state.capital),usdRate:Number(document.getElementById("usdRateInput")?.value||state.usdRate)});
  showToast("✅ Configuración guardada");
}

function addHabit() {
  const t=document.getElementById("newHabitInput")?.value.trim(); if (!t) return;
  state.habits.push({id:uid(),text:t,done:false,streak:0});
  saveState(); render(); showToast("✅ Hábito agregado");
}
function toggleHabit(id) {
  state.habits=state.habits.map(h=>{
    if (h.id!==id) return h;
    const done=!h.done; if (done) state.xp+=5;
    return {...h,done,streak:done?h.streak+1:Math.max(0,h.streak-1)};
  }); saveState(); render();
}
function addTask() {
  const text=document.getElementById("taskText")?.value.trim(); if (!text) return;
  state.tasks.push({id:uid(),text,type:document.getElementById("taskType")?.value||"Diario",date:document.getElementById("taskDate")?.value||"",time:document.getElementById("taskTime")?.value||"",priority:document.getElementById("taskPriority")?.value||"Media",done:false});
  saveState(); render(); showToast("✅ Tarea agregada");
}
function toggleTask(id) {
  state.tasks=state.tasks.map(t=>{if(t.id!==id) return t; const done=!t.done; if(done) state.xp+=10; return{...t,done};});
  saveState(); render();
}
function saveTomorrowPlan() {
  const task=document.getElementById("tomorrowTask")?.value.trim();
  const reminder=document.getElementById("tomorrowReminder")?.value.trim();
  state.tomorrow.mission=document.getElementById("tomorrowMission")?.value||"";
  state.tomorrow.moneyGoal=document.getElementById("tomorrowGoal")?.value||"";
  if (task) state.tomorrow.tasks.push({id:uid(),text:task,done:false});
  if (reminder) state.tomorrow.reminders.push({id:uid(),text:reminder});
  saveState(); render(); showToast("✅ Plan de mañana guardado");
}
function addLoanClient() {
  const name=document.getElementById("clientName")?.value.trim(); if (!name) return;
  state.loanClients.push({id:uid(),name,photo:"",cedula:document.getElementById("clientCedula")?.value||"",phone:document.getElementById("clientPhone")?.value||"",address:document.getElementById("clientAddress")?.value||"",reference:document.getElementById("clientReference")?.value||"",notes:document.getElementById("clientNotes")?.value||"",lastVisit:today()});
  saveState(); render(); showToast("✅ Cliente agregado");
}
function addContact() {
  const name=document.getElementById("contactName")?.value.trim(); if (!name) return;
  state.contacts.push({id:uid(),name,phone:document.getElementById("contactPhone")?.value||"",address:document.getElementById("contactAddress")?.value||"",source:document.getElementById("contactSource")?.value||"",note:document.getElementById("contactNote")?.value||"",priority:document.getElementById("contactPriority")?.value||"Media",status:"Pendiente"});
  saveState(); render();
}
function updateContactStatus(id) { setContactStatus(id,document.getElementById("status-"+id)?.value); }
function setContactStatus(id,status) { state.contacts=state.contacts.map(c=>c.id===id?{...c,status}:c); saveState(); render(); }
function callContact(id) { const c=state.contacts.find(c=>c.id===id); if(c) alert(`Llamar a ${c.name}: ${c.phone||"Sin teléfono"}`); }
function deleteContact(id) { state.contacts=state.contacts.filter(c=>c.id!==id); saveState(); render(); }

function addLoan() {
  const client=document.getElementById("loanClient")?.value.trim();
  const capital=Number(document.getElementById("loanCapital")?.value);
  if (!client||!capital) { showToast("❌ Completa cliente y capital","err"); return; }
  let capitalRD=capital; if (loanCurrency==="USD") capitalRD=capital*Number(state.usdRate||59);
  state.loans.push({id:uid(),client,capital:capitalRD,interest:Number(document.getElementById("loanInterest")?.value||0),currency:loanCurrency,startDate:document.getElementById("loanStartDate")?.value||today(),dueDate:document.getElementById("loanDueDate")?.value||"",frequency:document.getElementById("loanFrequency")?.value||"Semanal",paid:0,lateDays:0,status:"Al día"});
  saveState(); render(); showToast("✅ Préstamo registrado");
}
function updateLoanStatus(id) {
  const status=document.getElementById("loanstatus-"+id)?.value;
  if (status==="Cancelado") { archiveLoan(id); return; }
  state.loans=state.loans.map(l=>l.id===id?{...l,status}:l);
  saveState(); render();
}
function addPayment() {
  const client=document.getElementById("paymentLoan")?.value.trim();
  const amount=Number(document.getElementById("paymentAmount")?.value);
  if (!client||!amount) { showToast("❌ Completa cliente y monto","err"); return; }
  const loan=state.loans.find(l=>l.client.toLowerCase()===client.toLowerCase());
  if (!loan) { showToast("❌ Cliente no encontrado en préstamos","err"); return; }
  const balance=loanBalance(loan);
  if (amount>balance) { showToast(`❌ El pago (${money(amount)}) excede el balance (${money(balance)})`, "err"); return; }
  state.payments.push({id:uid(),client,amount,date:document.getElementById("paymentDate")?.value||today()});
  state.loans=state.loans.map(l=>l.client.toLowerCase()===client.toLowerCase()?{...l,paid:Number(l.paid||0)+amount}:l);
  state.moneyToday+=amount;
  /* Si el balance queda en 0, archivar automáticamente */
  const updatedBalance=loanBalance({...loan,paid:Number(loan.paid||0)+amount});
  if (updatedBalance<=0) {
    setTimeout(()=>{
      if (confirm(`✅ ${client} pagó su préstamo completo. ¿Archivar este préstamo?`)) archiveLoan(loan.id);
    },300);
  }
  saveState(); render(); showToast(`✅ Pago de ${money(amount)} registrado`);
}

function addVaperProduct() {
  const product=document.getElementById("vpProduct")?.value.trim(); if (!product) return;
  state.vaperInventory.push({id:uid(),product,brand:document.getElementById("vpBrand")?.value||"",model:document.getElementById("vpModel")?.value||"",type:document.getElementById("vpType")?.value||"Desechable",flavor:document.getElementById("vpFlavor")?.value||"",quantity:Number(document.getElementById("vpQty")?.value||0),cost:Number(document.getElementById("vpCost")?.value||0),price:Number(document.getElementById("vpPrice")?.value||0),minStock:Number(document.getElementById("vpMinStock")?.value||3)});
  saveState(); render(); showToast("✅ Producto agregado");
}
function addVaperSale() {
  const productName=document.getElementById("saleProduct")?.value.trim(); if (!productName) return;
  const item=state.vaperInventory.find(p=>p.product.toLowerCase()===productName.toLowerCase());
  const qty=Number(document.getElementById("saleQty")?.value||1);
  if (item&&Number(item.quantity)<qty) { showToast("❌ Stock insuficiente","err"); return; }
  const gain=item?(Number(item.price)-Number(item.cost))*qty:0;
  const income=item?Number(item.price)*qty:0;
  state.vaperSales.push({id:uid(),client:document.getElementById("saleClient")?.value||"",product:productName,quantity:qty,date:document.getElementById("saleDate")?.value||today(),method:document.getElementById("saleMethod")?.value||"Efectivo",gain});
  if (item) { item.quantity=Math.max(0,Number(item.quantity)-qty); state.moneyToday+=income; }
  /* Verificar logro primera venta */
  if (state.vaperSales.length===1) {
    state.achievements=state.achievements.map(a=>a.id==="a1"?{...a,unlocked:true}:a);
    showToast("🥉 ¡Logro desbloqueado: Primera venta!");
  }
  saveState(); render();
  if (!state.vaperSales.length!==1) showToast(`✅ Venta registrada — ganancia ${money(gain)}`);
}
function addVaperClient() {
  const name=document.getElementById("vaperClientName")?.value.trim(); if (!name) return;
  state.vaperClients.push({id:uid(),name,phone:document.getElementById("vaperClientPhone")?.value||"",history:document.getElementById("vaperClientHistory")?.value||"",totalSpent:0});
  saveState(); render();
}
function addBarberAppointment() {
  const client=document.getElementById("barberClient")?.value.trim(); if (!client) return;
  const price=Number(document.getElementById("barberPrice")?.value||0);
  const empName=document.getElementById("barberEmployeeSel")?.value||"";
  const emp=state.barberEmployees.find(e=>e.name===empName);
  state.barberAppointments.push({
    id:uid(),client,
    phone:document.getElementById("barberPhone")?.value||"",
    service:document.getElementById("barberService")?.value||"",
    date:document.getElementById("barberDate")?.value||today(),
    time:document.getElementById("barberTime")?.value||"",
    price,
    reminder:document.getElementById("barberReminder")?.value==="Sí",
    completed:false,
    employeeId:emp?.id||""
  });
  saveState(); render();
  showToast("✅ Cita agendada — marca como completada cuando ocurra");
}
function addBarberClient() {
  const name=document.getElementById("barberClientName")?.value.trim(); if (!name) return;
  state.barberClients.push({id:uid(),name,phone:document.getElementById("barberClientPhone")?.value||"",history:document.getElementById("barberClientHistory")?.value||"",cutNotes:document.getElementById("barberClientCutNotes")?.value||"",frequency:document.getElementById("barberClientFrequency")?.value||"",birthday:document.getElementById("barberClientBirthday")?.value||""});
  saveState(); render();
}
function addBarberService() {
  const name=document.getElementById("serviceName")?.value.trim(); if (!name) return;
  state.barberServices.push({id:uid(),name,price:Number(document.getElementById("servicePrice")?.value||0),duration:document.getElementById("serviceDuration")?.value||""});
  saveState(); render();
}
function addEmployee() {
  const name=document.getElementById("employeeName")?.value.trim(); if (!name) return;
  state.barberEmployees.push({id:uid(),name,percent:Number(document.getElementById("employeePercent")?.value||0),schedule:document.getElementById("employeeSchedule")?.value||"",paid:Number(document.getElementById("employeePaid")?.value||0)});
  saveState(); render();
}
function addBarberExpense() {
  const amount=Number(document.getElementById("barberExpense")?.value||0); if (!amount) return;
  const desc=document.getElementById("barberExpenseDesc")?.value||today();
  state.barberExpenses.push({id:uid(),amount,desc,date:today()});
  state.moneySpent+=amount;
  saveState(); render(); showToast(`💸 Gasto de ${money(amount)} registrado`);
}

/* =====================================================================
   CIERRE NOCTURNO
   ===================================================================== */
function openNightSummary() {
  const reached=state.moneyToday>=state.moneyGoal;
  const items=["¿Cobré todo lo pendiente?","¿Entrené hoy?","¿Estudié Derecho?","¿Revisé el inventario?","¿Dormiré temprano?"];
  document.getElementById("nightContent").innerHTML=`
    <div class="summary-box" style="margin-bottom:12px">
      <p>Tareas completadas: <strong>${completedTasks()}</strong></p>
      <p>Tareas pendientes: <strong>${pendingTasks()}</strong></p>
      <p>Dinero generado: <strong>${money(state.moneyToday)}</strong></p>
      <p>Meta alcanzada: <strong ${reached?'class="green"':'style="color:var(--warn)"'}>${reached?"✅ Sí":"❌ No"}</strong></p>
    </div>
    <h3 style="margin-bottom:10px;color:var(--neon)">Checklist nocturno</h3>
    ${items.map((item,i)=>`<div class="habit-item" id="nc${i}" onclick="toggleNC(${i})" role="checkbox" aria-checked="false" tabindex="0"><div class="habit-check" id="nch${i}"></div><span>${item}</span></div>`).join("")}
    ${inp("nightHours","Horas productivas hoy","number")}
    ${ta("nightNote","Nota personal del día")}
    ${btn("💾 Guardar cierre","saveNightSummary()")}
    ${btn("✕ Cerrar","closeNightSummary()","secondary")}`;
  openModal("nightModal");
}
function toggleNC(i) {
  const item=document.getElementById("nc"+i); const check=document.getElementById("nch"+i);
  const done=!item.classList.contains("done");
  item.classList.toggle("done",done); check.textContent=done?"✓":"";
  item.setAttribute("aria-checked",done);
}
function closeNightSummary() { closeModal("nightModal"); }
function saveNightSummary() {
  const reached=state.moneyToday>=state.moneyGoal;
  const completed=completedTasks(); const pending=pendingTasks();
  const checks=["nc0","nc1","nc2","nc3","nc4"].filter(id=>document.getElementById(id)?.classList.contains("done")).length;
  const discipline=Math.round(checks/5*100);
  const day={date:today(),completed,pending,mission:state.mission,moneyToday:state.moneyToday,moneySpent:state.moneySpent,productiveHours:Number(document.getElementById("nightHours")?.value||0),note:document.getElementById("nightNote")?.value||"",discipline,status:reached&&pending===0?"Excelente":reached?"Bueno":pending<=2?"Regular":"Malo"};
  state.history=[day,...state.history.filter(h=>h.date!==day.date)].slice(0,7);
  state.xp+=completed*10+checks*5;
  state.disciplineScore=discipline;
  state.dailyRevenue=[...state.dailyRevenue.slice(1),state.moneyToday];
  /* Actualizar prevMonthRevenue al cerrar el mes */
  const d=new Date();
  if (d.getDate()===1) { state.prevMonthRevenue=[...state.monthlyRevenue]; state.monthlyRevenue=[0,0,0,0,0,0]; }
  saveState(); closeNightSummary(); go("Reportes");
  showToast("🌙 Cierre nocturno guardado");
}
function closeDetail() { closeModal("detailModal"); }

/* =====================================================================
   IA
   ===================================================================== */
function openAI() { openModal("aiModal"); }
function closeAI() { closeModal("aiModal"); }
function askAI(q) { document.getElementById("aiInput").value=q; runAI(); }

async function runAI() {
  const q=(document.getElementById("aiInput")?.value||"").trim(); if (!q) return;
  const res=document.getElementById("aiResponse");
  res.style.display="block"; res.innerHTML=`<span class="muted">🧠 Analizando tu negocio...</span>`;
  const lowStock=state.vaperInventory.filter(p=>Number(p.quantity)<=Number(p.minStock||3)).map(p=>p.product).join(", ")||"Ninguno";
  const contexto=`Eres el asistente financiero personal de ${state.userName}, dueño de Cedano Business.
Datos actuales del negocio (${today()}):
- Capital en efectivo: ${money(state.capital)}
- Ahorros: ${money(state.savings)}
- Dinero generado hoy: ${money(state.moneyToday)} / Meta: ${money(state.moneyGoal)} (${progress()}%)
- Patrimonio total: ${money(patrimonyTotal())}
- Préstamos activos: ${state.loans.length} (balance por cobrar: ${money(totalLoanBalance())})
- Clientes en mora: ${state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").map(l=>l.client+" ("+calcLateDays(l)+" días)").join(", ")||"Ninguno"}
- Préstamos archivados (cancelados): ${state.archivedLoans?.length||0}
- Pagos recibidos: ${state.payments.length} (total: ${money(state.payments.reduce((s,p)=>s+Number(p.amount||0),0))})
- Ganancia vaper: ${money(vaperGain())} en ${state.vaperSales.length} ventas
- Inventario vaper: ${state.vaperInventory.length} productos | Stock bajo: ${lowStock}
- Ingresos barbería (completadas): ${money(barberIncome())} | Gastos: ${money(barberExpenseTotal())} | Neto: ${money(barberIncome()-barberExpenseTotal())}
- Tareas completadas hoy: ${completedTasks()} de ${state.tasks.length}
- XP: ${state.xp} — Rango: ${rank()}
- Hábitos completados: ${state.habits.filter(h=>h.done).length} de ${state.habits.length}
- Ganancias últimos 7 días: ${state.dailyRevenue.join(", ")} (RD$)
Responde en español, de forma concisa y directa. Usa números reales. Sé proactivo con alertas y recomendaciones.`.trim();
  try {
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:contexto,messages:[{role:"user",content:q}]})
    });
    const data=await response.json();
    const text=data.content?.map(b=>b.text||"").join("")||"Sin respuesta.";
    res.innerHTML=text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
  } catch { res.innerHTML=`<span style="color:var(--danger)">❌ Error al conectar con la IA.</span>`; }
}

function resetData() {
  if (!confirm("¿Seguro que quieres reiniciar todos los datos? Esta acción no se puede deshacer.")) return;
  localStorage.removeItem(KEY);
  state=structuredClone(initialState);
  pinUnlocked=true; saveState(); render();
}

/* =====================================================================
   SKELETON CSS
   ===================================================================== */
(function injectSkeletonStyle() {
  const style=document.createElement("style");
  style.textContent=`
    @keyframes shimmer{0%{opacity:.4}50%{opacity:.8}100%{opacity:.4}}
    @keyframes fadeInUp{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
    .skeleton-loader{padding:16px}
    .skel-topbar{height:48px;background:var(--card,#1a1f2e);border-radius:8px;margin-bottom:16px;animation:shimmer 1.4s infinite}
    .skel-hero{height:80px;background:var(--card,#1a1f2e);border-radius:8px;margin-bottom:12px;animation:shimmer 1.4s infinite .1s}
    .skel-row{display:flex;gap:10px;margin-bottom:12px}
    .skel-card{flex:1;height:70px;background:var(--card,#1a1f2e);border-radius:8px;animation:shimmer 1.4s infinite .2s}
    .skel-block{height:100px;background:var(--card,#1a1f2e);border-radius:8px;margin-bottom:10px;animation:shimmer 1.4s infinite .3s}
    .skel-block.short{height:60px}
  `;
  document.head.appendChild(style);
})();

/* =====================================================================
   CLOCK & INIT
   ===================================================================== */
setInterval(()=>{
  const c=document.getElementById("clock");
  if (c) c.textContent=new Date().toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"});
},1000);

document.body.classList.toggle("light-mode",!darkMode);
render();