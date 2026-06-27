/* =====================================================================
   CEDANO BUSINESS v6.0 — app.js COMPLETO Y CORREGIDO
   ===================================================================== */

const KEY = "CEDANO_V6";
const $ = s => document.querySelector(s);

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function money(v, currency) {
  const n = Number(v || 0);
  const cur = currency || "RD$";
  if (cur === "USD") return `US$${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  return `RD$${n.toLocaleString("es-DO")}`;
}
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function inp(id, ph, type="text", val="") { return `<input id="${id}" type="${type}" placeholder="${ph}" value="${esc(val)}"/>`; }
function sel(id, opts, val="") { return `<select id="${id}">${opts.map(o=>`<option${o===val?" selected":""}>${esc(o)}</option>`).join("")}</select>`; }
function ta(id, ph, val="") { return `<textarea id="${id}" placeholder="${ph}">${esc(val)}</textarea>`; }
function btn(label, action, cls="") { return `<button class="btn ${cls}" onclick="${action}">${label}</button>`; }
function sm(label, action, cls="") { return `<button class="small-btn ${cls}" onclick="${action}">${label}</button>`; }
function card(title, body) { return `<article class="card">${title?`<span class="title">${title}</span>`:""}${body}</article>`; }
function metric(icon, title, val, sub, cls="") {
  return `<article class="card metric${cls?" "+cls:""}"><div class="title">${icon} ${title}</div><div class="value">${esc(String(val))}</div><div class="muted">${sub}</div></article>`;
}

/* ── Toast ── */
function showToast(msg, type="ok") {
  const existing = document.getElementById("cedano-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "cedano-toast";
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:86px;left:50%;transform:translateX(-50%);
    background:${type==="ok"?"#22d468":"#ff4d5e"};
    color:${type==="ok"?"#000":"#fff"};font-weight:700;font-size:13px;
    padding:9px 20px;border-radius:22px;z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.35);
    animation:fadeInUp .2s ease;pointer-events:none;
    white-space:nowrap;max-width:90vw;text-align:center;`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function hideSkeleton() {
  const sk = document.getElementById("skeletonLoader");
  if (sk) sk.remove();
}

/* =====================================================================
   ESTADO INICIAL v6
   ===================================================================== */
const initialState = {
  userName: "Royer", businessName: "Cedano Business",
  capital: 1250000, savings: 50000,
  mission: "Conseguir 3 clientes", moneyGoal: 10000, moneyToday: 0, moneySpent: 0,
  xp: 1250, productiveHours: 0, dailyNote: "", usdRate: 59,
  lastOpenDate: "", lastBackupDate: "", lastWeeklyReview: "",
  focusMode: false, quickNotes: [],
  habits: [
    { id: uid(), text: "Levantarme temprano", done: false, streak: 0, lastDone: "" },
    { id: uid(), text: "Gym", done: false, streak: 3, lastDone: "" },
    { id: uid(), text: "Estudiar Derecho", done: false, streak: 1, lastDone: "" },
    { id: uid(), text: "Revisar negocios", done: false, streak: 5, lastDone: "" },
    { id: uid(), text: "Dormir temprano", done: false, streak: 2, lastDone: "" }
  ],
  habitStats: { daysTraining: 3, daysMeta: 5, avgSleep: 6.5 },
  tasks: [
    { id: uid(), text: "Cobrar a Pedro", type: "Diario", priority: "Alta", date: today(), time: "10:00 AM", done: false, completedAt: "" },
    { id: uid(), text: "Comprar líquido para vapers", type: "Diario", priority: "Media", date: today(), time: "2:00 PM", done: false, completedAt: "" },
    { id: uid(), text: "Ir al gimnasio", type: "Diario", priority: "Baja", date: today(), time: "7:00 PM", done: false, completedAt: "" },
    { id: uid(), text: "Revisar gastos de la barbería", type: "Semanal", priority: "Urgente", date: today(), time: "8:30 PM", done: false, completedAt: "" }
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
  archivedLoans: [], payments: [],
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
  billsToPay: [
    { id: uid(), name: "Alquiler local barbería", amount: 8000, currency: "RD$", dueDate: "", category: "Alquiler", recurring: true, paid: false, paidDate: "" },
    { id: uid(), name: "Electricidad", amount: 2500, currency: "RD$", dueDate: "", category: "Servicios", recurring: true, paid: false, paidDate: "" }
  ],
  personalExpenses: [],
  personalBudgets: {
    "Comida": 5000, "Transporte": 2000, "Entretenimiento": 1500,
    "Ropa": 2000, "Salud": 1000, "Educación": 1500, "Otros": 1000
  },
  objectives: [
    { id: uid(), name: "Fondo de emergencia", target: 100000, current: 50000, deadline: "", color: "#22d468", icon: "🛡" },
    { id: uid(), name: "Comprar equipo barbería", target: 50000, current: 15000, deadline: "", color: "#4db5ff", icon: "✂" },
    { id: uid(), name: "Ahorros para viaje", target: 30000, current: 5000, deadline: "", color: "#c084fc", icon: "✈" }
  ],
  cashFlowEntries: [],
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
  dailyRevenue: [0,0,0,0,0,0,0],
  monthlyRevenue: [32000, 45000, 51000, 38000, 67000, 72000],
  prevMonthRevenue: [28000, 40000, 46000, 34000, 60000, 65000],
  lawExams: [], disciplineScore: 72, pinEnabled: false, pin: "",
  onboardingDone: false,
  notifSettings: { loanOverdueDays: 3, lowStockDefault: 3, pushEnabled: false }
};

/* ── Variables globales ── */
let state = loadState();
let currentTab = "Inicio";
let chartInstances = {};
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let pinUnlocked = !state.pinEnabled;
let darkMode = localStorage.getItem("CEDANO_THEME") !== "light";
let editingId = null;
let editingType = null;
let focusModeActive = false;
let loanCurrency = "RD$";
let subTabs = {};

/* ── Historial IA persistente ── */
let aiHistory = [];
function loadAIHistory() {
  try { aiHistory = JSON.parse(localStorage.getItem("CEDANO_AI_HIST") || "[]"); } catch { aiHistory = []; }
}
function saveAIHistory() {
  try { localStorage.setItem("CEDANO_AI_HIST", JSON.stringify(aiHistory.slice(-40))); } catch {}
}
loadAIHistory();

/* =====================================================================
   CARGA Y GUARDADO DE ESTADO
   ===================================================================== */
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    const oldV5 = JSON.parse(localStorage.getItem("CEDANO_V5") || "null");
    const base = saved || oldV5 || structuredClone(initialState);

    if (!base.archivedLoans) base.archivedLoans = [];
    if (!base.prevMonthRevenue) base.prevMonthRevenue = [28000,40000,46000,34000,60000,65000];
    if (!base.notifSettings) base.notifSettings = { loanOverdueDays: 3, lowStockDefault: 3, pushEnabled: false };
    if (base.notifSettings && base.notifSettings.pushEnabled === undefined) base.notifSettings.pushEnabled = false;
    if (base.onboardingDone === undefined) base.onboardingDone = true;
    if (!base.quickNotes) base.quickNotes = [];
    if (!base.lastOpenDate) base.lastOpenDate = "";
    if (!base.lastBackupDate) base.lastBackupDate = "";
    if (!base.lastWeeklyReview) base.lastWeeklyReview = "";
    if (base.focusMode === undefined) base.focusMode = false;
    if (!base.billsToPay) base.billsToPay = initialState.billsToPay;
    if (!base.personalExpenses) base.personalExpenses = [];
    if (!base.personalBudgets) base.personalBudgets = initialState.personalBudgets;
    if (!base.objectives) base.objectives = initialState.objectives;
    if (!base.cashFlowEntries) base.cashFlowEntries = [];

    base.habits = base.habits.map(h => ({ lastDone: "", ...h }));
    base.tasks = base.tasks.map(t => ({ completedAt: "", ...t }));
    base.vaperInventory = base.vaperInventory.map(p => ({ minStock: 3, ...p }));
    base.barberClients = base.barberClients.map(c => ({ cutNotes: "", ...c }));
    base.barberAppointments = base.barberAppointments.map(a => ({ employeeId: "", ...a }));
    return base;
  } catch { return structuredClone(initialState); }
}

function saveState() {
  state._updatedAt = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(state));

  if (window._cedanoSaveTimeout) clearTimeout(window._cedanoSaveTimeout);
  window._cedanoSaveTimeout = setTimeout(async () => {
    if (typeof window.saveUserDataToSupabase === 'function') {
      await window.saveUserDataToSupabase(state);
    }
  }, 800);
}
function setState(patch) { state = { ...state, ...patch }; saveState(); render(); }

/* =====================================================================
   RESET DIARIO
   ===================================================================== */
function checkDayReset() {
  const todayStr = today();
  if (state.lastOpenDate === todayStr) return;

  if (state.lastOpenDate && state.lastOpenDate !== todayStr) {
    const yesterday = {
      date: state.lastOpenDate,
      completed: state.tasks.filter(t => t.done).length,
      pending: state.tasks.filter(t => !t.done).length,
      mission: state.mission,
      moneyToday: state.moneyToday,
      moneySpent: state.moneySpent,
      productiveHours: state.productiveHours,
      note: state.dailyNote || "",
      discipline: Math.round(state.habits.filter(h => h.done).length / Math.max(1, state.habits.length) * 100),
      status: state.moneyToday >= state.moneyGoal ? "Bueno" : "Regular"
    };
    state.history = [yesterday, ...state.history.filter(h => h.date !== yesterday.date)].slice(0, 90);
    state.dailyRevenue = [...state.dailyRevenue.slice(1), state.moneyToday];
  }

  state.moneyToday = 0; state.moneySpent = 0;
  state.productiveHours = 0; state.dailyNote = "";

  const todayDate = new Date(todayStr);
  state.habits = state.habits.map(h => {
    let newStreak = h.streak;
    if (h.done && h.lastDone) {
      const diffDays = Math.round((todayDate - new Date(h.lastDone)) / (1000*60*60*24));
      if (diffDays > 1) newStreak = 0;
    } else if (!h.done) {
      newStreak = Math.max(0, h.streak - 1);
    }
    return { ...h, done: false, streak: newStreak };
  });

  state.tasks = state.tasks.map(t => ({
    ...t,
    done: t.type !== "Diario" ? t.done : false,
    completedAt: t.type !== "Diario" ? t.completedAt : ""
  }));

  state.billsToPay = state.billsToPay.map(b => b.recurring ? { ...b, paid: false, paidDate: "" } : b);
  state.lastOpenDate = todayStr;
  saveState();
}

function checkBackupReminder() {
  if (!state.lastBackupDate) return;
  const diffDays = Math.round((new Date() - new Date(state.lastBackupDate)) / (1000*60*60*24));
  if (diffDays >= 7) setTimeout(() => showToast("📦 Han pasado 7 días — exporta tu backup en Reportes"), 3000);
}

function checkWeeklyReview() {
  const d = new Date();
  if (d.getDay() !== 1) return;
  if (state.lastWeeklyReview === today()) return;
  state.lastWeeklyReview = today();
  saveState();
  setTimeout(() => {
    const last7 = state.history.slice(0,7);
    const avgMoney = last7.length ? Math.round(last7.reduce((s,d)=>s+Number(d.moneyToday||0),0)/last7.length) : 0;
    const avgDisc  = last7.length ? Math.round(last7.reduce((s,d)=>s+(d.discipline||0),0)/last7.length) : 0;
    const banner = document.createElement("div");
    banner.innerHTML = `<div style="position:fixed;top:0;left:0;right:0;z-index:200;background:linear-gradient(135deg,#0b1012,#11171a);border-bottom:2px solid var(--blue);padding:14px 16px">
      <p style="color:var(--blue);font-weight:900;font-size:15px">📊 Resumen semanal</p>
      <p style="color:var(--muted);font-size:12px">Promedio diario: ${money(avgMoney)} | Disciplina: ${avgDisc}%</p>
      <button class="small-btn" style="margin-top:8px" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
    </div>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 8000);
  }, 2000);
}

function checkNightAlert() {
  const h = new Date().getHours();
  const alreadyShown = sessionStorage.getItem("CEDANO_NIGHT_SHOWN");
  if (h >= 21 && !alreadyShown) {
    sessionStorage.setItem("CEDANO_NIGHT_SHOWN", "1");
    setTimeout(() => {
      const banner = document.createElement("div");
      banner.id = "night-banner";
      banner.innerHTML = `<div style="position:fixed;top:0;left:0;right:0;z-index:200;background:linear-gradient(135deg,#0b1012,#11171a);border-bottom:2px solid var(--neon);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div><p style="color:var(--neon);font-weight:900;font-size:15px">🌙 Cierre nocturno</p><p style="color:var(--muted);font-size:12px">Registra tu día antes de dormir</p></div>
        <div style="display:flex;gap:8px">
          <button class="small-btn green" onclick="document.getElementById('night-banner').remove();go('Mi Día');setTimeout(openNightSummary,300)">Abrir</button>
          <button class="small-btn" onclick="document.getElementById('night-banner').remove()">Luego</button>
        </div></div>`;
      document.body.appendChild(banner);
    }, 1500);
  }
}

function checkBirthdays() {
  const todayMD = today().slice(5);
  const hoy = state.barberClients.filter(c => c.birthday && c.birthday.slice(5) === todayMD);
  if (hoy.length) setTimeout(() => showToast(`🎂 Cumpleaños hoy: ${hoy.map(c=>c.name).join(", ")}`), 4000);
}

/* =====================================================================
   CÁLCULOS
   ===================================================================== */
function completedTasks() { return state.tasks.filter(t => t.done).length; }
function pendingTasks()   { return state.tasks.filter(t => !t.done).length; }
function progress()       { return state.moneyGoal ? Math.min(100, Math.round(state.moneyToday / state.moneyGoal * 100)) : 0; }

function rank() {
  if (state.xp >= 5000) return "General"; if (state.xp >= 3000) return "Coronel";
  if (state.xp >= 2000) return "Capitán"; if (state.xp >= 1200) return "Mayor";
  if (state.xp >= 600)  return "Sargento"; return "Recluta";
}
function rankIcon() {
  if (state.xp >= 5000) return "⭐⭐⭐"; if (state.xp >= 3000) return "⭐⭐";
  if (state.xp >= 2000) return "⭐";   if (state.xp >= 1200) return "🎖";
  if (state.xp >= 600)  return "🏅";   return "🪖";
}
function nextRankXP() {
  if (state.xp < 600)  return 600;  if (state.xp < 1200) return 1200;
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
function loanBalanceMoney(loan) { return money(loanBalance(loan), loan.currency || "RD$"); }
function totalLoanBalance()     { return state.loans.reduce((s,l) => s + loanBalance(l), 0); }
function vaperGain()            { return state.vaperSales.reduce((s,sale) => s + Number(sale.gain || 0), 0); }
function vaperInventoryValue()  { return state.vaperInventory.reduce((s,p) => s + Number(p.quantity||0) * Number(p.cost||0), 0); }
function barberIncome() {
  return state.barberAppointments.filter(a => a.completed === true).reduce((s,a) => s + Number(a.price||0), 0);
}
function barberIncomeByEmployee(employeeId) {
  return state.barberAppointments.filter(a => a.completed && a.employeeId === employeeId).reduce((s,a) => s + Number(a.price||0), 0);
}
function barberExpenseTotal() { return state.barberExpenses.reduce((s,e) => s + Number(e.amount||0), 0); }
function patrimonyTotal() {
  return Number(state.capital) + totalLoanBalance() + vaperInventoryValue() + vaperGain() + Number(state.savings||0);
}
function loanStatusClass(s) { return s==="Al día"?"status-verde":s==="En mora"?"status-mora":"status-riesgo"; }
function loanStatusDot(s)   { return s==="Al día"?"🟢":s==="En mora"?"🔴":"🟡"; }
function totalBillsPending()  { return state.billsToPay.filter(b=>!b.paid).reduce((s,b)=>s+Number(b.amount||0),0); }
function billsOverdue() {
  return state.billsToPay.filter(b => !b.paid && b.dueDate && new Date(b.dueDate) < new Date());
}
function personalExpensesByCategory(cat) {
  const m = today().slice(0,7);
  return state.personalExpenses.filter(e=>e.category===cat && e.date.startsWith(m)).reduce((s,e)=>s+Number(e.amount||0),0);
}
function totalPersonalExpenses() {
  const m = today().slice(0,7);
  return state.personalExpenses.filter(e=>e.date.startsWith(m)).reduce((s,e)=>s+Number(e.amount||0),0);
}
function cashFlowToday() {
  const t = today();
  const entries = state.cashFlowEntries.filter(e=>e.date===t);
  const inflow  = entries.filter(e=>e.type==="entrada").reduce((s,e)=>s+Number(e.amount||0),0);
  const outflow = entries.filter(e=>e.type==="salida").reduce((s,e)=>s+Number(e.amount||0),0);
  return { inflow, outflow, net: inflow - outflow, entries };
}
function notifCount() {
  const mora      = state.loans.filter(l => calcLateDays(l) >= (state.notifSettings?.loanOverdueDays||3) || l.status==="En mora").length;
  const stock     = state.vaperInventory.filter(p => Number(p.quantity) <= Number(p.minStock||3)).length;
  const bills     = billsOverdue().length;
  const birthdays = state.barberClients.filter(c=>c.birthday&&c.birthday.slice(5)===today().slice(5)).length;
  return mora + stock + bills + birthdays;
}

/* =====================================================================
   MORNING BRIEF
   ===================================================================== */

/* ── NUEVO: obtener nombre real del usuario ── */
function getGreetingName() {
  const user = window._cedanoCurrentUser;
  if (state.userName && state.userName.trim() && state.userName !== "Cedano") {
    return state.userName.trim();
  }
  if (user?.user_metadata?.display_name) {
    return user.user_metadata.display_name.split(" ")[0];
  }
  if (user?.email) {
    return user.email.split("@")[0];
  }
  return state.userName || "Usuario";
}

function getMorningBrief() {
  const h = new Date().getHours();
  const mora       = state.loans.filter(l => calcLateDays(l) > 0 || l.status === "En mora");
  const lowStock   = state.vaperInventory.filter(p => Number(p.quantity) <= Number(p.minStock||3));
  const citasHoy   = state.barberAppointments.filter(a => a.date === today() && !a.completed);
  const billsVenc  = billsOverdue();
  const birthdays  = state.barberClients.filter(c=>c.birthday&&c.birthday.slice(5)===today().slice(5));

  /* ── SALUDO CON NOMBRE REAL ── */
  const nombre   = getGreetingName();
  const greeting = (h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches") + ", " + nombre;

  const focus = h < 12 ? "Hora de atacar el día. Revisa tus cobros y hábitos."
    : h < 17 ? "Tarde productiva. ¿Ya completaste tu misión?"
    : "Últimas horas del día. Cierra fuerte.";
  const items = [];
  if (mora.length)       items.push(`🔴 ${mora.length} cliente${mora.length>1?"s":""} en mora`);
  if (citasHoy.length)   items.push(`✂ ${citasHoy.length} cita${citasHoy.length>1?"s":""} pendiente${citasHoy.length>1?"s":""} hoy`);
  if (lowStock.length)   items.push(`⚠ Stock bajo: ${lowStock.map(p=>p.product).join(", ")}`);
  if (billsVenc.length)  items.push(`💳 ${billsVenc.length} cuenta${billsVenc.length>1?"s":""} vencida${billsVenc.length>1?"s":""}`);
  if (birthdays.length)  items.push(`🎂 Cumpleaños: ${birthdays.map(c=>c.name).join(", ")}`);
  if (!items.length)     items.push("✅ Todo en orden. Buen día.");
  return { greeting, focus, items };
}

/* =====================================================================
   TABS
   ===================================================================== */
const tabs = [["Inicio","⌂"],["Mi Día","⚑"],["Negocios","$"],["Vaper","☁"],["Barbería","✂"],["Finanzas","💳"],["Imperio","♛"]];

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

function go(tab)              { currentTab = tab; subTabs = {}; render(); }
function setSubTab(mod, tab)  { subTabs[mod] = tab; render(); }
function destroyCharts()      { Object.values(chartInstances).forEach(c=>{try{c.destroy();}catch{}}); chartInstances={}; }

/* =====================================================================
   PIN
   ===================================================================== */
let pinEntry = "";
function renderPin() {
  return `<div class="pin-screen" id="pinScreen">
    <div style="font-size:48px">🔐</div>
    <h2 style="color:var(--neon);font-size:22px;font-weight:900">Cedano Business</h2>
    <p style="color:var(--muted);font-size:14px">Ingresa tu PIN</p>
    <div class="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot${pinEntry.length>i?" filled":""}" id="pd${i}"></div>`).join("")}</div>
    <div id="pinError" style="color:var(--danger);min-height:20px;font-size:13px;font-weight:700"></div>
    <div class="pin-grid">${[1,2,3,4,5,6,7,8,9,"","0","⌫"].map(k=>`<button class="pin-btn" onclick="pinPress('${k}')">${k}</button>`).join("")}</div>
  </div>`;
}
function pinPress(k) {
  if (k==="⌫") pinEntry = pinEntry.slice(0,-1);
  else if (k!=="") pinEntry += k;
  updatePinDots();
  if (pinEntry.length===4) {
    if (pinEntry===state.pin) {
      pinUnlocked=true; pinEntry=""; rebuildDOM(); render();
    } else {
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

/* =====================================================================
   REBUILD DOM
   ===================================================================== */
function rebuildDOM() {
  document.body.innerHTML = `
    <main class="app"><section id="screen"></section></main>
    <nav class="tabs" id="tabs" role="navigation" aria-label="Navegación principal"></nav>
    <button class="fab-note" onclick="openQuickNote()" aria-label="Nota rápida" title="Nota rápida">✏</button>

    <div class="modal" id="quickNoteModal" role="dialog" aria-modal="true">
      <div class="modal-inner"><div class="modal-head"><h2 style="color:var(--neon)">✏ Nota rápida</h2><button onclick="closeModal('quickNoteModal')">×</button></div><div id="quickNoteContent"></div></div></div>

    <div class="modal" id="searchModal" role="dialog" aria-modal="true">
      <div class="modal-inner"><div class="modal-head"><h2>🔍 Búsqueda global</h2><button onclick="closeModal('searchModal')">×</button></div>
      <div id="searchContent"><input id="globalSearchInput" placeholder="Buscar..." oninput="runGlobalSearch(this.value)"/>
      <div id="globalSearchResults" style="margin-top:12px"></div></div></div></div>

    <div class="modal" id="nightModal" role="dialog" aria-modal="true">
      <div class="modal-inner"><div class="modal-head"><h2>🌙 Cierre Nocturno</h2><button onclick="closeNightSummary()">×</button></div><div id="nightContent"></div></div></div>

    <div class="modal" id="editModal" role="dialog" aria-modal="true">
      <div class="modal-inner"><div class="modal-head"><h2 id="editTitle">Editar</h2><button onclick="closeEditModal()">×</button></div><div id="editContent"></div></div></div>

    <div class="modal" id="aiModal" role="dialog" aria-modal="true">
      <div class="modal-inner"><div class="modal-head"><h2>🧠 IA Cedano</h2><button onclick="closeAI()">×</button></div>
      <div id="aiContent">
        <input id="aiInput" placeholder="Pregunta sobre tu negocio..." aria-label="Pregunta para la IA"/>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px">
          <button class="small-btn green" onclick="askAI('¿Cuánto gané esta semana?')">Esta semana</button>
          <button class="small-btn green" onclick="askAI('¿Quiénes debo cobrar hoy?')">Cobrar hoy</button>
          <button class="small-btn green" onclick="askAI('¿Qué negocio está creciendo más?')">Mayor crecimiento</button>
          <button class="small-btn warn" onclick="askAI('¿Cuánto debo producir hoy para llegar a mi meta mensual?')">Meta mensual</button>
          <button class="small-btn" onclick="askAI('Resumen de patrimonio total')">Patrimonio</button>
          <button class="small-btn blue" onclick="askAI('Dame consejos para crecer mis negocios')">Consejos</button>
          <button class="small-btn" onclick="askAI('¿Qué productos vaper debo reponer?')">Reponer stock</button>
          <button class="small-btn" onclick="askAI('¿Qué cuentas tengo pendientes de pagar?')">Cuentas pendientes</button>
          <button class="small-btn purple" onclick="askAI('Analiza mis gastos personales de este mes')">Gastos mes</button>
          <button class="small-btn red" onclick="clearAIHistory()">🗑 Limpiar chat</button>
        </div>
        <button class="btn" style="margin-top:10px" onclick="runAI()">Preguntar ›</button>
        <div id="aiChatHistory" style="margin-top:14px;display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto"></div>
      </div></div></div>

    <div class="modal" id="payHistModal" role="dialog" aria-modal="true">
      <div class="modal-inner"><div class="modal-head"><h2>💳 Historial de pagos</h2><button onclick="closeModal('payHistModal')">×</button></div><div id="payHistContent"></div></div></div>

    <div class="modal" id="onboardModal" role="dialog" aria-modal="true" style="z-index:60">
      <div class="modal-inner"><div class="modal-head"><h2>👋 Bienvenido a Cedano Business v6</h2><button onclick="closeOnboard()">×</button></div><div id="onboardContent"></div></div></div>`;
}

/* =====================================================================
   MODALES
   ===================================================================== */
function openModal(id)  { const m=document.getElementById(id); if(m) m.classList.add("open"); }
function closeModal(id) { const m=document.getElementById(id); if(m) m.classList.remove("open"); }

/* =====================================================================
   NOTAS RÁPIDAS
   ===================================================================== */
function openQuickNote() {
  const el = document.getElementById("quickNoteContent"); if (!el) return;
  el.innerHTML = `
    <textarea id="quickNoteText" placeholder="Escribe tu nota aquí..." style="min-height:120px"></textarea>
    ${btn("Guardar nota","saveQuickNote()")}
    ${state.quickNotes.length ? `
      <h3 style="margin-top:16px;color:var(--neon);font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.5px">Notas guardadas</h3>
      <div style="max-height:240px;overflow-y:auto;margin-top:8px">
        ${state.quickNotes.slice().reverse().map(n => `
          <div class="list-item" style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
            <div style="flex:1">
              <p style="font-size:14px;line-height:1.5">${esc(n.text)}</p>
              <p class="muted" style="font-size:11px;margin-top:2px">${esc(n.date)} ${esc(n.time)}</p>
            </div>
            ${sm("🗑","deleteQuickNote('"+n.id+"')","red")}
          </div>`).join("")}
      </div>` : ""}`;
  openModal("quickNoteModal");
  setTimeout(()=>document.getElementById("quickNoteText")?.focus(), 80);
}
function saveQuickNote() {
  const text = document.getElementById("quickNoteText")?.value.trim(); if (!text) return;
  const now = new Date();
  state.quickNotes.push({ id:uid(), text, date:today(), time:now.toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"}) });
  saveState(); closeModal("quickNoteModal"); showToast("✅ Nota guardada");
}
function deleteQuickNote(id) { state.quickNotes=state.quickNotes.filter(n=>n.id!==id); saveState(); openQuickNote(); }

/* =====================================================================
   ONBOARDING
   ===================================================================== */
const onboardSteps = [
  { icon:"💰", title:"Negocios", desc:"Gestiona tus contactos de préstamos y haz seguimiento sin duplicar trabajo con tu app principal." },
  { icon:"☁", title:"Módulo Vaper", desc:"Controla inventario, registra ventas y recibe alertas cuando el stock esté bajo." },
  { icon:"✂", title:"Módulo Barbería", desc:"Agenda citas, gestiona clientes frecuentes y registra ingresos fácilmente." },
  { icon:"💳", title:"Finanzas Personales", desc:"Registra cuentas por pagar, controla gastos por categoría y ve tu flujo de caja diario." },
  { icon:"🎯", title:"Objetivos", desc:"Crea metas financieras con progreso visual para mantenerte enfocado." },
  { icon:"🧠", title:"IA Cedano", desc:"Pregúntale a la IA sobre tus negocios. Recuerda el historial completo entre sesiones." }
];
let onboardStep = 0;
function openOnboard() { onboardStep=0; renderOnboardStep(); openModal("onboardModal"); }
function renderOnboardStep() {
  const s=onboardSteps[onboardStep]; const el=document.getElementById("onboardContent"); if(!el) return;
  el.innerHTML=`<div style="text-align:center;padding:24px 10px">
    <div style="font-size:56px;margin-bottom:16px">${s.icon}</div>
    <h3 style="color:var(--neon);margin-bottom:10px;font-size:20px;font-weight:900">${s.title}</h3>
    <p style="color:var(--muted);line-height:1.7;margin-bottom:22px;font-size:14px">${s.desc}</p>
    <div style="display:flex;gap:6px;justify-content:center;margin-bottom:22px">
      ${onboardSteps.map((_,i)=>`<div style="width:8px;height:8px;border-radius:50%;background:${i===onboardStep?"var(--neon)":"var(--line)"};transition:background .2s"></div>`).join("")}
    </div>
    <div class="row">
      ${onboardStep>0?btn("← Anterior","prevOnboard()","secondary"):""}
      ${onboardStep<onboardSteps.length-1?btn("Siguiente →","nextOnboard()"):btn("¡Empezar!","closeOnboard()")}
    </div>
  </div>`;
}
function nextOnboard() { onboardStep++; renderOnboardStep(); }
function prevOnboard() { onboardStep--; renderOnboardStep(); }
function closeOnboard() { state.onboardingDone=true; saveState(); closeModal("onboardModal"); }

/* =====================================================================
   BÚSQUEDA GLOBAL
   ===================================================================== */
function openSearch() { openModal("searchModal"); setTimeout(()=>document.getElementById("globalSearchInput")?.focus(),80); }
function runGlobalSearch(q) {
  const el=document.getElementById("globalSearchResults"); if(!el) return;
  if(!q||q.length<2){ el.innerHTML=`<p class="muted" style="text-align:center;padding:14px">Escribe al menos 2 caracteres</p>`; return; }
  const ql=q.toLowerCase(); const results=[];
  state.loanClients.filter(c=>c.name.toLowerCase().includes(ql)||(c.phone||"").includes(ql)).forEach(c=>results.push({type:"👤 Cliente",title:c.name,sub:c.phone,action:`go('Negocios')`}));
  state.contacts.filter(c=>c.name.toLowerCase().includes(ql)||(c.phone||"").includes(ql)).forEach(c=>results.push({type:"📇 Contacto",title:c.name,sub:`${c.phone} · ${c.status}`,action:`go('Negocios')`}));
  state.barberAppointments.filter(a=>a.client.toLowerCase().includes(ql)).forEach(a=>results.push({type:"✂ Cita",title:a.client,sub:`${a.date} ${a.time}`,action:`go('Barbería')`}));
  state.vaperInventory.filter(p=>p.product.toLowerCase().includes(ql)).forEach(p=>results.push({type:"☁ Producto",title:p.product,sub:`Stock: ${p.quantity}`,action:`go('Vaper')`}));
  state.billsToPay.filter(b=>b.name.toLowerCase().includes(ql)).forEach(b=>results.push({type:"💳 Cuenta",title:b.name,sub:money(b.amount),action:`go('Finanzas')`}));
  state.quickNotes.filter(n=>n.text.toLowerCase().includes(ql)).forEach(n=>results.push({type:"✏ Nota",title:n.text.slice(0,50),sub:n.date,action:`openQuickNote()`}));
  if(!results.length){ el.innerHTML=`<div class="empty">Sin resultados para "${esc(q)}"</div>`; return; }
  el.innerHTML=results.slice(0,12).map(r=>`
    <div class="list-item" onclick="closeModal('searchModal');${r.action}" style="cursor:pointer">
      <span class="pill" style="margin-bottom:4px">${r.type}</span>
      <div style="font-weight:700;margin-top:2px">${esc(r.title)}</div>
      <div class="muted" style="font-size:12px">${esc(r.sub)}</div>
    </div>`).join("");
}

/* =====================================================================
   RENDER PRINCIPAL
   ===================================================================== */
function render() {
  if (state.pinEnabled && !pinUnlocked) { document.body.innerHTML = renderPin(); return; }
  if (!document.getElementById("screen")) rebuildDOM();
  hideSkeleton(); destroyCharts(); renderTabs();
  if (focusModeActive) {
    document.getElementById("screen").innerHTML = renderFocusMode();
    document.body.classList.toggle("light-mode", !darkMode);
    return;
  }
  const views = {
    "Inicio": renderHome, "Mi Día": renderMyDay, "Negocios": renderNegocios,
    "Vaper": renderVaper, "Barbería": renderBarber, "Finanzas": renderFinanzas, "Imperio": renderImperio
  };
  document.getElementById("screen").innerHTML = views[currentTab]();
  const bar = document.getElementById("moneyProgress");
  if (bar) bar.style.width = progress()+"%";
  document.body.classList.toggle("light-mode",!darkMode);
  setTimeout(initCharts,100);
  if (!state.onboardingDone) setTimeout(openOnboard, 600);
  checkNightAlert();
}

/* =====================================================================
   MODO ENFOQUE
   ===================================================================== */
function toggleFocusMode() { focusModeActive=!focusModeActive; render(); }
function renderFocusMode() {
  const pendientes=state.tasks.filter(t=>!t.done);
  const habitos=state.habits.filter(h=>!h.done);
  return `<div style="padding:10px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div><h1 style="color:var(--neon);font-size:26px;font-weight:900">⚡ Modo Enfoque</h1><p class="muted" style="font-size:13px">Solo lo que importa ahora mismo</p></div>
      <button class="small-btn warn" onclick="toggleFocusMode()">✕ Salir</button>
    </div>
    <div class="card" style="border-color:rgba(34,212,104,.6);margin-bottom:16px">
      <span class="title">🎯 Misión del día</span>
      <p style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:10px">${esc(state.mission||"Sin misión. Ve a Inicio y define una.")}</p>
      <div class="progress"><span id="moneyProgress" style="width:${progress()}%"></span></div>
      <p class="muted" style="font-size:13px;margin-top:6px">${money(state.moneyToday)} / ${money(state.moneyGoal)} — ${progress()}%</p>
    </div>
    ${pendientes.length?`<div class="card" style="margin-bottom:16px">
      <span class="title">✅ Tareas pendientes (${pendientes.length})</span>
      ${pendientes.map(t=>`<div class="habit-item" onclick="toggleTask('${t.id}')" role="checkbox" aria-checked="false" tabindex="0">
        <div class="habit-check"></div>
        <div><span style="font-weight:700">${esc(t.text)}</span>
        <span class="pill ${t.priority==="Urgente"?"danger":t.priority==="Alta"?"warn":"green"}" style="margin-left:8px">${t.priority}</span></div>
      </div>`).join("")}
    </div>`:`<div class="card" style="text-align:center;padding:22px;margin-bottom:16px"><p style="color:var(--neon);font-size:18px;font-weight:900">✅ Sin tareas pendientes</p></div>`}
    ${habitos.length?`<div class="card">
      <span class="title">🌅 Hábitos pendientes (${habitos.length})</span>
      ${habitos.map(h=>`<div class="habit-item" onclick="toggleHabit('${h.id}')" role="checkbox" aria-checked="false" tabindex="0">
        <div class="habit-check"></div><span>${esc(h.text)}</span>
        <span class="pill green" style="margin-left:auto">${h.streak}🔥</span>
      </div>`).join("")}
    </div>`:`<div class="card" style="text-align:center;padding:22px"><p style="color:var(--neon);font-size:18px;font-weight:900">🔥 Todos los hábitos completados</p></div>`}
  </div>`;
}

function header() {
  const nc = notifCount();
  const user = window._cedanoCurrentUser;
  const userEmail = user?.email || '';
  const userInitial = userEmail ? userEmail[0].toUpperCase() : '?';

  return `<div class="topbar">
    <button class="icon-btn" onclick="openSearch()" aria-label="Búsqueda global">🔍</button>
    <div class="brand">CEDANO BUSINESS</div>
    <button class="icon-btn" onclick="toggleTheme()" aria-label="Cambiar tema">${darkMode ? '☀' : '🌙'}</button>
    <button class="icon-btn" onclick="openAI()" aria-label="Abrir IA" style="position:relative">
      🧠${nc > 0 ? `<span class="topbar-badge">${nc}</span>` : ''}
    </button>
    <button class="icon-btn" onclick="showUserMenu()"
      style="background:var(--neon);color:#000;font-weight:900;font-size:14px"
      title="${userEmail}">
      ${userInitial}
    </button>
  </div>`;
}
function showUserMenu() {
  const existing = document.getElementById('user-menu-popup');
  if (existing) { existing.remove(); return; }

  const user = window._cedanoCurrentUser;
  const email = user?.email || '';
  const name  = window.state?.userName || '';

  const menu = document.createElement('div');
  menu.id = 'user-menu-popup';
  menu.style.cssText = `
    position:fixed;top:58px;right:14px;
    background:var(--card);border:1.5px solid var(--line);
    border-radius:12px;padding:14px;min-width:230px;
    z-index:200;box-shadow:0 8px 32px rgba(0,0,0,.5);
    animation:fadeIn .15s ease;
  `;
  menu.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;
                padding-bottom:12px;border-bottom:1px solid var(--line)">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--neon);
                  display:flex;align-items:center;justify-content:center;
                  font-weight:900;font-size:18px;color:#000;flex-shrink:0">
        ${email[0]?.toUpperCase() || '?'}
      </div>
      <div style="min-width:0">
        ${name ? `<p style="font-weight:800;font-size:14px;margin:0">${esc(name)}</p>` : ''}
        <p style="color:var(--muted);font-size:12px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(email)}</p>
      </div>
    </div>
    <button onclick="document.getElementById('user-menu-popup').remove();go('Imperio')"
      style="display:block;width:100%;text-align:left;padding:9px 10px;border-radius:7px;
             background:none;border:none;cursor:pointer;color:var(--text);
             font-family:inherit;font-size:13px;font-weight:600;margin-bottom:4px">
      ⚙ Configuración
    </button>
    <button onclick="document.getElementById('user-menu-popup').remove();cerrarSesion()"
      style="display:block;width:100%;text-align:left;padding:9px 10px;border-radius:7px;
             background:none;border:none;cursor:pointer;color:var(--danger);
             font-family:inherit;font-size:13px;font-weight:700">
      🚪 Cerrar sesión
    </button>
  `;
  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); }
    });
  }, 50);
}
function toggleTheme() {
  darkMode=!darkMode; localStorage.setItem("CEDANO_THEME",darkMode?"dark":"light");
  document.body.classList.toggle("light-mode",!darkMode);
}

/* =====================================================================
   HOME
   ===================================================================== */
function renderHome() {
  const brief=getMorningBrief();
  const missing=Math.max(0,state.moneyGoal-state.moneyToday);
  const mora=state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length;
  const todayCitas=state.barberAppointments.filter(a=>a.date===today()).length;
  const lowStockItems=state.vaperInventory.filter(p=>Number(p.quantity)<=Number(p.minStock||3));
  const overdueAlert=state.loans.filter(l=>calcLateDays(l)>=(state.notifSettings?.loanOverdueDays||3));
  const billsVencidas=billsOverdue();
  const cf=cashFlowToday();

  return `${header()}
    <div class="morning-brief">
      <div class="brief-header">
        <div>
          <h2 class="brief-greeting">${esc(brief.greeting)} 👋</h2>
          <p class="brief-focus">${brief.focus}</p>
        </div>
        <button class="focus-mode-btn" onclick="toggleFocusMode()" title="Modo Enfoque">⚡</button>
      </div>
      <div class="brief-items">${brief.items.map(item=>`<div class="brief-item">${item}</div>`).join("")}</div>
    </div>
    <section class="card capital"><div><p class="label">Capital en efectivo</p><p class="big-money">${money(state.capital)}</p></div><span class="muted" style="font-size:24px">›</span></section>
    <div class="kpi-band">
      <div class="kpi-item"><span class="kpi-label">💵 Hoy generado</span><span class="kpi-val">${money(state.moneyToday)}</span><span class="kpi-sub">Meta: ${money(state.moneyGoal)}</span></div>
      <div class="kpi-item"><span class="kpi-label">📊 Flujo neto</span><span class="kpi-val" style="color:${cf.net>=0?"var(--neon)":"var(--danger)"}">${money(cf.net)}</span><span class="kpi-sub">+${money(cf.inflow)} / -${money(cf.outflow)}</span></div>
      <div class="kpi-item"><span class="kpi-label">💳 Por pagar</span><span class="kpi-val" style="color:${billsVencidas.length?"var(--danger)":"var(--text)"}">${money(totalBillsPending())}</span><span class="kpi-sub">${billsVencidas.length} vencida${billsVencidas.length!==1?"s":""}</span></div>
      <div class="kpi-item"><span class="kpi-label">✂ Barbería hoy</span><span class="kpi-val">${todayCitas}</span><span class="kpi-sub">cita${todayCitas!==1?"s":""} agendada${todayCitas!==1?"s":""}</span></div>
    </div>
    <div class="progress" style="margin-bottom:6px"><span id="moneyProgress"></span></div>
    <p class="muted" style="font-size:12px;margin-bottom:14px;text-align:center">${progress()}% de meta diaria — faltan ${money(missing)}</p>
    ${lowStockItems.length?`<div class="card alert-card warn-card"><p class="title" style="color:var(--warn)">⚠ Stock bajo — reponer pronto</p>${lowStockItems.map(p=>`<span class="pill warn" style="margin:2px">☁ ${esc(p.product)} — ${p.quantity}/${p.minStock} uds.</span>`).join("")}</div>`:""}
    ${overdueAlert.length?`<div class="card alert-card danger-card">
      <p class="title" style="color:var(--danger)">🔴 Cobros urgentes (≥${state.notifSettings?.loanOverdueDays||3} días)</p>
      ${overdueAlert.map(l=>`<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:8px 0">
        <span>💸 ${esc(l.client)} — <strong>${calcLateDays(l)} días</strong></span>
        <button class="small-btn green" onclick="whatsappLoan('${l.id}')">WA</button>
      </div>`).join("")}
      ${btn("💬 WhatsApp a todos los morosos","whatsappAllMorosos()","secondary")}
    </div>`:""}
    ${billsVencidas.length?`<div class="card alert-card danger-card">
      <p class="title" style="color:var(--danger)">⚠ Cuentas vencidas</p>
      ${billsVencidas.map(b=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid var(--line)"><span>${esc(b.name)}</span><span class="pill danger">${money(b.amount,b.currency)}</span></div>`).join("")}
      <button class="btn secondary" onclick="go('Finanzas')" style="margin-top:10px">Ver cuentas por pagar</button>
    </div>`:""}
    ${card("🎯 Misión del día",`<p style="margin-bottom:10px">${esc(state.mission||"Sin misión establecida")}</p>${inp("missionInput","Ej: Conseguir 3 clientes")}<div class="row" style="margin-top:8px">${btn("Guardar","saveMission()")}${btn("✔ Completar (+50 XP)","completeMission()","secondary")}</div>`)}
    <h2 class="section-title">Módulos</h2>
    ${[["💰","Negocios","Seguimiento de clientes y préstamos.","Negocios"],["☁","Vaper","Inventario y ventas.","Vaper"],["✂","Barbería","Agenda y clientes.","Barbería"],["💳","Finanzas","Cuentas, gastos y flujo de caja.","Finanzas"],["⚑","Mi Día","Metas, hábitos y XP.","Mi Día"],["♛","Mi Imperio","Patrimonio y objetivos.","Imperio"]].map(([ic,nm,dc,tb])=>`<div class="module" onclick="go('${tb}')"><div class="module-icon">${ic}</div><div><strong>${nm}</strong><small>${dc}</small></div><div class="arrow">›</div></div>`).join("")}
    ${card("🧠 Resumen IA",`<p class="pill green" style="margin-bottom:6px">Faltan ${money(missing)} para tu meta.</p><p class="pill ${mora?"danger":"green"}" style="margin-bottom:6px">${mora} clientes en mora.</p><p class="pill warn" style="margin-bottom:6px">${state.contacts.filter(c=>c.status==="Pendiente").length} personas por contactar.</p><p class="pill ${billsVencidas.length?"danger":"green"}" style="margin-bottom:6px">${billsVencidas.length} cuentas vencidas por pagar.</p><p class="pill blue" style="margin-bottom:10px">Patrimonio total: ${money(patrimonyTotal())}</p>${btn("Abrir IA completa","openAI()","secondary")}`)}
    <h2 class="section-title">Accesos rápidos</h2>
    <section class="quick-grid">
      ${[["👥","Clientes","Negocios"],["☁","Vaper","Vaper"],["✂","Barbería","Barbería"],["💳","Finanzas","Finanzas"],["⚑","Metas","Mi Día"],["🎯","Objetivos","Imperio"],["📅","Agenda","Barbería"],["♛","Imperio","Imperio"]].map(([ic,nm,tb])=>`<button class="quick" onclick="go('${tb}')"><span>${ic}</span><small>${nm}</small></button>`).join("")}
    </section>
    ${card("📖 Verso del Día",`<p style="font-style:italic;margin-bottom:6px;color:var(--muted)">Porque yo sé los planes que tengo para vosotros.</p><p class="green" style="font-weight:700">— Jeremías 29:11</p>`)}`;
}

/* =====================================================================
   MI DÍA
   ===================================================================== */
function renderMyDay() {
  const habitsCompleted=state.habits.filter(h=>h.done).length;
  const disciplineToday=Math.round(habitsCompleted/Math.max(1,state.habits.length)*100);
  return `<h1 class="section-title">⚑ Mi Día</h1>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <p class="muted" style="font-size:13px">Disciplina hoy: <strong style="color:var(--neon)">${disciplineToday}%</strong></p>
      <button class="small-btn green" onclick="toggleFocusMode()">⚡ Modo Enfoque</button>
    </div>
    ${card("🌅 Hábitos de hoy", state.habits.map(h=>`
      <div class="habit-item ${h.done?"done":""}" onclick="toggleHabit('${h.id}')" role="checkbox" aria-checked="${h.done}" tabindex="0">
        <div class="habit-check">${h.done?"✓":""}</div>
        <div style="flex:1"><span>${esc(h.text)}</span>${h.lastDone?`<p class="muted" style="font-size:11px;margin-top:2px">Última vez: ${esc(h.lastDone)}</p>`:""}</div>
        <span class="pill green" style="margin-left:auto">${h.streak}🔥</span>
        ${sm("🗑","deleteHabit('"+h.id+"')","red")}
      </div>`).join("")+inp("newHabitInput","Agregar hábito")+btn("Agregar hábito","addHabit()"))}
    ${card("📊 Estadísticas",`<div class="grid-3">
      <div class="card metric"><div class="title">🏋 Gym</div><div class="value">${state.habitStats.daysTraining}</div><div class="muted">días seguidos</div></div>
      <div class="card metric"><div class="title">🎯 Metas</div><div class="value">${state.habitStats.daysMeta}</div><div class="muted">días cumplidos</div></div>
      <div class="card metric"><div class="title">😴 Sueño</div><div class="value">${state.habitStats.avgSleep}h</div><div class="muted">promedio</div></div>
    </div>`)}
    ${card("✅ Tareas del día",`
      ${inp("taskText","Ej: Cobrar a Pedro")}
      <div class="row">${sel("taskType",["Diario","Semanal","Mensual"],"Diario")}${sel("taskPriority",["Baja","Media","Alta","Urgente"],"Media")}</div>
      <div class="row">${inp("taskDate","Fecha","text",today())}${inp("taskTime","Hora")}</div>
      ${btn("Agregar tarea","addTask()")}
      <div style="margin-top:14px">${state.tasks.length?state.tasks.map(taskHTML).join(""):`<div class="empty">No hay tareas.</div>`}</div>`)}
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
        ${state.tomorrow.tasks.map(t=>`<span class="pill green" style="margin-top:4px">• ${esc(t.text)}</span>`).join("")}
      </div>`)}
    ${btn("🌙 Cierre Nocturno","openNightSummary()")}`;
}

function taskHTML(task) {
  return `<div class="list-item task ${task.done?"done":""}">
    <div onclick="toggleTask('${task.id}')" style="flex:1;cursor:pointer" role="checkbox" aria-checked="${task.done}" tabindex="0">
      <div class="task-text">${task.done?"☑":"☐"} ${esc(task.text)}</div>
      <small class="muted">${task.type||"Diario"} • ${task.date||"Sin fecha"} • ${task.time||"Sin hora"}${task.completedAt?" • ✅ "+task.completedAt:""}</small>
    </div>
    <span class="pill ${task.priority==="Urgente"?"danger":task.priority==="Alta"?"warn":"green"}">${task.priority}</span>
    ${sm("🗑","deleteRecord('task','"+task.id+"')","red")}
  </div>`;
}

/* =====================================================================
   NEGOCIOS
   ===================================================================== */
function renderNegocios() {
  const st=subTabs["negocios"]||"contactos";
  const tabs2=[["contactos","📇 Contactos"],["clientes","👤 Clientes"],["prestamos","💵 Préstamos"]];
  return `<h1 class="section-title">💰 Negocios</h1>
    <div class="tab-scroll">${tabs2.map(([k,l])=>`<button class="tab-pill ${st===k?"active":""}" onclick="setSubTab('negocios','${k}')">${l}</button>`).join("")}</div>
    ${st==="contactos"?renderContactosTab():""}
    ${st==="clientes"?renderClientesTab():""}
    ${st==="prestamos"?renderPrestamosTab():""}`;
}

function renderContactosTab() {
  const pending=state.contacts.filter(c=>c.status==="Pendiente").length;
  const interested=state.contacts.filter(c=>c.status==="Interesado").length;
  const converted=state.contacts.filter(c=>c.status==="Convertido").length;
  return `<div class="grid-3">${metric("⏳","Pendientes",pending,"")}${metric("🙋","Interesados",interested,"")}${metric("✔","Convertidos",converted,"")}</div>
    ${card("➕ Nuevo contacto",`
      ${inp("contactName","Nombre")}${inp("contactPhone","Teléfono")}${inp("contactAddress","Dirección")}
      ${inp("contactSource","Fuente del contacto")}${ta("contactNote","Nota")}
      ${sel("contactPriority",["Baja","Media","Alta"],"Media")}
      ${btn("Agregar","addContact()")}`)}
    <div id="contactList">${state.contacts.map(contactHTML).join("")}</div>`;
}

function renderClientesTab() {
  return `<div class="search-box">${inp("clientSearch","Buscar cliente...")}${sm("🔍","filterClients()","green")}</div>
    ${card("➕ Agregar cliente",`
      ${inp("clientName","Nombre completo")}${inp("clientCedula","Cédula")}
      ${inp("clientPhone","Teléfono")}${inp("clientAddress","Dirección")}
      ${inp("clientReference","Referencia personal")}${ta("clientNotes","Notas")}
      ${btn("Guardar cliente","addLoanClient()")}`)}
    <h2 class="section-title">Clientes registrados</h2>
    <div id="clientList">${state.loanClients.map(clientHTML).join("")}</div>`;
}

function renderPrestamosTab() {
  return `${card("🧮 Calculadora de préstamos",`
      <div class="row">${inp("calcCapital","Capital","number")}${inp("calcInterest","Interés %","number")}</div>
      <div class="row">${sel("calcFreq",["Diario","Semanal","Quincenal","Mensual"],"Semanal")}${inp("calcPeriods","Períodos","number")}</div>
      ${btn("Calcular","calcLoan()")}
      <div class="calc-result" id="calcResult" style="display:none"></div>`)}
    ${card("📝 Registrar préstamo",`
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
    ${state.loans.map(loanHTML).join("")}
    ${card("💳 Registrar pago",`
      ${inp("paymentLoan","Nombre del cliente")}${inp("paymentAmount","Monto pagado","number")}
      ${inp("paymentDate","Fecha","text",today())}
      ${btn("Registrar pago","addPayment()")}
      ${btn("📋 Ver historial","openPayHistory()","secondary")}`)}
    ${card("📊 Resumen préstamos",`
      <p>Total prestado: <strong>${money(state.loans.reduce((s,l)=>s+Number(l.capital||0),0))}</strong></p>
      <p>Por cobrar: <strong class="green">${money(totalLoanBalance())}</strong></p>
      <p>Cobrado: <strong>${money(state.payments.reduce((s,p)=>s+Number(p.amount||0),0))}</strong></p>
      <p>Morosos: <strong style="color:var(--danger)">${state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length}</strong></p>`)}
    ${state.archivedLoans.length?`<h2 class="section-title">📁 Archivados</h2>
      ${state.archivedLoans.map(l=>`<article class="card" style="opacity:.65">
        <span class="title">✅ ${esc(l.client)} <span class="pill green">Cancelado</span></span>
        <p>Capital: ${money(l.capital,l.currency)} | Cobrado: ${money(l.paid,l.currency)}</p>
        ${sm("🗑","deleteArchivedLoan('"+l.id+"')","red")}
      </article>`).join("")}`:""}`;
}

function openPayHistory() { renderPayHistory(""); openModal("payHistModal"); }
function renderPayHistory(filter) {
  const el=document.getElementById("payHistContent"); if(!el) return;
  const filtered=filter?state.payments.filter(p=>p.client.toLowerCase().includes(filter.toLowerCase())):state.payments;
  const total=filtered.reduce((s,p)=>s+Number(p.amount||0),0);
  el.innerHTML=`${inp("payHistFilter","Filtrar por cliente","text",filter)}
    ${btn("Filtrar","renderPayHistory(document.getElementById('payHistFilter').value)","secondary")}
    <p style="margin-top:12px"><strong>Total: ${money(total)}</strong> (${filtered.length} pagos)</p>
    ${filtered.length?filtered.slice().reverse().map(p=>`
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>${esc(p.client)}</strong><p class="muted" style="font-size:12px">${esc(p.date)}</p></div>
        <span class="pill green">${money(p.amount)}</span>
      </div>`).join(""):`<div class="empty">Sin pagos registrados</div>`}`;
}

function setCurrency(cur) {
  loanCurrency=cur;
  const btnRD  = document.getElementById("btnRD");
  const btnUSD = document.getElementById("btnUSD");
  const row    = document.getElementById("usdRateRow");
  if (btnRD)  btnRD.className  = "currency-btn" + (cur==="RD$"?" active":"");
  if (btnUSD) btnUSD.className = "currency-btn" + (cur==="USD"?" active":"");
  if (row)    row.style.display = cur==="USD" ? "block" : "none";
}
function updateUsdRate() {
  const val=Number(document.getElementById("usdRateLive")?.value||0); if(!val) return;
  state.usdRate=val; saveState();
  const disp=document.getElementById("rateDisplay"); if(disp) disp.textContent=val;
  showToast(`✅ Tasa actualizada: RD$${val}/USD`);
}
function filterClients() {
  const q=(document.getElementById("clientSearch")?.value||"").toLowerCase();
  const cl=document.getElementById("clientList");
  if(cl) cl.innerHTML=state.loanClients.filter(c=>c.name.toLowerCase().includes(q)).map(clientHTML).join("");
}
function calcLoan() {
  const capital=Number(document.getElementById("calcCapital")?.value||0);
  const interest=Number(document.getElementById("calcInterest")?.value||0);
  const freq=document.getElementById("calcFreq")?.value||"Semanal";
  const periods=Number(document.getElementById("calcPeriods")?.value||12);
  if(!capital) return;
  const total=capital*(1+interest/100); const cuota=total/periods; const ganancia=total-capital;
  const el=document.getElementById("calcResult");
  if(el){ el.style.display="block"; el.innerHTML=`
    <p>💵 Capital: <strong>${money(capital)}</strong></p>
    <p>💰 Total a cobrar: <strong>${money(total)}</strong></p>
    <p class="green">📈 Ganancia: <strong>${money(ganancia)}</strong></p>
    <p>📅 Cuota ${freq.toLowerCase()}: <strong>${money(cuota)}</strong></p>
    <p class="muted">En ${periods} períodos</p>`; }
}

function clientHTML(c) {
  const clientLoans=state.loans.filter(l=>l.client.toLowerCase()===c.name.toLowerCase());
  return `<article class="card">
    <span class="title">👤 ${esc(c.name)}</span>
    <p>Cédula: ${esc(c.cedula)} | Tel: ${esc(c.phone)}</p>
    <p>Dirección: ${esc(c.address)} | Ref: ${esc(c.reference)}</p>
    <p class="muted">${esc(c.notes)}</p>
    ${clientLoans.map(l=>`<div style="margin-top:8px"><span class="status-badge ${loanStatusClass(l.status)}">${loanStatusDot(l.status)} ${l.status}</span> <span class="muted">Balance: ${loanBalanceMoney(l)}</span></div>`).join("")}
    <div class="row" style="margin-top:10px">
      ${sm("✏ Editar","openEdit('loanClient','"+c.id+"')","")}
      ${sm("🗑","deleteRecord('loanClient','"+c.id+"')","red")}
    </div>
  </article>`;
}

function contactHTML(c) {
  return `<article class="card">
    <span class="title">📇 ${esc(c.name)}</span>
    <p>${esc(c.phone||"Sin teléfono")} | ${esc(c.address||"Sin dirección")}</p>
    <p class="muted">${esc(c.note||"")}</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0"><span class="pill green">${c.priority}</span><span class="pill">${c.status}</span></div>
    <div class="row" style="margin-top:10px">
      ${sm("💬 WA","whatsappCobro('"+c.id+"')","green")}
      ${c.status!=="Convertido"?sm("➕ Crear cliente","convertContact('"+c.id+"')","green"):""}
      ${sm("🗑","deleteContact('"+c.id+"')","red")}
    </div>
    ${sel("status-"+c.id,["Pendiente","Llamado","Visitado","Interesado","No interesado","Convertido"],c.status)}
    ${btn("Cambiar estado","updateContactStatus('"+c.id+"')","")}
  </article>`;
}

function convertContact(id) {
  const c=state.contacts.find(x=>x.id===id); if(!c) return;
  if(state.loanClients.find(l=>l.name.toLowerCase()===c.name.toLowerCase())){ showToast("Este contacto ya es cliente"); return; }
  state.loanClients.push({id:uid(),name:c.name,photo:"",cedula:"",phone:c.phone||"",address:c.address||"",reference:c.source||"",notes:c.note||"",lastVisit:today()});
  state.contacts=state.contacts.map(x=>x.id===id?{...x,status:"Convertido"}:x);
  saveState(); render(); showToast(`✅ ${c.name} añadido como cliente`);
}

function generateSchedule(loan) {
  const total=Number(loan.capital)*(1+Number(loan.interest||0)/100);
  const freqMap={"Diario":1,"Semanal":7,"Quincenal":15,"Mensual":30};
  const days=freqMap[loan.frequency]||7;
  const start=loan.startDate?new Date(loan.startDate):new Date();
  const maxP=loan.frequency==="Diario"?30:loan.frequency==="Mensual"?12:loan.frequency==="Quincenal"?24:52;
  const cuota=total/maxP; const rows=[]; let remaining=total; let paid=Number(loan.paid||0);
  for(let i=0;i<maxP&&remaining>0.01;i++){
    const d=new Date(start); d.setDate(d.getDate()+i*days);
    const thisPay=Math.min(cuota,remaining);
    rows.push({n:i+1,date:d.toLocaleDateString("es-DO"),amount:thisPay,paid:paid>=thisPay*(i+1)});
    remaining-=thisPay;
  }
  return rows;
}

function loanHTML(loan) {
  const lateDays=calcLateDays(loan);
  const effectiveStatus=lateDays>0&&loan.status==="Al día"?"En mora (auto)":loan.status;
  const schedule=generateSchedule(loan);
  return `<article class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
      <span class="title" style="margin:0">💵 ${esc(loan.client)}</span>
      <span class="status-badge ${loanStatusClass(loan.status)}">${loanStatusDot(loan.status)} ${esc(effectiveStatus)}</span>
    </div>
    <p>Capital: ${money(loan.capital,loan.currency)} | Interés: ${loan.interest}%</p>
    <p>Inicio: ${esc(loan.startDate||"Sin fecha")} | Vence: ${esc(loan.dueDate||"Sin fecha")}</p>
    <p>Frecuencia: ${loan.frequency} | Días de atraso: <span class="pill ${lateDays>5?"danger":"warn"}">${lateDays}</span></p>
    <p>Pagado: ${money(loan.paid,loan.currency)}</p>
    <p class="green" style="font-size:20px;font-weight:900;margin-top:6px">Balance: ${loanBalanceMoney(loan)}</p>
    <details style="margin-top:10px">
      <summary style="cursor:pointer;color:var(--neon);font-weight:700;font-size:13px">📅 Ver tabla de cuotas</summary>
      <div style="overflow-x:auto;margin-top:10px">
        <table class="schedule-table">
          <thead><tr><th>#</th><th>Fecha</th><th>Cuota</th><th>Estado</th></tr></thead>
          <tbody>${schedule.slice(0,8).map(r=>`<tr class="${r.paid?"paid-row":""}"><td>${r.n}</td><td>${r.date}</td><td>${money(r.amount,loan.currency)}</td><td>${r.paid?"✅":"⏳"}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </details>
    ${sel("loanstatus-"+loan.id,["Al día","En riesgo","En mora","Cancelado"],loan.status)}
    ${btn("Actualizar estado","updateLoanStatus('"+loan.id+"')","")}
    <div class="row" style="margin-top:8px">
      ${sm("✏ Editar","openEdit('loan','"+loan.id+"')","")}
      ${sm("💬 WA","whatsappLoan('"+loan.id+"')","green")}
      ${loanBalance(loan)===0?sm("📁 Archivar","archiveLoan('"+loan.id+"')"):""}
      ${sm("🗑","deleteRecord('loan','"+loan.id+"')","red")}
    </div>
  </article>`;
}

function archiveLoan(id) {
  const loan=state.loans.find(l=>l.id===id); if(!loan) return;
  if(!confirm(`¿Archivar el préstamo de ${loan.client}?`)) return;
  state.archivedLoans=[...(state.archivedLoans||[]),{...loan,archivedDate:today()}];
  state.loans=state.loans.filter(l=>l.id!==id);
  saveState(); render(); showToast("📁 Préstamo archivado");
}
function deleteArchivedLoan(id) {
  if(!confirm("¿Eliminar del archivo?")) return;
  state.archivedLoans=state.archivedLoans.filter(l=>l.id!==id);
  saveState(); render();
}
function whatsappCobro(contactId) {
  const c=state.contacts.find(x=>x.id===contactId); if(!c) return;
  const msg=`Hola ${c.name}, te recordamos que tienes un seguimiento pendiente en Cedano Business. 🙏`;
  window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappLoan(loanId) {
  const l=state.loans.find(x=>x.id===loanId); if(!l) return;
  const lateDays=calcLateDays(l);
  const msg=`Hola ${l.client}, tienes un pago pendiente de *${loanBalanceMoney(l)}* en Cedano Business.${lateDays>0?` Llevas *${lateDays} días de atraso*.`:""} Por favor realiza tu pago. Gracias 🙏`;
  const client=state.loanClients.find(c=>c.name.toLowerCase()===l.client.toLowerCase());
  window.open(`https://wa.me/${(client?.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappAllMorosos() {
  const morosos=state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora");
  if(!morosos.length){ showToast("Sin morosos actualmente"); return; }
  morosos.forEach((l,i)=>{
    setTimeout(()=>{
      const client=state.loanClients.find(c=>c.name.toLowerCase()===l.client.toLowerCase());
      const phone=(client?.phone||"").replace(/\D/g,"");
      if(!phone) return;
      const msg=`Hola ${l.client}, tienes un pago pendiente de *${loanBalanceMoney(l)}* en Cedano Business. Llevas *${calcLateDays(l)} días de atraso*. Por favor realiza tu pago hoy. Gracias 🙏`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank");
    },i*800);
  });
  showToast(`💬 Abriendo WA para ${morosos.length} clientes...`);
}

/* =====================================================================
   VAPER
   ===================================================================== */
function renderVaper() {
  const st=subTabs["vaper"]||"inventario";
  const tabs2=[["inventario","📦 Inventario"],["ventas","🛒 Ventas"],["clientes","👥 Clientes"]];
  const salesByProduct={};
  state.vaperSales.forEach(s=>{salesByProduct[s.product]=(salesByProduct[s.product]||0)+Number(s.gain||0);});
  const topProducts=Object.entries(salesByProduct).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return `<h1 class="section-title">☁ Módulo Vaper</h1>
    <section class="grid-3">
      ${metric("☁","Productos",state.vaperInventory.length,"Inventario")}
      ${metric("🛒","Ventas",state.vaperSales.length,"Registradas")}
      ${metric("💚","Ganancia",money(vaperGain()),"Total")}
    </section>
    <div class="tab-scroll">${tabs2.map(([k,l])=>`<button class="tab-pill ${st===k?"active":""}" onclick="setSubTab('vaper','${k}')">${l}</button>`).join("")}</div>
    ${st==="inventario"?`
      <div class="search-box">${inp("vaperSearch","Buscar producto...")}${sm("🔍","filterVaper()","green")}</div>
      ${card("📦 Agregar producto",`
        ${inp("vpProduct","Producto")}${inp("vpBrand","Marca")}${inp("vpModel","Modelo")}
        ${sel("vpType",["Desechable","Recargable","Líquido","Accesorio"],"Desechable")}
        ${inp("vpFlavor","Sabor / Presentación")}
        <div class="row">${inp("vpQty","Cantidad","number")}${inp("vpCost","Costo","number")}${inp("vpPrice","Precio de venta","number")}</div>
        ${inp("vpMinStock","Stock mínimo (alerta)","number","3")}
        ${btn("Agregar","addVaperProduct()")}`)}
      <h2 class="section-title">Inventario</h2>
      <div id="vaperList">${state.vaperInventory.map(vaperProductHTML).join("")}</div>
      ${topProducts.length?card("🏆 Top por ganancia",topProducts.map(([name,gain],i)=>`
        <div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
          <span>${i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "} ${esc(name)}</span>
          <span class="pill green">${money(gain)}</span>
        </div>`).join("")):""}` : ""}
    ${st==="ventas"?`
      ${card("🛒 Registrar venta",`
        ${inp("saleClient","Cliente")}
        <label class="muted" style="font-size:12px;display:block;margin-top:6px">Producto</label>
        <select id="saleProduct">
          <option value="">— Selecciona un producto —</option>
          ${state.vaperInventory.map(p=>`<option value="${esc(p.product)}">${esc(p.product)} (stock: ${p.quantity})</option>`).join("")}
        </select>
        <div class="row">${inp("saleQty","Cantidad","number")}${inp("saleDate","Fecha","text",today())}</div>
        ${sel("saleMethod",["Efectivo","Transferencia","Tarjeta","Crédito"],"Efectivo")}
        ${btn("Guardar venta","addVaperSale()")}
        <h3 style="margin-top:18px;color:var(--neon);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.5px">Ventas recientes</h3>
        ${state.vaperSales.length?state.vaperSales.slice().reverse().slice(0,10).map(s=>`
          <div class="list-item" style="display:flex;justify-content:space-between">
            <div><strong>${esc(s.product)}</strong> x${s.quantity}
            <p class="muted" style="font-size:12px">${esc(s.client||"Sin cliente")} · ${esc(s.date)} · ${esc(s.method)}</p></div>
            <span class="pill green">${money(s.gain)}</span>
          </div>`).join(""):`<div class="empty">Sin ventas aún</div>`}`)}`:""}
    ${st==="clientes"?`
      ${card("👥 Clientes Vaper",`
        ${inp("vaperClientName","Nombre")}${inp("vaperClientPhone","Teléfono")}${ta("vaperClientHistory","Historial")}
        ${btn("Agregar cliente","addVaperClient()")}
        ${state.vaperClients.map(cl=>`<div class="list-item" style="display:flex;justify-content:space-between;align-items:flex-start">
          <div><strong>${esc(cl.name)}</strong> <span class="muted">${esc(cl.phone)}</span>
          <p class="muted">${esc(cl.history)}</p><p class="green">Total: ${money(cl.totalSpent)}</p></div>
          ${sm("🗑","deleteRecord('vaperClient','"+cl.id+"')","red")}
        </div>`).join("")}`)}`:""}`;
}

function filterVaper() {
  const q=(document.getElementById("vaperSearch")?.value||"").toLowerCase();
  const el=document.getElementById("vaperList");
  if(el) el.innerHTML=state.vaperInventory.filter(p=>p.product.toLowerCase().includes(q)||p.flavor.toLowerCase().includes(q)||(p.brand||"").toLowerCase().includes(q)).map(vaperProductHTML).join("");
}
function vaperProductHTML(p) {
  const gain=Number(p.price)-Number(p.cost); const low=Number(p.quantity)<=Number(p.minStock||3);
  return `<article class="card" style="${low?"border-color:rgba(255,204,77,.5)":""}">
    <span class="title">☁ ${esc(p.product)} ${low?`<span class="pill warn">⚠ Stock bajo (mín: ${p.minStock||3})</span>`:""}</span>
    <p>Marca: ${esc(p.brand)} | Sabor: ${esc(p.flavor)} | Tipo: ${esc(p.type)}</p>
    <p>Cantidad: <strong>${p.quantity}</strong> uds. | Costo: ${money(p.cost)} → Venta: ${money(p.price)}</p>
    <p class="green">Ganancia/ud: ${money(gain)} | Valor inventario: ${money(Number(p.quantity)*Number(p.cost))}</p>
    <div class="row" style="margin-top:8px">
      ${sm("✏ Editar","openEdit('vaperProduct','"+p.id+"')","")}
      ${sm("🗑","deleteRecord('vaperProduct','"+p.id+"')","red")}
    </div>
  </article>`;
}

/* =====================================================================
   BARBERÍA
   ===================================================================== */
function renderBarber() {
  const st=subTabs["barber"]||"agenda";
  const tabs2=[["agenda","📅 Agenda"],["clientes","👥 Clientes"],["servicios","💈 Servicios"],["empleados","👷 Empleados"]];
  const todayApts=state.barberAppointments.filter(a=>a.date===today());
  return `<h1 class="section-title">✂ Módulo Barbería</h1>
    <section class="grid-3">
      ${metric("📅","Citas",state.barberAppointments.length,"Total")}
      ${metric("👥","Clientes",state.barberClients.length,"Registrados")}
      ${metric("💈","Ingresos",money(barberIncome()),"Completadas")}
    </section>
    <div class="tab-scroll">${tabs2.map(([k,l])=>`<button class="tab-pill ${st===k?"active":""}" onclick="setSubTab('barber','${k}')">${l}</button>`).join("")}</div>
    ${st==="agenda"?`
      ${card("📅 Agenda de hoy",todayApts.length?todayApts.map(barberAptMiniHTML).join(""):`<div class="empty">Sin citas hoy</div>`)}
      ${card("➕ Agendar cita",`
        <div class="row">${inp("barberClient","Cliente")}${inp("barberPhone","Teléfono")}</div>
        ${inp("barberService","Servicio")}
        <div class="row">${inp("barberDate","Fecha","text",today())}${inp("barberTime","Hora")}${inp("barberPrice","Precio","number")}</div>
        <label>Barbero</label>
        ${sel("barberEmployeeSel",["(Sin asignar)",...state.barberEmployees.map(e=>e.name)],"(Sin asignar)")}
        ${btn("Agregar cita","addBarberAppointment()")}`)}
      <h2 class="section-title">Todas las citas</h2>
      <div class="search-box">${inp("barberSearch","Buscar cliente...")}${sm("🔍","filterBarber()","green")}</div>
      <div id="barberAptList">
        ${state.barberAppointments.map(a=>`<article class="card">
          <span class="title">✂ ${esc(a.client)} ${a.completed?'<span class="pill green">✅ Completada</span>':'<span class="pill warn">⏳ Pendiente</span>'}</span>
          <p>${esc(a.service)} | ${esc(a.date)} ${esc(a.time)}</p>
          <p class="green" style="font-weight:700">${money(a.price)}</p>
          <div class="row" style="margin-top:8px">
            ${!a.completed?sm("✅ Completar","completeBarberApt('"+a.id+"')","green"):""}
            ${sm("💬 WA","whatsappBarber('"+a.id+"')","green")}
            ${sm("✏","openEdit('barberApt','"+a.id+"')","")}
            ${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}
          </div>
        </article>`).join("")}
      </div>
      ${card("💰 Finanzas barbería",`
        <div class="row">${inp("barberExpense","Gasto","number")}${inp("barberExpenseDesc","Descripción del gasto")}</div>
        ${btn("Guardar gasto","addBarberExpense()")}
        <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
          <div><p class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.5px">Ingresos</p><p class="green" style="font-weight:900;font-size:18px">${money(barberIncome())}</p></div>
          <div><p class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.5px">Gastos</p><p style="color:var(--danger);font-weight:900;font-size:18px">${money(barberExpenseTotal())}</p></div>
          <div><p class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.5px">Ganancia</p><p class="green" style="font-weight:900;font-size:18px">${money(barberIncome()-barberExpenseTotal())}</p></div>
        </div>`)}` : ""}
    ${st==="clientes"?`
      ${card("👥 Agregar cliente",`
        <div class="row">${inp("barberClientName","Nombre")}${inp("barberClientPhone","Teléfono")}</div>
        ${ta("barberClientHistory","Historial de cortes")}
        ${ta("barberClientCutNotes","Notas del estilo")}
        <div class="row">${inp("barberClientFrequency","Frecuencia")}${inp("barberClientBirthday","Cumpleaños (YYYY-MM-DD)")}</div>
        ${btn("Agregar cliente","addBarberClient()")}`)
      }
      <div id="barberClientList">
        ${state.barberClients.map(cl=>`<div class="list-item">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%">
            <div>
              <strong>${esc(cl.name)}</strong>
              ${cl.birthday&&cl.birthday.slice(5)===today().slice(5)?'<span class="pill gold" style="margin-left:6px">🎂 Hoy!</span>':""}
              ${cl.birthday?`<span class="pill muted" style="font-size:10px;margin-left:4px">${esc(cl.birthday)}</span>`:""}
              <p class="muted" style="font-size:12px;margin-top:3px">${esc(cl.frequency||"")} | ${esc(cl.phone||"")}</p>
              ${cl.cutNotes?`<p class="muted" style="font-size:12px">✂ ${esc(cl.cutNotes)}</p>`:""}
            </div>
            <div class="row">${sm("💬","whatsappBarberClient('"+cl.id+"')","green")}${sm("✏","openEdit('barberClient','"+cl.id+"')","")}${sm("🗑","deleteRecord('barberClient','"+cl.id+"')","red")}</div>
          </div>
        </div>`).join("")}
      </div>` : ""}
    ${st==="servicios"?`
      ${card("💈 Servicios",`
        <div class="row">${inp("serviceName","Servicio")}${inp("servicePrice","Precio","number")}${inp("serviceDuration","Duración")}</div>
        ${btn("Agregar servicio","addBarberService()")}
        ${state.barberServices.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:9px 0">
          <span class="pill green">${esc(s.name)} • ${money(s.price)} • ${esc(s.duration)}</span>
          ${sm("🗑","deleteRecord('barberService','"+s.id+"')","red")}
        </div>`).join("")}`)}` : ""}
    ${st==="empleados"?`
      ${card("👷 Empleados",`
        <div class="row">${inp("employeeName","Nombre")}${inp("employeePercent","Comisión %","number")}</div>
        <div class="row">${inp("employeeSchedule","Horario")}${inp("employeePaid","Pagado","number")}</div>
        ${btn("Agregar empleado","addEmployee()")}
        ${state.barberEmployees.map(e=>{
          const empIncome=barberIncomeByEmployee(e.id);
          const empCommission=empIncome*Number(e.percent||0)/100;
          return `<div class="list-item">
            <div style="flex:1"><strong>${esc(e.name)}</strong> — ${e.percent}% comisión
            <p class="muted" style="font-size:12px">${esc(e.schedule||"")}</p>
            <p>Ingresos: ${money(empIncome)} | Comisión: <strong class="green">${money(empCommission)}</strong></p>
            <p>Pagado: ${money(e.paid)} | Pendiente: <strong class="green">${money(empCommission-Number(e.paid||0))}</strong></p></div>
            ${sm("🗑","deleteRecord('employee','"+e.id+"')","red")}
          </div>`;
        }).join("")}`)}` : ""}`;
}

function barberAptMiniHTML(a) {
  return `<div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
    <div><strong>${esc(a.client)}</strong> — ${esc(a.service)} <span class="muted">${esc(a.time)}</span></div>
    <div style="display:flex;align-items:center;gap:6px">
      <span class="pill green">${money(a.price)}</span>
      ${a.completed?`<span class="pill green">✅</span>`:sm("✅","completeBarberApt('"+a.id+"')","green")}
      ${sm("💬","whatsappBarber('"+a.id+"')","green")}
    </div>
  </div>`;
}
function completeBarberApt(id) {
  const apt=state.barberAppointments.find(a=>a.id===id);
  if(!apt||apt.completed) return;
  state.barberAppointments=state.barberAppointments.map(a=>a.id===id?{...a,completed:true}:a);
  state.moneyToday+=Number(apt.price||0);
  state.cashFlowEntries.push({id:uid(),type:"entrada",amount:Number(apt.price||0),description:`Cita: ${apt.client} - ${apt.service}`,date:today(),category:"Barbería"});
  saveState(); render(); showToast(`✅ Cita de ${apt.client} completada — ${money(apt.price)}`);
}
function filterBarber() {
  const q=(document.getElementById("barberSearch")?.value||"").toLowerCase();
  const el=document.getElementById("barberAptList");
  if(el) el.innerHTML=state.barberAppointments.filter(a=>a.client.toLowerCase().includes(q)).map(a=>`<article class="card">
    <span class="title">✂ ${esc(a.client)}</span>
    <p>${esc(a.service)} | ${esc(a.date)} ${esc(a.time)}</p>
    <p class="green">${money(a.price)}</p>
    <div class="row">${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}</div>
  </article>`).join("");
}
function whatsappBarber(aptId) {
  const a=state.barberAppointments.find(x=>x.id===aptId); if(!a) return;
  const msg=`Hola ${a.client} 💈, te recordamos tu cita el *${a.date}* a las *${a.time}* para *${a.service}*. Precio: *${money(a.price)}*. ¡Te esperamos!`;
  window.open(`https://wa.me/${(a.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappBarberClient(clientId) {
  const c=state.barberClients.find(x=>x.id===clientId); if(!c) return;
  const msg=`Hola ${c.name} 💈, te contactamos desde Cedano Barbería. ¿Deseas agendar una cita?`;
  window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

/* =====================================================================
   FINANZAS
   ===================================================================== */
function renderFinanzas() {
  const st=subTabs["finanzas"]||"flujo";
  const tabs2=[["flujo","💰 Flujo de Caja"],["cuentas","💳 Cuentas x Pagar"],["gastos","📊 Gastos Personales"],["objetivos","🎯 Objetivos"]];
  return `<h1 class="section-title">💳 Finanzas</h1>
    <div class="tab-scroll">${tabs2.map(([k,l])=>`<button class="tab-pill ${st===k?"active":""}" onclick="setSubTab('finanzas','${k}')">${l}</button>`).join("")}</div>
    ${st==="flujo"?renderFlujoCaja():""}
    ${st==="cuentas"?renderCuentasPagar():""}
    ${st==="gastos"?renderGastosPersonales():""}
    ${st==="objetivos"?renderObjetivos():""}`;
}

function renderFlujoCaja() {
  const cf=cashFlowToday();
  const allEntries=[...state.cashFlowEntries].reverse().slice(0,20);
  return `<section class="grid-3" style="margin-bottom:16px">
      ${metric("📥","Entradas",money(cf.inflow),"Hoy","green")}
      ${metric("📤","Salidas",money(cf.outflow),"Hoy")}
      ${metric("⚖","Neto",money(cf.net),"Hoy",cf.net>=0?"green":"")}
    </section>
    ${card("➕ Registrar movimiento",`
      ${sel("cfType",["entrada","salida"],"entrada")}
      ${inp("cfAmount","Monto","number")}
      ${inp("cfDesc","Descripción")}
      ${sel("cfCategory",["Barbería","Vaper","Préstamos","Gastos fijos","Personal","Otros"],"Otros")}
      ${inp("cfDate","Fecha","text",today())}
      ${btn("Registrar","addCashFlow()")}`)}
    ${card("📋 Movimientos recientes",allEntries.length?allEntries.map(e=>`
      <div class="flujo-row">
        <div><strong>${esc(e.description||"Sin descripción")}</strong><p class="muted" style="font-size:11px">${esc(e.category)} · ${esc(e.date)}</p></div>
        <div style="text-align:right;flex-shrink:0">
          <span style="font-weight:900;color:${e.type==="entrada"?"var(--neon)":"var(--danger)"}">${e.type==="entrada"?"+":"-"}${money(e.amount)}</span><br/>
          ${sm("🗑",`deleteCashFlow('${e.id}')`,"red")}
        </div>
      </div>`).join(""):`<div class="empty">Sin movimientos registrados</div>`}`;
}

function addCashFlow() {
  const amount=Number(document.getElementById("cfAmount")?.value||0); if(!amount) return;
  const type=document.getElementById("cfType")?.value||"entrada";
  state.cashFlowEntries.push({id:uid(),type,amount,description:document.getElementById("cfDesc")?.value||"",category:document.getElementById("cfCategory")?.value||"Otros",date:document.getElementById("cfDate")?.value||today()});
  if(type==="entrada") state.moneyToday+=amount;
  else state.moneySpent+=amount;
  saveState(); render(); showToast(`✅ ${type==="entrada"?"Entrada":"Salida"} de ${money(amount)} registrada`);
}
function deleteCashFlow(id) { state.cashFlowEntries=state.cashFlowEntries.filter(e=>e.id!==id); saveState(); render(); }

function renderCuentasPagar() {
  const pending=state.billsToPay.filter(b=>!b.paid);
  const paid=state.billsToPay.filter(b=>b.paid);
  const totalPend=pending.reduce((s,b)=>s+Number(b.amount||0),0);
  const billsVenc=billsOverdue();
  return `<div class="grid" style="margin-bottom:12px">
      ${metric("💳","Por pagar",money(totalPend),"Pendiente","warn")}
      ${metric("⚠","Vencidas",billsVenc.length,"Urgente","danger")}
    </div>
    ${card("➕ Agregar cuenta",`
      ${inp("billName","Nombre (ej: Alquiler, EDENORTE...)")}
      ${inp("billAmount","Monto","number")}
      <div class="row">${sel("billCurrency",["RD$","USD"],"RD$")}${sel("billCategory",["Alquiler","Servicios","Proveedores","Personal","Otros"],"Otros")}</div>
      ${inp("billDueDate","Fecha de vencimiento")}
      <label style="display:flex;align-items:center;gap:8px;margin-top:12px;cursor:pointer">
        <input type="checkbox" id="billRecurring" style="width:auto;margin:0;width:18px;height:18px"/>
        <span class="muted" style="font-size:13px">Recurrente (se reinicia cada mes)</span>
      </label>
      ${btn("Agregar cuenta","addBill()")}`)}
    <h2 class="section-title">Pendientes (${pending.length})</h2>
    ${pending.length?pending.map(b=>{
      const vencida=b.dueDate&&new Date(b.dueDate)<new Date()&&!b.paid;
      const proxima=!vencida&&b.dueDate&&(new Date(b.dueDate)-new Date())<3*24*60*60*1000;
      return `<div class="deuda-item ${vencida?"deuda-vencida":proxima?"deuda-proxima":""}">
        <div style="flex:1">
          <strong>${esc(b.name)}</strong>
          <p class="muted" style="font-size:12px;margin-top:2px">${esc(b.category)}${b.dueDate?` · Vence: ${esc(b.dueDate)}`:""}${b.recurring?" · 🔄 Recurrente":""}</p>
          ${vencida?`<span class="pill danger" style="margin-top:4px">⚠ Vencida</span>`:""}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <strong style="color:var(--danger);font-size:15px">${money(b.amount,b.currency)}</strong><br/>
          <div style="margin-top:6px;display:flex;gap:6px;justify-content:flex-end">
            ${sm("✅","markBillPaid('"+b.id+"')","green")}
            ${sm("🗑","deleteBill('"+b.id+"')","red")}
          </div>
        </div>
      </div>`;
    }).join(""):`<div class="empty">✅ Sin cuentas pendientes</div>`}
    ${paid.length?`<h2 class="section-title">Pagadas este mes (${paid.length})</h2>
      ${paid.map(b=>`<div class="deuda-item" style="opacity:.6">
        <div style="flex:1"><strong>${esc(b.name)}</strong><p class="muted" style="font-size:12px">${esc(b.category)}${b.paidDate?` · Pagado: ${esc(b.paidDate)}`:""}</p></div>
        <span class="pill green">${money(b.amount,b.currency)}</span>
      </div>`).join("")}`:""}`
}

function addBill() {
  const name=document.getElementById("billName")?.value.trim(); if(!name) return;
  state.billsToPay.push({id:uid(),name,amount:Number(document.getElementById("billAmount")?.value||0),currency:document.getElementById("billCurrency")?.value||"RD$",category:document.getElementById("billCategory")?.value||"Otros",dueDate:document.getElementById("billDueDate")?.value||"",recurring:document.getElementById("billRecurring")?.checked||false,paid:false,paidDate:""});
  saveState(); render(); showToast("✅ Cuenta agregada");
}
function markBillPaid(id) {
  state.billsToPay=state.billsToPay.map(b=>b.id===id?{...b,paid:true,paidDate:today()}:b);
  const bill=state.billsToPay.find(b=>b.id===id);
  if(bill){
    state.cashFlowEntries.push({id:uid(),type:"salida",amount:Number(bill.amount||0),description:`Pago: ${bill.name}`,date:today(),category:bill.category});
    state.moneySpent+=Number(bill.amount||0);
  }
  saveState(); render(); showToast("✅ Cuenta marcada como pagada");
}
function deleteBill(id) { state.billsToPay=state.billsToPay.filter(b=>b.id!==id); saveState(); render(); }

function renderGastosPersonales() {
  const cats=Object.keys(state.personalBudgets);
  const totalBudget=Object.values(state.personalBudgets).reduce((s,v)=>s+Number(v||0),0);
  const totalGastos=totalPersonalExpenses();
  const catColors=["#22d468","#4db5ff","#c084fc","#f59e0b","#ff4d5e","#fb7185","#34d399"];
  return `<div class="grid" style="margin-bottom:12px">
      ${metric("📊","Gastado este mes",money(totalGastos),"")}
      ${metric("💰","Presupuesto",money(totalBudget),"")}
    </div>
    <div class="progress" style="margin-bottom:14px"><span style="width:${totalBudget?Math.min(100,Math.round(totalGastos/totalBudget*100)):0}%;background:${totalGastos>totalBudget?"var(--danger)":"var(--neon)"}"></span></div>
    ${card("➕ Registrar gasto",`
      ${inp("pgAmount","Monto","number")}
      ${sel("pgCategory",cats,"Comida")}
      ${inp("pgDesc","Descripción")}
      ${inp("pgDate","Fecha","text",today())}
      ${btn("Guardar gasto","addPersonalExpense()")}`)}
    ${card("📊 Por categoría",cats.map((cat,i)=>{
      const gastado=personalExpensesByCategory(cat);
      const budget=Number(state.personalBudgets[cat]||0);
      const pct=budget?Math.min(100,Math.round(gastado/budget*100)):0;
      return `<div class="gasto-cat">
        <div style="width:88px;font-size:12px;font-weight:700;flex-shrink:0">${cat}</div>
        <div class="gasto-bar-wrap"><div class="gasto-bar-fill" style="width:${pct}%;background:${catColors[i%catColors.length]}"></div></div>
        <div style="width:95px;text-align:right;font-size:12px;flex-shrink:0">${money(gastado)}<br/><span class="muted">${money(budget)}</span></div>
      </div>`;
    }).join(""))}
    ${card("✏ Ajustar presupuesto",cats.map(cat=>`<label>${cat}</label>${inp("budget-"+cat,"Presupuesto RD$","number",state.personalBudgets[cat]||0)}`).join("")+btn("Guardar presupuesto","savePersonalBudgets()"))}
    <h2 class="section-title">Gastos recientes</h2>
    ${state.personalExpenses.length?[...state.personalExpenses].reverse().slice(0,15).map(e=>`
      <div class="flujo-row">
        <div><strong>${esc(e.description||e.category)}</strong><p class="muted" style="font-size:11px">${esc(e.category)} · ${esc(e.date)}</p></div>
        <div style="text-align:right;flex-shrink:0"><span style="color:var(--danger);font-weight:900">${money(e.amount)}</span><br/>${sm("🗑","deletePersonalExpense('"+e.id+"')","red")}</div>
      </div>`).join(""):`<div class="empty">Sin gastos registrados</div>`}`;
}

function addPersonalExpense() {
  const amount=Number(document.getElementById("pgAmount")?.value||0); if(!amount) return;
  state.personalExpenses.push({id:uid(),amount,category:document.getElementById("pgCategory")?.value||"Otros",description:document.getElementById("pgDesc")?.value||"",date:document.getElementById("pgDate")?.value||today()});
  state.cashFlowEntries.push({id:uid(),type:"salida",amount,description:document.getElementById("pgDesc")?.value||document.getElementById("pgCategory")?.value||"Gasto personal",date:today(),category:"Personal"});
  state.moneySpent+=amount;
  saveState(); render(); showToast(`💸 Gasto de ${money(amount)} registrado`);
}
function deletePersonalExpense(id) { state.personalExpenses=state.personalExpenses.filter(e=>e.id!==id); saveState(); render(); }
function savePersonalBudgets() {
  Object.keys(state.personalBudgets).forEach(cat=>{
    const val=Number(document.getElementById("budget-"+cat)?.value||0);
    state.personalBudgets[cat]=val;
  });
  saveState(); render(); showToast("✅ Presupuesto actualizado");
}

function renderObjetivos() {
  return `${card("➕ Nuevo objetivo",`
      ${inp("objName","Nombre del objetivo")}
      <div class="row">${inp("objTarget","Meta RD$","number")}${inp("objCurrent","Ahorrado hasta ahora","number")}</div>
      ${inp("objDeadline","Fecha límite (opcional)")}
      ${sel("objIcon",["🎯","🏠","✈","🚗","💰","📚","🛡","✂","🏋","💎"],"🎯")}
      ${btn("Agregar objetivo","addObjective()")}`)}
    <h2 class="section-title">Mis objetivos</h2>
    ${state.objectives.length?state.objectives.map(obj=>{
      const pct=obj.target?Math.min(100,Math.round(Number(obj.current)/Number(obj.target)*100)):0;
      const remaining=Math.max(0,Number(obj.target)-Number(obj.current));
      return `<div class="objetivo-item">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:26px">${obj.icon||"🎯"}</span>
            <div><strong>${esc(obj.name)}</strong>${obj.deadline?`<p class="muted" style="font-size:11px;margin-top:2px">📅 ${esc(obj.deadline)}</p>`:""}</div>
          </div>
          <span class="pill ${pct>=100?"green":"blue"}">${pct}%</span>
        </div>
        <div class="objetivo-progress"><div class="objetivo-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:10px">
          <span class="green">${money(obj.current)} ahorrado</span>
          <span class="muted">Faltan ${money(remaining)}</span>
        </div>
        <div class="row">
          ${inp("objAdd-"+obj.id,"Agregar ahorro...","number")}
          ${sm("➕ Abonar","addToObjective('"+obj.id+"')","green")}
          ${sm("🗑","deleteObjective('"+obj.id+"')","red")}
        </div>
      </div>`;
    }).join(""):`<div class="empty">Sin objetivos. Crea uno arriba.</div>`}`;
}

function addObjective() {
  const name=document.getElementById("objName")?.value.trim(); if(!name) return;
  state.objectives.push({id:uid(),name,target:Number(document.getElementById("objTarget")?.value||0),current:Number(document.getElementById("objCurrent")?.value||0),deadline:document.getElementById("objDeadline")?.value||"",icon:document.getElementById("objIcon")?.value||"🎯",color:"#22d468"});
  saveState(); render(); showToast("✅ Objetivo creado");
}
function addToObjective(id) {
  const amount=Number(document.getElementById("objAdd-"+id)?.value||0); if(!amount) return;
  state.objectives=state.objectives.map(o=>o.id===id?{...o,current:Number(o.current)+amount}:o);
  saveState(); render();
  const obj=state.objectives.find(o=>o.id===id);
  if(obj&&Number(obj.current)>=Number(obj.target)) showToast("🎉 ¡Objetivo completado!");
  else showToast(`✅ +${money(amount)} ahorrado al objetivo`);
}
function deleteObjective(id) {
  if(!confirm("¿Eliminar objetivo?")) return;
  state.objectives=state.objectives.filter(o=>o.id!==id);
  saveState(); render();
}

/* =====================================================================
   IMPERIO
   ===================================================================== */
function renderImperio() {
  const total=patrimonyTotal();
  const xpPct=Math.min(100,Math.round(state.xp/nextRankXP()*100));
  const habitsCompleted=state.habits.filter(h=>h.done).length;
  const discipline=Math.round(habitsCompleted/Math.max(1,state.habits.length)*100);
  const hist90=state.history.slice(0,90);
  const bestDay=hist90.length?hist90.reduce((best,d)=>Number(d.moneyToday)>Number(best.moneyToday)?d:best,hist90[0]):null;
  const avgMoney=hist90.length?hist90.reduce((s,d)=>s+Number(d.moneyToday||0),0)/hist90.length:0;
  const avgDiscipline=hist90.length?Math.round(hist90.reduce((s,d)=>s+(d.discipline||0),0)/hist90.length):0;
  const last7=state.history.slice(0,7);
  return `<div class="imperio-hero">
      <div class="imperio-rank">${rankIcon()}</div>
      <div class="imperio-name">${esc(state.userName)} — ${rank()}</div>
      <div class="imperio-sub">${esc(state.businessName)}</div>
    </div>
    <div class="card">
      <div class="row" style="margin-bottom:6px"><span class="label">XP: ${state.xp}</span><span class="label" style="text-align:right;flex:1">Próximo: ${nextRankXP()} XP</span></div>
      <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
    </div>
    <section class="grid">
      ${metric("💰","Patrimonio",money(total),"Total")}
      ${metric("📈","Disciplina",discipline+"%","Hoy")}
      ${metric("⚔","XP",state.xp,"Puntos")}
      ${metric("🏆","Rango",rank(),"Nivel")}
    </section>
    ${hist90.length?card("📊 Estadísticas 90 días",`
      <div class="grid-3">
        ${metric("💵","Mejor día",bestDay?money(bestDay.moneyToday):"—","Registrado")}
        ${metric("📈","Promedio",money(avgMoney),"Diario")}
        ${metric("🧠","Disciplina",avgDiscipline+"%","Promedio")}
      </div>
      <div class="chart-wrap" style="margin-top:12px"><canvas id="chartHistory90"></canvas></div>`):""}
    ${card("📊 Ganancias diarias",`<div class="chart-wrap"><canvas id="chartDaily"></canvas></div>`)}
    ${card("📈 Comparación mensual",`<div class="chart-wrap"><canvas id="chartMonthly"></canvas></div>`)}
    ${card("🏢 Por negocio",`<div class="chart-wrap"><canvas id="chartBusiness"></canvas></div>`)}
    ${card("💰 Patrimonio desglosado",patrimonioHTML())}
    ${card("🎯 Metas anuales",`
      <p>💰 Patrimonio: Meta RD$2,000,000 — actual ${money(total)}</p>
      <div class="progress" style="margin-top:6px"><span style="width:${Math.min(100,Math.round(total/2000000*100))}%"></span></div>
      <p style="margin-top:10px">📊 Objetivos activos: ${state.objectives.filter(o=>Number(o.current)<Number(o.target)).length}</p>
      <p>🏢 Préstamos: ${state.loans.length} | Vapers: ${state.vaperInventory.length} prods | Barbería: ${state.barberClients.length} clientes</p>`)}
    <h2 class="section-title">📅 Historial</h2>
    ${card("📅 Calendario",renderCalendar())}
    ${last7.length?card("📋 Últimos 7 días",last7.map(dayHTML).join("")):""}
    <h2 class="section-title">📤 Exportar</h2>
    ${card("",`
      <div class="backup-bar">
        ${btn("📤 Exportar backup","exportBackup()","secondary")}
        ${btn("📥 Importar backup","importBackupTrigger()","secondary")}
      </div>
      <input type="file" id="importFile" accept=".json" style="display:none" onchange="importBackup(this)"/>
      <div class="row">
        ${btn("📊 CSV Préstamos","exportCSV('loans')","secondary")}
        ${btn("📊 CSV Ventas Vaper","exportCSV('vaper')","secondary")}
      </div>
      ${btn("🖨 Imprimir reporte","printReport()","secondary")}`)}
    <h2 class="section-title">🏆 Logros</h2>
    ${state.achievements.map(a=>`<div class="achievement${a.unlocked?" unlocked":" locked"}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-info"><strong>${esc(a.title)}</strong><small>${esc(a.desc)}</small></div>
      ${a.unlocked?'<span class="pill gold">✔</span>':'<span class="pill">🔒</span>'}
    </div>`).join("")}
    <h2 class="section-title">⚙ Configuración</h2>
    ${renderNotifCard()}
    ${card("",`
      ${inp("profileName","Tu nombre","text",state.userName)}
      ${inp("profileBusiness","Nombre del negocio","text",state.businessName)}
      ${inp("profileCapital","Capital en efectivo","number",state.capital)}
      ${inp("usdRateInput","Tasa USD → RD$","number",state.usdRate)}
      ${btn("Guardar configuración","saveProfile()")}
      ${btn("👋 Ver onboarding","openOnboard()","secondary")}
      ${btn("🗑 Reiniciar todos los datos","resetData()","danger-btn")}`)}
    ${card("🔒 Seguridad PIN",`
      ${inp("newPin","PIN de 4 dígitos","number")}
      ${btn(state.pinEnabled?"Actualizar PIN":"Activar PIN","savePin()")}
      ${state.pinEnabled?btn("Desactivar PIN","disablePin()","danger-btn"):""}`)}
    ${card("⚙ Alertas",`
      <label>Días de atraso para alerta de mora</label>
      ${inp("notifOverdueDays","Días","number",state.notifSettings?.loanOverdueDays||3)}
      ${btn("Guardar alertas","saveNotifSettings()")}`)}`;
}

function dayHTML(day) {
  return `<article class="card" style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span class="title" style="margin:0">📅 ${esc(day.date)}</span>
      <span class="pill ${day.status==="Excelente"||day.status==="Bueno"?"green":day.status==="Regular"?"warn":"danger"}">${day.status}</span>
    </div>
    <p>✅ ${day.completed} completadas | ⏳ ${day.pending} pendientes</p>
    <p>💵 ${money(day.moneyToday)} generado | 💸 ${money(day.moneySpent)} gastos</p>
    <p class="green">Disciplina: ${day.discipline||0}%</p>
    ${day.note?`<p class="muted" style="font-size:12px;margin-top:4px">${esc(day.note)}</p>`:""}
  </article>`;
}

function renderCalendar() {
  const months=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const weekDays=["L","M","M","J","V","S","D"];
  const firstDay=new Date(calendarYear,calendarMonth,1);
  const lastDay=new Date(calendarYear,calendarMonth+1,0);
  let startDow=firstDay.getDay(); if(startDow===0) startDow=7;
  const todayStr=today();
  const eventsByDate={};
  state.calendarEvents.forEach(e=>{if(!eventsByDate[e.date])eventsByDate[e.date]=[];eventsByDate[e.date].push(e);});
  state.barberAppointments.forEach(a=>{if(!eventsByDate[a.date])eventsByDate[a.date]=[];eventsByDate[a.date].push({type:"cita",title:a.client});});
  state.loans.forEach(l=>{if(!l.dueDate)return;if(!eventsByDate[l.dueDate])eventsByDate[l.dueDate]=[];eventsByDate[l.dueDate].push({type:"cobro",title:"Vence: "+l.client});});
  state.billsToPay.forEach(b=>{if(!b.dueDate||b.paid)return;if(!eventsByDate[b.dueDate])eventsByDate[b.dueDate]=[];eventsByDate[b.dueDate].push({type:"pago",title:"Pagar: "+b.name});});
  let cells=[];
  for(let i=1;i<startDow;i++) cells.push({empty:true});
  for(let d=1;d<=lastDay.getDate();d++){
    const ds=`${calendarYear}-${String(calendarMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({d,ds,events:eventsByDate[ds]||[],isToday:ds===todayStr});
  }
  while(cells.length%7!==0) cells.push({empty:true});
  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <button class="small-btn" onclick="prevMonth()">◀</button>
      <strong style="font-size:14px">${months[calendarMonth]} ${calendarYear}</strong>
      <button class="small-btn" onclick="nextMonth()">▶</button>
    </div>
    <div class="cal-grid">
      ${weekDays.map(d=>`<div style="text-align:center;font-size:11px;color:var(--muted);font-weight:800;padding-bottom:5px">${d}</div>`).join("")}
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
    {label:"Inventario Vaper",val:vaperInventoryValue()},
    {label:"Ganancia Vaper",val:vaperGain()},
    {label:"Ahorros / Objetivos",val:state.objectives.reduce((s,o)=>s+Number(o.current||0),0)+Number(state.savings||0)}
  ];
  const total=patrimonyTotal();
  return `<div style="margin-bottom:14px">
      <p class="label">Patrimonio Total</p>
      <p style="font-size:30px;font-weight:900;color:var(--neon)">${money(total)}</p>
    </div>
    ${items.map(i=>`<div class="pat-row">
      <div class="pat-label">${i.label}</div>
      <div class="pat-bar"><div class="pat-fill" style="width:${total?Math.round(i.val/total*100):0}%"></div></div>
      <div class="pat-val">${money(i.val)}</div>
    </div>`).join("")}
    <div style="margin-top:16px">
      ${inp("capitalInput","Efectivo disponible","number",state.capital)}
      ${inp("savingsInput","Ahorros","number",state.savings)}
      ${btn("Actualizar patrimonio","updatePatrimony()")}
    </div>`;
}

function initCharts() {
  const days=["L","M","M","J","V","S","D"];
  const months=["Ene","Feb","Mar","Abr","May","Jun"];
  const tickColor="rgba(107,127,143,.8)";
  const gridColor="rgba(30,42,53,.8)";
  const baseOpts={
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false}},
    scales:{
      x:{grid:{color:gridColor},ticks:{color:tickColor,font:{size:11}}},
      y:{grid:{color:gridColor},ticks:{color:tickColor,font:{size:11},callback:v=>"RD$"+Number(v).toLocaleString()}}
    }
  };
  const dEl=document.getElementById("chartDaily");
  if(dEl) chartInstances.daily=new Chart(dEl,{type:"bar",data:{labels:days,datasets:[{data:state.dailyRevenue,backgroundColor:"rgba(34,212,104,.75)",borderRadius:7,borderSkipped:false}]},options:{...baseOpts}});
  const mEl=document.getElementById("chartMonthly");
  if(mEl) chartInstances.monthly=new Chart(mEl,{type:"line",data:{labels:months,datasets:[{label:"Este mes",data:state.monthlyRevenue,borderColor:"#22d468",backgroundColor:"rgba(34,212,104,.12)",fill:true,tension:.4,pointBackgroundColor:"#22d468",pointRadius:3},{label:"Mes anterior",data:state.prevMonthRevenue||[],borderColor:"#4db5ff",backgroundColor:"rgba(77,181,255,.06)",fill:true,tension:.4,borderDash:[5,4],pointRadius:2}]},options:{...baseOpts,plugins:{legend:{display:true,labels:{color:tickColor,font:{size:11}}}}}});
  const bEl=document.getElementById("chartBusiness");
  if(bEl) chartInstances.biz=new Chart(bEl,{type:"doughnut",data:{labels:["Préstamos","Vaper","Barbería"],datasets:[{data:[totalLoanBalance(),vaperGain(),barberIncome()],backgroundColor:["#22d468","#4db5ff","#c084fc"],borderColor:"transparent",borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tickColor,font:{size:11},padding:16}}}}});
  const h90El=document.getElementById("chartHistory90");
  if(h90El){
    const hist=state.history.slice(0,30).reverse();
    chartInstances.hist90=new Chart(h90El,{type:"line",data:{labels:hist.map(d=>d.date.slice(5)),datasets:[{label:"Generado",data:hist.map(d=>Number(d.moneyToday||0)),borderColor:"#22d468",backgroundColor:"rgba(34,212,104,.1)",fill:true,tension:.4,pointRadius:2}]},options:{...baseOpts,plugins:{legend:{display:false}}}});
  }
}

/* =====================================================================
   EDIT MODAL
   ===================================================================== */
function openEdit(type, id) {
  editingType=type; editingId=id;
  const m=document.getElementById("editModal");
  const h=document.getElementById("editTitle");
  const c=document.getElementById("editContent");
  if(!m||!h||!c) return;
  if(type==="task"){
    const t=state.tasks.find(x=>x.id===id); if(!t) return;
    h.textContent="✏ Editar tarea";
    c.innerHTML=`<div class="edit-form">
      <label>Texto</label>${inp("eText","Texto","text",t.text)}
      <label>Tipo</label>${sel("eType",["Diario","Semanal","Mensual"],t.type)}
      <label>Prioridad</label>${sel("ePriority",["Baja","Media","Alta","Urgente"],t.priority)}
      <label>Fecha</label>${inp("eDate","Fecha","text",t.date)}
      <label>Hora</label>${inp("eTime","Hora","text",t.time)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if(type==="loan"){
    const l=state.loans.find(x=>x.id===id); if(!l) return;
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
  } else if(type==="loanClient"){
    const c2=state.loanClients.find(x=>x.id===id); if(!c2) return;
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
  } else if(type==="vaperProduct"){
    const p=state.vaperInventory.find(x=>x.id===id); if(!p) return;
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
  } else if(type==="barberApt"){
    const a=state.barberAppointments.find(x=>x.id===id); if(!a) return;
    h.textContent="✏ Editar cita";
    c.innerHTML=`<div class="edit-form">
      <label>Cliente</label>${inp("eClient","Cliente","text",a.client)}
      <label>Servicio</label>${inp("eService","Servicio","text",a.service)}
      <label>Fecha</label>${inp("eDate","Fecha","text",a.date)}
      <label>Hora</label>${inp("eTime","Hora","text",a.time)}
      <label>Precio</label>${inp("ePrice","Precio","number",a.price)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if(type==="barberClient"){
    const bc=state.barberClients.find(x=>x.id===id); if(!bc) return;
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
  const g = id => { const el=document.getElementById(id); return el?el.value:""; };
  if(editingType==="task")
    state.tasks=state.tasks.map(t=>t.id!==editingId?t:{...t,text:g("eText"),type:g("eType"),priority:g("ePriority"),date:g("eDate"),time:g("eTime")});
  else if(editingType==="loan")
    state.loans=state.loans.map(l=>l.id!==editingId?l:{...l,client:g("eClient"),capital:Number(g("eCapital")),interest:Number(g("eInterest")),startDate:g("eStart"),dueDate:g("eDue"),frequency:g("eFreq"),paid:Number(g("ePaid"))});
  else if(editingType==="loanClient")
    state.loanClients=state.loanClients.map(c=>c.id!==editingId?c:{...c,name:g("eName"),cedula:g("eCedula"),phone:g("ePhone"),address:g("eAddress"),reference:g("eRef"),notes:g("eNotes")});
  else if(editingType==="vaperProduct")
    state.vaperInventory=state.vaperInventory.map(p=>p.id!==editingId?p:{...p,product:g("eProd"),brand:g("eBrand"),flavor:g("eFlavor"),quantity:Number(g("eQty")),cost:Number(g("eCost")),price:Number(g("ePrice")),minStock:Number(g("eMinStock")||3)});
  else if(editingType==="barberApt")
    state.barberAppointments=state.barberAppointments.map(a=>a.id!==editingId?a:{...a,client:g("eClient"),service:g("eService"),date:g("eDate"),time:g("eTime"),price:Number(g("ePrice"))});
  else if(editingType==="barberClient")
    state.barberClients=state.barberClients.map(c=>c.id!==editingId?c:{...c,name:g("eBcName"),phone:g("eBcPhone"),history:g("eBcHistory"),cutNotes:g("eBcCutNotes"),frequency:g("eBcFreq"),birthday:g("eBcBday")});
  saveState(); closeEditModal(); render(); showToast("✅ Cambios guardados");
}

/* =====================================================================
   ELIMINAR
   ===================================================================== */
function deleteRecord(type, id) {
  if(!confirm("¿Eliminar este registro?")) return;
  if(type==="task")          state.tasks=state.tasks.filter(x=>x.id!==id);
  else if(type==="loan")     state.loans=state.loans.filter(x=>x.id!==id);
  else if(type==="loanClient") state.loanClients=state.loanClients.filter(x=>x.id!==id);
  else if(type==="vaperProduct") state.vaperInventory=state.vaperInventory.filter(x=>x.id!==id);
  else if(type==="vaperClient")  state.vaperClients=state.vaperClients.filter(x=>x.id!==id);
  else if(type==="barberApt")    state.barberAppointments=state.barberAppointments.filter(x=>x.id!==id);
  else if(type==="barberClient") state.barberClients=state.barberClients.filter(x=>x.id!==id);
  else if(type==="barberService") state.barberServices=state.barberServices.filter(x=>x.id!==id);
  else if(type==="employee")     state.barberEmployees=state.barberEmployees.filter(x=>x.id!==id);
  saveState(); render();
}
function deleteHabit(id)  { state.habits=state.habits.filter(h=>h.id!==id); saveState(); render(); }
function deleteContact(id){ state.contacts=state.contacts.filter(c=>c.id!==id); saveState(); render(); }

/* =====================================================================
   ACCIONES
   ===================================================================== */
function saveMission() {
  const v=document.getElementById("missionInput")?.value.trim();
  if(!v){ showToast("❌ Escribe una misión primero","err"); return; }
  setState({mission:v}); showToast("✅ Misión guardada");
}
function completeMission() { setState({xp:state.xp+50}); showToast("⚔ +50 XP — ¡Misión completada!"); }
function updatePatrimony() {
  setState({
    capital:Number(document.getElementById("capitalInput")?.value||state.capital),
    savings:Number(document.getElementById("savingsInput")?.value||state.savings)
  });
  showToast("✅ Patrimonio actualizado");
}
function saveProfile() {
  setState({
    userName:document.getElementById("profileName")?.value||state.userName,
    businessName:document.getElementById("profileBusiness")?.value||state.businessName,
    capital:Number(document.getElementById("profileCapital")?.value||state.capital),
    usdRate:Number(document.getElementById("usdRateInput")?.value||state.usdRate)
  });
  showToast("✅ Configuración guardada");
}
function saveNotifSettings() {
  const days=Number(document.getElementById("notifOverdueDays")?.value||3);
  state.notifSettings={...state.notifSettings,loanOverdueDays:days};
  saveState(); render(); showToast("✅ Alertas guardadas");
}
function addHabit() {
  const t=document.getElementById("newHabitInput")?.value.trim(); if(!t) return;
  state.habits.push({id:uid(),text:t,done:false,streak:0,lastDone:""});
  saveState(); render(); showToast("✅ Hábito agregado");
}
function toggleHabit(id) {
  state.habits=state.habits.map(h=>{
    if(h.id!==id) return h;
    const done=!h.done;
    if(done) state.xp+=5;
    return{...h,done,streak:done?h.streak+1:Math.max(0,h.streak-1),lastDone:done?today():h.lastDone};
  });
  saveState(); render();
}
function addTask() {
  const text=document.getElementById("taskText")?.value.trim(); if(!text) return;
  state.tasks.push({
    id:uid(),text,
    type:document.getElementById("taskType")?.value||"Diario",
    date:document.getElementById("taskDate")?.value||"",
    time:document.getElementById("taskTime")?.value||"",
    priority:document.getElementById("taskPriority")?.value||"Media",
    done:false,completedAt:""
  });
  saveState(); render(); showToast("✅ Tarea agregada");
}
function toggleTask(id) {
  const now=new Date();
  const timeStr=now.toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"});
  state.tasks=state.tasks.map(t=>{
    if(t.id!==id) return t;
    const done=!t.done;
    if(done) state.xp+=10;
    return{...t,done,completedAt:done?timeStr:""};
  });
  saveState(); render();
}
function saveTomorrowPlan() {
  const task=document.getElementById("tomorrowTask")?.value.trim();
  const reminder=document.getElementById("tomorrowReminder")?.value.trim();
  state.tomorrow.mission=document.getElementById("tomorrowMission")?.value||"";
  state.tomorrow.moneyGoal=document.getElementById("tomorrowGoal")?.value||"";
  if(task) state.tomorrow.tasks.push({id:uid(),text:task,done:false});
  if(reminder) state.tomorrow.reminders.push({id:uid(),text:reminder});
  saveState(); render(); showToast("✅ Plan de mañana guardado");
}
function addLoanClient() {
  const name=document.getElementById("clientName")?.value.trim(); if(!name) return;
  state.loanClients.push({
    id:uid(),name,photo:"",
    cedula:document.getElementById("clientCedula")?.value||"",
    phone:document.getElementById("clientPhone")?.value||"",
    address:document.getElementById("clientAddress")?.value||"",
    reference:document.getElementById("clientReference")?.value||"",
    notes:document.getElementById("clientNotes")?.value||"",
    lastVisit:today()
  });
  saveState(); render(); showToast("✅ Cliente agregado");
}
function addContact() {
  const name=document.getElementById("contactName")?.value.trim(); if(!name) return;
  state.contacts.push({
    id:uid(),name,
    phone:document.getElementById("contactPhone")?.value||"",
    address:document.getElementById("contactAddress")?.value||"",
    source:document.getElementById("contactSource")?.value||"",
    note:document.getElementById("contactNote")?.value||"",
    priority:document.getElementById("contactPriority")?.value||"Media",
    status:"Pendiente"
  });
  saveState(); render();
}
function updateContactStatus(id) {
  const status=document.getElementById("status-"+id)?.value;
  state.contacts=state.contacts.map(c=>c.id===id?{...c,status}:c);
  saveState(); render();
}
function addLoan() {
  const client=document.getElementById("loanClient")?.value.trim();
  const capital=Number(document.getElementById("loanCapital")?.value);
  if(!client||!capital){ showToast("❌ Completa cliente y capital","err"); return; }
  state.loans.push({
    id:uid(),client,capital,
    interest:Number(document.getElementById("loanInterest")?.value||0),
    currency:loanCurrency,
    startDate:document.getElementById("loanStartDate")?.value||today(),
    dueDate:document.getElementById("loanDueDate")?.value||"",
    frequency:document.getElementById("loanFrequency")?.value||"Semanal",
    paid:0,lateDays:0,status:"Al día"
  });
  saveState(); render(); showToast("✅ Préstamo registrado");
}
function updateLoanStatus(id) {
  const status=document.getElementById("loanstatus-"+id)?.value;
  if(status==="Cancelado"){ archiveLoan(id); return; }
  state.loans=state.loans.map(l=>l.id===id?{...l,status}:l);
  saveState(); render();
}
function addPayment() {
  const client=document.getElementById("paymentLoan")?.value.trim();
  const amount=Number(document.getElementById("paymentAmount")?.value);
  if(!client||!amount){ showToast("❌ Completa cliente y monto","err"); return; }
  const loan=state.loans.find(l=>l.client.toLowerCase()===client.toLowerCase());
  if(!loan){ showToast("❌ Cliente no encontrado","err"); return; }
  const balance=loanBalance(loan);
  if(amount>balance+0.01){ showToast(`❌ Excede el balance (${loanBalanceMoney(loan)})`,"err"); return; }
  state.payments.push({id:uid(),client,amount,date:document.getElementById("paymentDate")?.value||today()});
  state.loans=state.loans.map(l=>l.client.toLowerCase()===client.toLowerCase()?{...l,paid:Number(l.paid||0)+amount}:l);
  state.moneyToday+=amount;
  state.cashFlowEntries.push({id:uid(),type:"entrada",amount,description:`Pago préstamo: ${client}`,date:today(),category:"Préstamos"});
  const updatedBalance=loanBalance({...loan,paid:Number(loan.paid||0)+amount});
  if(updatedBalance<=0.01) setTimeout(()=>{ if(confirm(`✅ ${client} pagó completo. ¿Archivar?`)) archiveLoan(loan.id); },300);
  saveState(); render(); showToast(`✅ Pago de ${money(amount)} registrado`);
}
function addVaperProduct() {
  const product=document.getElementById("vpProduct")?.value.trim(); if(!product) return;
  state.vaperInventory.push({
    id:uid(),product,
    brand:document.getElementById("vpBrand")?.value||"",
    model:document.getElementById("vpModel")?.value||"",
    type:document.getElementById("vpType")?.value||"Desechable",
    flavor:document.getElementById("vpFlavor")?.value||"",
    quantity:Number(document.getElementById("vpQty")?.value||0),
    cost:Number(document.getElementById("vpCost")?.value||0),
    price:Number(document.getElementById("vpPrice")?.value||0),
    minStock:Number(document.getElementById("vpMinStock")?.value||3)
  });
  saveState(); render(); showToast("✅ Producto agregado");
}
function addVaperSale() {
  const productName=document.getElementById("saleProduct")?.value;
  if(!productName){ showToast("❌ Selecciona un producto","err"); return; }
  const item=state.vaperInventory.find(p=>p.product===productName);
  const qty=Number(document.getElementById("saleQty")?.value||1);
  if(!item){ showToast("❌ Producto no encontrado","err"); return; }
  if(Number(item.quantity)<qty){ showToast(`❌ Stock insuficiente (hay ${item.quantity})`,"err"); return; }
  const gain=(Number(item.price)-Number(item.cost))*qty;
  const income=Number(item.price)*qty;
  state.vaperSales.push({
    id:uid(),
    client:document.getElementById("saleClient")?.value||"",
    product:productName,quantity:qty,
    date:document.getElementById("saleDate")?.value||today(),
    method:document.getElementById("saleMethod")?.value||"Efectivo",
    gain
  });
  item.quantity=Math.max(0,Number(item.quantity)-qty);
  state.moneyToday+=income;
  state.cashFlowEntries.push({id:uid(),type:"entrada",amount:income,description:`Venta vaper: ${productName}`,date:today(),category:"Vaper"});
  if(state.vaperSales.length===1){
    state.achievements=state.achievements.map(a=>a.id==="a1"?{...a,unlocked:true}:a);
    showToast("🥉 ¡Logro desbloqueado: Primera venta!");
  } else {
    showToast(`✅ Venta registrada — ganancia ${money(gain)}`);
  }
  saveState(); render();
}
function addVaperClient() {
  const name=document.getElementById("vaperClientName")?.value.trim(); if(!name) return;
  state.vaperClients.push({
    id:uid(),name,
    phone:document.getElementById("vaperClientPhone")?.value||"",
    history:document.getElementById("vaperClientHistory")?.value||"",
    totalSpent:0
  });
  saveState(); render();
}
function addBarberAppointment() {
  const client=document.getElementById("barberClient")?.value.trim(); if(!client) return;
  const price=Number(document.getElementById("barberPrice")?.value||0);
  const empName=document.getElementById("barberEmployeeSel")?.value||"";
  const emp=state.barberEmployees.find(e=>e.name===empName);
  state.barberAppointments.push({
    id:uid(),client,
    phone:document.getElementById("barberPhone")?.value||"",
    service:document.getElementById("barberService")?.value||"",
    date:document.getElementById("barberDate")?.value||today(),
    time:document.getElementById("barberTime")?.value||"",
    price,reminder:true,completed:false,
    employeeId:emp?.id||""
  });
  saveState(); render(); showToast("✅ Cita agendada");
}
function addBarberClient() {
  const name=document.getElementById("barberClientName")?.value.trim(); if(!name) return;
  state.barberClients.push({
    id:uid(),name,
    phone:document.getElementById("barberClientPhone")?.value||"",
    history:document.getElementById("barberClientHistory")?.value||"",
    cutNotes:document.getElementById("barberClientCutNotes")?.value||"",
    frequency:document.getElementById("barberClientFrequency")?.value||"",
    birthday:document.getElementById("barberClientBirthday")?.value||""
  });
  saveState(); render();
}
function addBarberService() {
  const name=document.getElementById("serviceName")?.value.trim(); if(!name) return;
  state.barberServices.push({
    id:uid(),name,
    price:Number(document.getElementById("servicePrice")?.value||0),
    duration:document.getElementById("serviceDuration")?.value||""
  });
  saveState(); render();
}
function addEmployee() {
  const name=document.getElementById("employeeName")?.value.trim(); if(!name) return;
  state.barberEmployees.push({
    id:uid(),name,
    percent:Number(document.getElementById("employeePercent")?.value||0),
    schedule:document.getElementById("employeeSchedule")?.value||"",
    paid:Number(document.getElementById("employeePaid")?.value||0)
  });
  saveState(); render();
}
function addBarberExpense() {
  const amount=Number(document.getElementById("barberExpense")?.value||0); if(!amount) return;
  const desc=document.getElementById("barberExpenseDesc")?.value||today();
  state.barberExpenses.push({id:uid(),amount,desc,date:today()});
  state.moneySpent+=amount;
  state.cashFlowEntries.push({id:uid(),type:"salida",amount,description:`Gasto barbería: ${desc}`,date:today(),category:"Barbería"});
  saveState(); render(); showToast(`💸 Gasto de ${money(amount)} registrado`);
}

/* =====================================================================
   CIERRE NOCTURNO
   ===================================================================== */
function openNightSummary() {
  const reached=state.moneyToday>=state.moneyGoal;
  const items=["¿Cobré todo lo pendiente?","¿Entrené hoy?","¿Estudié Derecho?","¿Revisé el inventario?","¿Dormiré temprano?"];
  document.getElementById("nightContent").innerHTML=`
    <div class="summary-box" style="margin-bottom:14px">
      <p>Tareas completadas: <strong>${completedTasks()}</strong></p>
      <p>Tareas pendientes: <strong>${pendingTasks()}</strong></p>
      <p>Dinero generado: <strong>${money(state.moneyToday)}</strong></p>
      <p>Meta alcanzada: <strong ${reached?'class="green"':'style="color:var(--warn)"'}>${reached?"✅ Sí":"❌ No"}</strong></p>
    </div>
    <h3 style="margin-bottom:10px;color:var(--neon);font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.5px">Checklist nocturno</h3>
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
  const day={
    date:today(),completed,pending,mission:state.mission,
    moneyToday:state.moneyToday,moneySpent:state.moneySpent,
    productiveHours:Number(document.getElementById("nightHours")?.value||0),
    note:document.getElementById("nightNote")?.value||"",
    discipline,
    status:reached&&pending===0?"Excelente":reached?"Bueno":pending<=2?"Regular":"Malo"
  };
  state.history=[day,...state.history.filter(h=>h.date!==day.date)].slice(0,90);
  state.xp+=completed*10+checks*5;
  state.disciplineScore=discipline;
  state.dailyRevenue=[...state.dailyRevenue.slice(1),state.moneyToday];
  const d=new Date();
  if(d.getDate()===1){ state.prevMonthRevenue=[...state.monthlyRevenue]; state.monthlyRevenue=[0,0,0,0,0,0]; }
  saveState(); closeNightSummary(); go("Imperio");
  showToast("🌙 Cierre nocturno guardado");
}

/* =====================================================================
   IA — Con historial persistente
   ===================================================================== */
function openAI()  { openModal("aiModal"); renderAIChat(); }
function closeAI() { closeModal("aiModal"); }
function askAI(q)  { const input=document.getElementById("aiInput"); if(input) input.value=q; runAI(); }
function clearAIHistory() {
  aiHistory=[]; saveAIHistory();
  const el=document.getElementById("aiChatHistory"); if(el) el.innerHTML="";
  showToast("🗑 Chat limpiado");
}
function renderAIChat() {
  const el=document.getElementById("aiChatHistory"); if(!el||!aiHistory.length) return;
  el.innerHTML=aiHistory.map(m=>`
    <div class="ai-msg ${m.role}">
      <span class="ai-role">${m.role==="user"?"Tú":"🧠 IA"}</span>
      ${m.content.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}
    </div>`).join("");
  el.scrollTop=el.scrollHeight;
}
async function runAI() {
  const q=(document.getElementById("aiInput")?.value||"").trim(); if(!q) return;
  document.getElementById("aiInput").value="";
  const lowStock=state.vaperInventory.filter(p=>Number(p.quantity)<=Number(p.minStock||3)).map(p=>p.product).join(", ")||"Ninguno";
  const billsPend=state.billsToPay.filter(b=>!b.paid).map(b=>b.name+" ("+money(b.amount,b.currency)+")").join(", ")||"Ninguna";
  const topObj=state.objectives.map(o=>`${o.name}: ${Math.round(Number(o.current)/Math.max(1,Number(o.target))*100)}%`).join(", ")||"Sin objetivos";
  const cfHoy=cashFlowToday();
  const systemContext=`Eres el asistente financiero personal de ${state.userName}, dueño de Cedano Business.
Datos actuales (${today()}):
- Capital: ${money(state.capital)} | Ahorros: ${money(state.savings)}
- Generado hoy: ${money(state.moneyToday)} / Meta: ${money(state.moneyGoal)} (${progress()}%)
- Flujo de caja hoy: entradas ${money(cfHoy.inflow)}, salidas ${money(cfHoy.outflow)}, neto ${money(cfHoy.net)}
- Patrimonio total: ${money(patrimonyTotal())}
- Préstamos activos: ${state.loans.length} (por cobrar: ${money(totalLoanBalance())})
- Morosos: ${state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").map(l=>l.client+" ("+calcLateDays(l)+" días)").join(", ")||"Ninguno"}
- Ganancia vaper: ${money(vaperGain())} en ${state.vaperSales.length} ventas | Stock bajo: ${lowStock}
- Barbería: ${money(barberIncome())} ingresos, ${money(barberExpenseTotal())} gastos
- Cuentas por pagar: ${billsPend}
- Gastos personales este mes: ${money(totalPersonalExpenses())}
- Objetivos: ${topObj}
- Tareas hoy: ${completedTasks()} completadas de ${state.tasks.length}
- XP: ${state.xp} — Rango: ${rank()}
- Disciplina hoy: ${Math.round(state.habits.filter(h=>h.done).length/Math.max(1,state.habits.length)*100)}%
Responde en español, conciso y directo. Usa datos reales. Sé proactivo y da consejos concretos.`.trim();
  aiHistory.push({role:"user",content:q}); saveAIHistory(); renderAIChat();
  const chatEl=document.getElementById("aiChatHistory");
  const loadingEl=document.createElement("div");
  loadingEl.className="ai-msg assistant";
  loadingEl.innerHTML='<span class="ai-role">🧠 IA</span><span style="animation:pulse 1s infinite;color:var(--neon)">Analizando...</span>';
  if(chatEl) chatEl.appendChild(loadingEl);
  try{
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-6",
        max_tokens:1000,
        system:systemContext,
        messages:aiHistory.map(m=>({role:m.role,content:m.content}))
      })
    });
    const data=await response.json();
    const text=data.content?.map(b=>b.text||"").join("")||"Sin respuesta.";
    aiHistory.push({role:"assistant",content:text}); saveAIHistory();
    if(loadingEl.parentNode) loadingEl.remove();
    renderAIChat();
  }catch(err){
    if(loadingEl.parentNode) loadingEl.remove();
    aiHistory.push({role:"assistant",content:"❌ Error al conectar. Verifica tu conexión."}); saveAIHistory(); renderAIChat();
  }
}

/* =====================================================================
   PIN
   ===================================================================== */
function savePin() {
  const p=document.getElementById("newPin")?.value;
  if(!p||p.length!==4||isNaN(p)){ showToast("❌ Ingresa exactamente 4 dígitos","err"); return; }
  state.pinEnabled=true; state.pin=p; pinUnlocked=true;
  saveState(); render(); showToast("✅ PIN activado");
}
function disablePin() {
  state.pinEnabled=false; state.pin=""; pinUnlocked=true;
  saveState(); render(); showToast("PIN desactivado");
}

/* =====================================================================
   BACKUP & CSV
   ===================================================================== */
function exportBackup() {
  state.lastBackupDate=today(); saveState();
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=`cedano-v6-backup-${today()}.json`; a.click();
  showToast("📦 Backup exportado");
}
function importBackupTrigger() { document.getElementById("importFile").click(); }
function importBackup(input) {
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      state={...initialState,...data}; saveState(); render();
      showToast("✅ Backup restaurado");
    }catch{ showToast("❌ Archivo inválido","err"); }
  };
  reader.readAsText(file);
}
function exportCSV(type) {
  let rows=[]; let filename="";
  if(type==="loans"){
    filename=`cedano-prestamos-${today()}.csv`;
    rows=[["Cliente","Capital","Moneda","Interés","Frecuencia","Fecha inicio","Vencimiento","Pagado","Balance","Estado","Días atraso"]];
    state.loans.forEach(l=>rows.push([l.client,l.capital,l.currency||"RD$",l.interest+"%",l.frequency,l.startDate||"",l.dueDate||"",l.paid,loanBalance(l),l.status,calcLateDays(l)]));
  } else if(type==="vaper"){
    filename=`cedano-ventas-vaper-${today()}.csv`;
    rows=[["Cliente","Producto","Cantidad","Fecha","Método","Ganancia"]];
    state.vaperSales.forEach(s=>rows.push([s.client,s.product,s.quantity,s.date,s.method,s.gain]));
  }
  const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
}

function printReport() {
  const win=window.open("","_blank","width=800,height=900");
  if(!win) return;
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
    .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:12px;color:#888;font-size:12px;text-align:center}
  </style></head><body>
  <h1>📊 Reporte Cedano Business v6</h1>
  <p>Generado el ${new Date().toLocaleDateString("es-DO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
  <div class="grid">
    <div class="metric"><div class="val">${money(state.capital)}</div><div>Capital efectivo</div></div>
    <div class="metric"><div class="val">${money(patrimonyTotal())}</div><div>Patrimonio total</div></div>
    <div class="metric"><div class="val">${money(totalBillsPending())}</div><div>Por pagar</div></div>
  </div>
  <h2>💵 Préstamos (${state.loans.length})</h2>
  <table><thead><tr><th>Cliente</th><th>Capital</th><th>Balance</th><th>Estado</th><th>Días atraso</th></tr></thead><tbody>
    ${state.loans.map(l=>`<tr><td>${esc(l.client)}</td><td>${money(l.capital,l.currency)}</td><td>${loanBalanceMoney(l)}</td><td>${l.status}</td><td>${calcLateDays(l)}</td></tr>`).join("")}
  </tbody></table>
  <h2>💳 Cuentas por pagar</h2>
  <table><thead><tr><th>Cuenta</th><th>Monto</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>
    ${state.billsToPay.map(b=>`<tr><td>${esc(b.name)}</td><td>${money(b.amount,b.currency)}</td><td>${esc(b.dueDate||"Sin fecha")}</td><td>${b.paid?"✅ Pagada":"⏳ Pendiente"}</td></tr>`).join("")}
  </tbody></table>
  <h2>☁ Inventario Vaper</h2>
  <table><thead><tr><th>Producto</th><th>Stock</th><th>Costo</th><th>Venta</th></tr></thead><tbody>
    ${state.vaperInventory.map(p=>`<tr><td>${esc(p.product)}</td><td>${p.quantity}</td><td>${money(p.cost)}</td><td>${money(p.price)}</td></tr>`).join("")}
  </tbody></table>
  <h2>🎯 Objetivos</h2>
  <table><thead><tr><th>Objetivo</th><th>Meta</th><th>Ahorrado</th><th>Progreso</th></tr></thead><tbody>
    ${state.objectives.map(o=>`<tr><td>${esc(o.icon)} ${esc(o.name)}</td><td>${money(o.target)}</td><td>${money(o.current)}</td><td>${o.target?Math.round(Number(o.current)/Number(o.target)*100):0}%</td></tr>`).join("")}
  </tbody></table>
  <div class="footer">Cedano Business v6.0 — ${new Date().toLocaleDateString("es-DO")}</div>
  </body></html>`);
  win.document.close(); setTimeout(()=>win.print(),500);
}

function resetData() {
  if(!confirm("¿Seguro que quieres reiniciar todos los datos? Esta acción no se puede deshacer.")) return;
  localStorage.removeItem(KEY); localStorage.removeItem("CEDANO_AI_HIST");
  state=structuredClone(initialState); pinUnlocked=true; aiHistory=[]; saveState(); render();
}

/* =====================================================================
   SISTEMA DE NOTIFICACIONES PUSH LOCALES
   ===================================================================== */

let _notifSW = null;
let _notifCheckInterval = null;

async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    _notifSW = reg;
    return reg;
  } catch(e) {
    console.warn('[SW] Error:', e.message);
    return null;
  }
}

async function requestNotifPermission() {
  if (!('Notification' in window)) { showToast('Notificaciones no soportadas','err'); return false; }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') { showToast('Notificaciones bloqueadas en el navegador','err'); return false; }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

async function sendNotification(title, body, tag) {
  const reg = _notifSW || await registerSW();
  if (!reg) return;
  const worker = reg.active || reg.installing || reg.waiting;
  if (!worker) return;
  worker.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag });
}

async function checkAndNotify() {
  if (Notification.permission !== 'granted') return;
  const reg = _notifSW || await registerSW();
  if (!reg) return;
  const worker = reg.active || reg.installing || reg.waiting;
  if (!worker) return;
  worker.postMessage({
    type: 'CHECK_AND_NOTIFY',
    state: {
      loans: state.loans || [],
      barberAppointments: state.barberAppointments || [],
      billsToPay: state.billsToPay || []
    },
    hora: new Date().getHours()
  });
}

function scheduleNotifChecks() {
  if (_notifCheckInterval) clearInterval(_notifCheckInterval);
  _notifCheckInterval = setInterval(checkAndNotify, 30 * 60 * 1000);
  setTimeout(checkAndNotify, 8000);
}

async function activateNotifications() {
  const reg = await registerSW();
  if (!reg) { showToast('❌ Notificaciones no soportadas','err'); return; }
  const granted = await requestNotifPermission();
  if (!granted) return;
  state.notifSettings = { ...state.notifSettings, pushEnabled: true };
  saveState();
  scheduleNotifChecks();
  showToast('🔔 Notificaciones activadas');
  setTimeout(() => sendNotification('✅ Cedano Business','Las notificaciones están activas.','cedano-test'), 1000);
}

function deactivateNotifications() {
  if (_notifCheckInterval) clearInterval(_notifCheckInterval);
  state.notifSettings = { ...state.notifSettings, pushEnabled: false };
  saveState(); render(); showToast('🔕 Notificaciones desactivadas');
}

async function initNotifications() {
  if (!state.notifSettings?.pushEnabled) return;
  if (Notification.permission !== 'granted') return;
  await registerSW();
  scheduleNotifChecks();
}

function renderNotifCard() {
  const enabled = state.notifSettings?.pushEnabled;
  const support = 'Notification' in window && 'serviceWorker' in navigator;
  const permDenied = 'Notification' in window && Notification.permission === 'denied';
  return card('🔔 Notificaciones Push', `
    ${!support
      ? `<p class="muted" style="font-size:13px">❌ Usa Chrome en Android o instala la app como PWA en iPhone.</p>`
      : permDenied
      ? `<p class="muted" style="font-size:13px">⚠ Bloqueadas. Actívalas en Configuración del navegador → Permisos.</p>`
      : `<p class="muted" style="font-size:13px;margin-bottom:10px">Recibe avisos de cobros, citas y cuentas — incluso con la app cerrada.</p>
         <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
           <span style="font-size:13px">🔴 Cobros pendientes / morosos</span>
           <span style="font-size:13px">✂ Citas de barbería del día</span>
           <span style="font-size:13px">💳 Cuentas por pagar vencidas</span>
         </div>
         ${enabled
           ? `<div style="background:rgba(34,212,104,.1);border:1.5px solid rgba(34,212,104,.3);border-radius:8px;padding:10px;margin-bottom:10px;font-size:13px;color:var(--neon);font-weight:700">✅ Notificaciones activas</div>
              ${btn('🔕 Desactivar','deactivateNotifications()','secondary')}`
           : btn('🔔 Activar notificaciones','activateNotifications()')
         }
         ${btn('🧪 Enviar prueba','testNotification()','secondary')}`
    }
  `);
}

async function testNotification() {
  if (Notification.permission !== 'granted') {
    const ok = await requestNotifPermission(); if (!ok) return;
  }
  await sendNotification('🧠 Cedano Business','¡Las notificaciones funcionan correctamente!','cedano-prueba');
  showToast('🔔 Notificación enviada');
}

/* =====================================================================
   INIT
   ===================================================================== */
document.body.classList.toggle("light-mode", !darkMode);
checkDayReset();
checkBackupReminder();
checkWeeklyReview();
setTimeout(checkBirthdays, 5000);
setTimeout(initNotifications, 3000);

window._cedanoRenderSafetyNet = setTimeout(() => {
  const sk = document.getElementById('skeletonLoader');
  const screen = document.getElementById('screen');
  const authScreen = document.getElementById('cedano-auth-screen');
  if (sk && !screen && !authScreen) {
    if (sk) sk.remove();
    if (typeof rebuildDOM === 'function') rebuildDOM();
    if (typeof render === 'function') render();
  }
}, 8000);
initSupabase();
