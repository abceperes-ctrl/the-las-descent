const KEY="CEDANO_V3";
const $=s=>document.querySelector(s);

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function today(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function money(v,cur){
  const n=Number(v||0);
  if(cur==="USD")return`US$${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  return`RD$${n.toLocaleString("es-DO")}`;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function inp(id,ph,type="text",val=""){return`<input id="${id}" type="${type}" placeholder="${ph}" value="${esc(val)}">`}
function sel(id,opts,val=""){return`<select id="${id}">${opts.map(o=>`<option${o===val?" selected":""}>${o}</option>`).join("")}</select>`}
function ta(id,ph,val=""){return`<textarea id="${id}" placeholder="${ph}">${esc(val)}</textarea>`}
function btn(label,action,cls=""){return`<button class="btn ${cls}" onclick="${action}">${label}</button>`}
function sm(label,action,cls=""){return`<button class="small-btn ${cls}" onclick="${action}">${label}</button>`}
function card(title,body){return`<article class="card"><h3 class="title">${title}</h3>${body}</article>`}
function metric(icon,title,val,sub,cls=""){return`<article class="card metric${cls?" "+cls:""}"><h3 class="title">${icon} ${title}</h3><div class="value">${esc(String(val))}</div><div class="muted">${sub}</div></article>`}

const initialState={
  userName:"Royer",businessName:"Cedano Business",
  capital:1250000,savings:50000,
  mission:"Conseguir 3 clientes",moneyGoal:10000,moneyToday:5450,moneySpent:0,
  xp:1250,productiveHours:0,dailyNote:"",usdRate:59,
  habits:[
    {id:uid(),text:"Levantarme temprano",done:false,streak:0},
    {id:uid(),text:"Gym",done:false,streak:3},
    {id:uid(),text:"Estudiar Derecho",done:false,streak:1},
    {id:uid(),text:"Revisar negocios",done:false,streak:5},
    {id:uid(),text:"Dormir temprano",done:false,streak:2}
  ],
  habitStats:{daysTraining:3,daysMeta:5,avgSleep:6.5},
  tasks:[
    {id:uid(),text:"Cobrar a Pedro",type:"Diario",priority:"Alta",date:today(),time:"10:00 AM",done:true},
    {id:uid(),text:"Comprar líquido para vapers",type:"Diario",priority:"Media",date:today(),time:"2:00 PM",done:false},
    {id:uid(),text:"Ir al gimnasio",type:"Diario",priority:"Baja",date:today(),time:"7:00 PM",done:true},
    {id:uid(),text:"Revisar gastos de la barbería",type:"Semanal",priority:"Urgente",date:today(),time:"8:30 PM",done:false}
  ],
  tomorrow:{mission:"",moneyGoal:"",tasks:[],reminders:[],followups:[]},
  history:[],
  contacts:[
    {id:uid(),name:"Pedro Gómez",phone:"809-000-0000",address:"Santo Domingo",source:"Referido",note:"Quiere préstamo pequeño.",priority:"Alta",status:"Interesado"},
    {id:uid(),name:"María López",phone:"829-000-0000",address:"Los Alcarrizos",source:"Facebook",note:"Llamar en la tarde.",priority:"Media",status:"Pendiente"}
  ],
  loanClients:[
    {id:uid(),name:"Pedro Gómez",photo:"",cedula:"000-0000000-0",phone:"809-000-0000",address:"Santo Domingo",reference:"Juan Pérez",notes:"Cliente recomendado.",lastVisit:today()}
  ],
  loans:[
    {id:uid(),client:"Pedro Gómez",capital:15000,interest:20,currency:"RD$",startDate:today(),dueDate:"",frequency:"Semanal",paid:3000,lateDays:0,status:"En mora"}
  ],
  payments:[],
  vaperInventory:[
    {id:uid(),product:"Vaper Blue Ice",brand:"Elf Bar",model:"BC5000",type:"Desechable",flavor:"Blue Ice",quantity:8,cost:450,price:750},
    {id:uid(),product:"Vaper Mango Ice",brand:"Elf Bar",model:"BC5000",type:"Desechable",flavor:"Mango Ice",quantity:2,cost:450,price:750}
  ],
  vaperSales:[],
  vaperClients:[{id:uid(),name:"Luis Mateo",phone:"849-000-0000",totalSpent:1500,history:"Compró Blue Ice."}],
  barberAppointments:[
    {id:uid(),client:"Carlos",phone:"809-222-2222",service:"Corte + barba",date:today(),time:"6:00 PM",price:600,reminder:true}
  ],
  barberClients:[
    {id:uid(),name:"Carlos",phone:"809-222-2222",history:"Corte degradado",frequency:"Cada 15 días",birthday:"1995-04-10"}
  ],
  barberServices:[
    {id:uid(),name:"Corte",price:400,duration:"35 min"},
    {id:uid(),name:"Corte + barba",price:600,duration:"50 min"}
  ],
  barberEmployees:[{id:uid(),name:"Cedano",percent:100,schedule:"9AM - 8PM",paid:0}],
  barberExpenses:[],
  achievements:[
    {id:"a1",icon:"🥉",title:"Primera venta",desc:"Registrar primera venta de vaper",unlocked:true},
    {id:"a2",icon:"🥈",title:"30 días de disciplina",desc:"Completar hábitos 30 días seguidos",unlocked:false},
    {id:"a3",icon:"🥇",title:"RD\$1,000,000 de capital",desc:"Alcanzar RD\$1M en patrimonio",unlocked:false},
    {id:"a4",icon:"👑",title:"Empresario Élite",desc:"Completar todos los logros",unlocked:false},
    {id:"a5",icon:"💰",title:"Primer RD\$100,000 ahorrados",desc:"Ahorrar RD\$100,000",unlocked:false},
    {id:"a6",icon:"⚡",title:"Meta 7 días seguidos",desc:"Cumplir la meta diaria 7 veces",unlocked:false}
  ],
  calendarEvents:[
    {id:uid(),date:today(),title:"Cobro Pedro",type:"cobro",time:"10:00 AM"},
    {id:uid(),date:today(),title:"Cita Carlos",type:"cita",time:"6:00 PM"}
  ],
  dailyRevenue:[4200,6800,3100,7500,5450,0,0],
  monthlyRevenue:[32000,45000,51000,38000,67000,72000],
  lawExams:[],disciplineScore:72,pinEnabled:false,pin:""
};

let state=loadState();
let currentTab="Inicio";
let chartInstances={};
let calendarMonth=new Date().getMonth();
let calendarYear=new Date().getFullYear();
let pinUnlocked=!state.pinEnabled;
let darkMode=localStorage.getItem("CEDANO_THEME")!=="light";
let editingId=null;
let editingType=null;

function loadState(){
  try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(initialState)}
  catch{return structuredClone(initialState)}
}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state))}
function setState(patch){state={...state,...patch};saveState();render()}

function completedTasks(){return state.tasks.filter(t=>t.done).length}
function pendingTasks(){return state.tasks.filter(t=>!t.done).length}
function progress(){return state.moneyGoal?Math.min(100,Math.round(state.moneyToday/state.moneyGoal*100)):0}
function rank(){
  if(state.xp>=5000)return"General";if(state.xp>=3000)return"Coronel";
  if(state.xp>=2000)return"Capitán";if(state.xp>=1200)return"Mayor";
  if(state.xp>=600)return"Sargento";return"Recluta";
}
function rankIcon(){
  if(state.xp>=5000)return"⭐⭐⭐";if(state.xp>=3000)return"⭐⭐";
  if(state.xp>=2000)return"⭐";if(state.xp>=1200)return"🎖";
  if(state.xp>=600)return"🏅";return"🪖";
}
function nextRankXP(){
  if(state.xp<600)return 600;if(state.xp<1200)return 1200;
  if(state.xp<2000)return 2000;if(state.xp<3000)return 3000;
  if(state.xp<5000)return 5000;return 9999;
}
function calcLateDays(loan){
  if(!loan.dueDate)return loan.lateDays||0;
  const due=new Date(loan.dueDate);const now=new Date();
  return now>due?Math.floor((now-due)/(1000*60*60*24)):0;
}
function loanBalance(loan){
  const total=Number(loan.capital)+Number(loan.capital)*Number(loan.interest||0)/100;
  return Math.max(0,total-Number(loan.paid||0));
}
function totalLoanBalance(){return state.loans.reduce((s,l)=>s+loanBalance(l),0)}
function vaperGain(){return state.vaperSales.reduce((s,sale)=>s+Number(sale.gain||0),0)}
function vaperInventoryValue(){return state.vaperInventory.reduce((s,p)=>s+Number(p.quantity||0)*Number(p.cost||0),0)}
function barberIncome(){return state.barberAppointments.reduce((s,a)=>s+Number(a.price||0),0)}
function barberExpenseTotal(){return state.barberExpenses.reduce((s,e)=>s+Number(e.amount||0),0)}
function patrimonyTotal(){return Number(state.capital)+totalLoanBalance()+vaperInventoryValue()+barberIncome()+Number(state.savings||0)}
function loanStatusClass(s){return s==="Al día"?"status-verde":s==="En mora"?"status-mora":"status-riesgo"}
function loanStatusDot(s){return s==="Al día"?"🟢":s==="En mora"?"🔴":"🟡"}

function generateSchedule(loan){
  const total=Number(loan.capital)*(1+Number(loan.interest||0)/100);
  const freqMap={"Diario":1,"Semanal":7,"Quincenal":15,"Mensual":30};
  const days=freqMap[loan.frequency]||7;
  const start=loan.startDate?new Date(loan.startDate):new Date();
  const maxP=loan.frequency==="Diario"?30:loan.frequency==="Mensual"?12:loan.frequency==="Quincenal"?24:52;
  const cuota=total/maxP;const rows=[];let remaining=total;let paid=Number(loan.paid||0);
  for(let i=0;i<maxP&&remaining>0.01;i++){
    const d=new Date(start);d.setDate(d.getDate()+i*days);
    const thisPay=Math.min(cuota,remaining);
    rows.push({n:i+1,date:d.toLocaleDateString("es-DO"),amount:thisPay,paid:paid>=thisPay*(i+1)});
    remaining-=thisPay;
  }
  return rows;
}

const tabs=[["Inicio","⌂"],["Mi Día","⚑"],["Préstamos","$"],["Vaper","☁"],["Barbería","✂"],["Reportes","▥"],["Imperio","♛"]];

function renderTabs(){
  document.getElementById("tabs").innerHTML=tabs.map(([name,icon])=>
    `<button class="tab ${currentTab===name?"active":""}" onclick="go('${name}')"><b>${icon}</b><span>${name}</span></button>`
  ).join("");
}
function go(tab){currentTab=tab;render()}
function destroyCharts(){Object.values(chartInstances).forEach(c=>{try{c.destroy()}catch{}});chartInstances={}}

// ===== PIN =====
let pinEntry="";
function renderPin(){
  return`<div class="pin-screen" id="pinScreen">
    <div style="font-size:40px">🔐</div>
    <h2 style="color:var(--neon)">Cedano Business</h2>
    <p style="color:var(--muted)">Ingresa tu PIN</p>
    <div class="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot${pinEntry.length>i?" filled":""}" id="pd${i}"></div>`).join("")}</div>
    <div id="pinError" style="color:var(--danger);min-height:20px;font-size:13px"></div>
    <div class="pin-grid">${[1,2,3,4,5,6,7,8,9,"","0","⌫"].map(k=>`<button class="pin-btn" onclick="pinPress('${k}')">${k}</button>`).join("")}</div>
  </div>`;
}
function pinPress(k){
  if(k==="⌫")pinEntry=pinEntry.slice(0,-1);
  else if(k!=="")pinEntry+=k;
  updatePinDots();
  if(pinEntry.length===4){
    if(pinEntry===state.pin){
      pinUnlocked=true;pinEntry="";
      rebuildDOM();render();
    } else {
      const e=document.getElementById("pinError");
      if(e)e.textContent="PIN incorrecto";
      pinEntry="";updatePinDots();
      setTimeout(()=>{const e=document.getElementById("pinError");if(e)e.textContent=""},1500);
    }
  }
}
function updatePinDots(){
  [0,1,2,3].forEach(i=>{const d=document.getElementById("pd"+i);if(d)d.className="pin-dot"+(pinEntry.length>i?" filled":"")});
}

function rebuildDOM(){
  document.body.innerHTML=`
    <main class="app"><section id="screen"></section></main>
    <nav class="tabs" id="tabs"></nav>
    <div class="modal" id="nightModal"><div class="modal-inner"><div class="modal-head"><h2>🌙 Cierre Nocturno</h2><button onclick="closeNightSummary()">×</button></div><div id="nightContent"></div></div></div>
    <div class="modal" id="editModal"><div class="modal-inner"><div class="modal-head"><h2 id="editTitle">Editar</h2><button onclick="closeEditModal()">×</button></div><div id="editContent"></div></div></div>
    <div class="modal" id="detailModal"><div class="modal-inner"><div class="modal-head"><h2 id="detailTitle">Detalle</h2><button onclick="closeDetail()">×</button></div><div id="detailContent"></div></div></div>
    <div class="modal" id="aiModal"><div class="modal-inner"><div class="modal-head"><h2>🧠 IA Cedano</h2><button onclick="closeAI()">×</button></div><div id="aiContent">
      <input id="aiInput" placeholder="Ej: ¿Cuánto gané esta semana?">
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
        <button class="small-btn green" onclick="askAI('¿Cuánto gané esta semana?')">Esta semana</button>
        <button class="small-btn green" onclick="askAI('¿Quiénes debo cobrar hoy?')">Cobrar hoy</button>
        <button class="small-btn green" onclick="askAI('¿Qué negocio está creciendo más?')">Mayor crecimiento</button>
        <button class="small-btn warn" onclick="askAI('¿Cuánto debo producir hoy para llegar a mi meta mensual?')">Meta mensual</button>
        <button class="small-btn" onclick="askAI('Resumen de patrimonio total')">Patrimonio</button>
      </div>
      <button class="btn" style="margin-top:10px" onclick="runAI()">Preguntar ›</button>
      <div id="aiResponse" class="summary-box" style="margin-top:12px;display:none"></div>
    </div></div></div>`;
}

function render(){
  if(state.pinEnabled&&!pinUnlocked){
    document.body.innerHTML=renderPin();
    return;
  }
  if(!document.getElementById("screen"))rebuildDOM();
  destroyCharts();
  renderTabs();
  const views={
    "Inicio":renderHome,"Mi Día":renderMyDay,"Préstamos":renderLoans,
    "Vaper":renderVaper,"Barbería":renderBarber,"Reportes":renderReports,"Imperio":renderImperio
  };
  document.getElementById("screen").innerHTML=views[currentTab]();
  const bar=document.getElementById("moneyProgress");
  if(bar)bar.style.width=progress()+"%";
  document.body.classList.toggle("light-mode",!darkMode);
  setTimeout(initCharts,100);
}

function header(){
  return`<div class="topbar">
    <button class="icon-btn">☰</button>
    <div class="brand">CEDANO BUSINESS</div>
    <button class="icon-btn" onclick="toggleTheme()">${darkMode?"☀":"🌙"}</button>
    <button class="icon-btn" onclick="openAI()">🧠</button>
  </div>`;
}
function toggleTheme(){
  darkMode=!darkMode;
  localStorage.setItem("CEDANO_THEME",darkMode?"dark":"light");
  document.body.classList.toggle("light-mode",!darkMode);
  const b=document.querySelector(".topbar .icon-btn:nth-child(3)");
  if(b)b.textContent=darkMode?"☀":"🌙";
}

// ===== HOME =====
function renderHome(){
  const missing=Math.max(0,state.moneyGoal-state.moneyToday);
  const mora=state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length;
  const pendingC=state.contacts.filter(c=>c.status==="Pendiente").length;
  const taskPct=state.tasks.length?Math.round(completedTasks()/state.tasks.length*100):0;
  const todayCitas=state.barberAppointments.filter(a=>a.date===today()).length;
  const lowStockItems=state.vaperInventory.filter(p=>Number(p.quantity)<=3);
  const moraLoans=state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora");
  const d=new Date();const hLeft=Math.max(0,22-d.getHours());
  return`
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
    ${lowStockItems.length?`<div class="card" style="border-color:rgba(255,204,77,.6)"><p class="title" style="color:var(--warn)">⚠ Inventario bajo</p>${lowStockItems.map(p=>`<p class="pill warn">☁ ${esc(p.product)} — ${p.quantity} uds.</p>`).join("")}</div>`:""}
    ${mora?`<div class="card" style="border-color:rgba(255,77,94,.5)"><p class="title" style="color:var(--danger)">🔴 Clientes en mora</p>${moraLoans.map(l=>`<p class="pill danger">💸 ${esc(l.client)} — ${calcLateDays(l)} días</p>`).join("")}</div>`:""}
    ${card("🎯 Misión del día",`<p>${esc(state.mission||"Sin misión establecida")}</p>${inp("missionInput","Ej: Conseguir 3 clientes")}<div class="row" style="margin-top:8px">${btn("Guardar","saveMission()")}${btn("✔ Completar (+50 XP)","completeMission()","secondary")}</div>`)}
    ${card("💰 Meta diaria",`<p class="big-money">${money(state.moneyGoal)}</p><p>Generado: ${money(state.moneyToday)}</p><div class="progress"><span id="moneyProgress"></span></div><p class="green">${progress()}% completado — faltan ${money(missing)}</p>${inp("goalInput","Meta RD$","number")}${inp("todayMoneyInput","Dinero generado hoy","number")}${btn("Guardar","saveMoney()")}`)}
    <section class="grid">
      ${metric("⚔","XP",state.xp,"Puntos")}${metric("🏆","Rango",rank(),"Sigue avanzando")}
      ${metric("🎯","Pendientes",pendingTasks(),"Tareas")}${metric("📌","Seguimientos",state.contacts.length,"Activos")}
    </section>
    ${card("📖 Verso del Día",`<p><em>Porque yo sé los planes que tengo para vosotros.</em></p><p class="green">Jeremías 29:11</p>`)}
    <h2 class="section-title">Módulos</h2>
    ${["💰,Préstamos,Clientes préstamos y cobros.,Préstamos","☁,Vaper,Inventario y ventas.,Vaper","✂,Barbería,Agenda y clientes.,Barbería","▥,Reportes,Ganancias y estado general.,Reportes","⚑,Productividad,Metas hábitos y XP.,Mi Día","♛,Mi Imperio,Patrimonio y crecimiento.,Imperio"].map(s=>{const[ic,nm,dc,tb]=s.split(",");return`<div class="module" onclick="go('${tb}')"><div class="module-icon">${ic}</div><div><strong>${nm}</strong><small>${dc}</small></div><div class="arrow">›</div></div>`}).join("")}
    ${card("🧠 Resumen IA",`<p class="pill green">Faltan ${money(missing)} para cumplir tu meta.</p><p class="pill ${mora?"danger":"green"}">${mora} clientes en mora.</p><p class="pill warn">${pendingC} personas pendientes por contactar.</p><p class="pill green">Completaste el ${taskPct}% de tus tareas.</p><p class="pill">Balance en préstamos: ${money(totalLoanBalance())}</p><p class="pill blue">Patrimonio total: ${money(patrimonyTotal())}</p>${btn("Abrir IA completa","openAI()","secondary")}`)}
    <h2 class="section-title">Accesos rápidos</h2>
    <section class="quick-grid">
      ${[["👥","Clientes","Préstamos"],["☁","Vaper","Vaper"],["✂","Barbería","Barbería"],["▥","Reportes","Reportes"],["⚑","Metas","Mi Día"],["$","Finanzas","Reportes"],["📅","Agenda","Mi Día"],["♛","Imperio","Imperio"]].map(([ic,nm,tb])=>`<button class="quick" onclick="go('${tb}')"><span>${ic}</span><small>${nm}</small></button>`).join("")}
    </section>`;
}

// ===== MI DÍA =====
function renderMyDay(){
  return`
    <h1 class="section-title">⚑ Mi Día</h1>
    ${card("🌅 Hábitos de hoy",state.habits.map(h=>`
      <div class="habit-item ${h.done?"done":""}" onclick="toggleHabit('${h.id}')">
        <div class="habit-check">${h.done?"✓":""}</div>
        <span>${esc(h.text)}</span>
        <span class="pill green" style="margin-left:auto">${h.streak}🔥</span>
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

function taskHTML(task){
  return`<div class="list-item task ${task.done?"done":""}">
    <div onclick="toggleTask('${task.id}')" style="flex:1;cursor:pointer">
      <div class="task-text">${task.done?"☑":"☐"} ${esc(task.text)}</div>
      <small class="muted">${task.type||"Diario"} • ${task.date||"Sin fecha"} • ${task.time||"Sin hora"}</small>
    </div>
    <span class="pill ${task.priority==="Urgente"?"danger":task.priority==="Alta"?"warn":"green"}">${task.priority}</span>
    ${sm("✏","openEdit('task','"+task.id+"')","")}
    ${sm("🗑","deleteRecord('task','"+task.id+"')","red")}
  </div>`;
}

// ===== PRÉSTAMOS =====
function renderLoans(){
  const pending=state.contacts.filter(c=>c.status==="Pendiente").length;
  const interested=state.contacts.filter(c=>c.status==="Interesado").length;
  const converted=state.contacts.filter(c=>c.status==="Convertido").length;
  return`
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
      <div style="display:none" id="usdRateRow"><p class="muted" style="font-size:12px;margin-bottom:6px">Tasa: RD$${Number(state.usdRate||59)}/USD</p></div>
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
      ${btn("Registrar pago","addPayment()")}`)}
    ${card("📊 Resumen préstamos",`
      <p>Total prestado: ${money(state.loans.reduce((s,l)=>s+Number(l.capital||0),0))}</p>
      <p>Por cobrar: ${money(totalLoanBalance())}</p>
      <p>Cobrado: ${money(state.payments.reduce((s,p)=>s+Number(p.amount||0),0))}</p>
      <p>Morosos: ${state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length}</p>`)}`;
}

let loanCurrency="RD$";
function setCurrency(cur){
  loanCurrency=cur;
  document.getElementById("btnRD").className="currency-btn"+(cur==="RD$"?" active":"");
  document.getElementById("btnUSD").className="currency-btn"+(cur==="USD"?" active":"");
  const row=document.getElementById("usdRateRow");
  if(row)row.style.display=cur==="USD"?"block":"none";
}
function filterLoans(){
  const q=(document.getElementById("loanSearch")?.value||"").toLowerCase();
  const cl=document.getElementById("clientList");const ll=document.getElementById("loanList");const co=document.getElementById("contactList");
  if(cl)cl.innerHTML=state.loanClients.filter(c=>c.name.toLowerCase().includes(q)).map(clientHTML).join("");
  if(ll)ll.innerHTML=state.loans.filter(l=>l.client.toLowerCase().includes(q)).map(loanHTML).join("");
  if(co)co.innerHTML=state.contacts.filter(c=>c.name.toLowerCase().includes(q)).map(contactHTML).join("");
}
function calcLoan(){
  const capital=Number(document.getElementById("calcCapital")?.value||0);
  const interest=Number(document.getElementById("calcInterest")?.value||0);
  const freq=document.getElementById("calcFreq")?.value||"Semanal";
  const periods=Number(document.getElementById("calcPeriods")?.value||12);
  if(!capital)return;
  const total=capital*(1+interest/100);const cuota=total/periods;const ganancia=total-capital;
  const el=document.getElementById("calcResult");
  if(el){el.style.display="block";el.innerHTML=`
    <p>💵 Capital: <strong>${money(capital)}</strong></p>
    <p>💰 Total a cobrar: <strong>${money(total)}</strong></p>
    <p class="green">📈 Ganancia: <strong>${money(ganancia)}</strong></p>
    <p>📅 Cuota ${freq.toLowerCase()}: <strong>${money(cuota)}</strong></p>
    <p class="muted">En ${periods} períodos</p>`}
}

function clientHTML(c){
  const clientLoans=state.loans.filter(l=>l.client.toLowerCase()===c.name.toLowerCase());
  return`<article class="card">
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

function contactHTML(c){
  return`<article class="card">
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

function loanHTML(loan){
  const lateDays=calcLateDays(loan);
  const effectiveStatus=lateDays>0&&loan.status==="Al día"?"En mora (auto)":loan.status;
  const schedule=generateSchedule(loan);
  const scheduleHTML=`<div style="overflow-x:auto;margin-top:10px">
    <table class="schedule-table">
      <thead><tr><th>#</th><th>Fecha</th><th>Cuota</th><th>Estado</th></tr></thead>
      <tbody>${schedule.slice(0,8).map(r=>`<tr class="${r.paid?"paid-row":""}"><td>${r.n}</td><td>${r.date}</td><td>${money(r.amount)}</td><td>${r.paid?"✅":"⏳"}</td></tr>`).join("")}</tbody>
    </table>
    ${schedule.length>8?`<p class="muted" style="font-size:12px;margin-top:6px">Mostrando 8 de ${schedule.length} cuotas</p>`:""}
  </div>`;
  return`<article class="card">
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
      ${sm("🗑 Eliminar","deleteRecord('loan','"+loan.id+"')","red")}
    </div>
  </article>`;
}

function whatsappCobro(contactId){
  const c=state.contacts.find(x=>x.id===contactId);if(!c)return;
  const msg=`Hola ${c.name}, te recordamos que tienes un seguimiento pendiente en Cedano Business. Por favor comunícate con nosotros. 🙏`;
  window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappLoan(loanId){
  const l=state.loans.find(x=>x.id===loanId);if(!l)return;
  const balance=loanBalance(l);const lateDays=calcLateDays(l);
  const msg=`Hola ${l.client}, te recordamos que tienes un pago pendiente de *${money(balance)}* en Cedano Business.${lateDays>0?` Llevas *${lateDays} días de atraso*.`:""} Por favor realiza tu pago a la brevedad. Gracias 🙏`;
  const client=state.loanClients.find(c=>c.name.toLowerCase()===l.client.toLowerCase());
  window.open(`https://wa.me/${(client?.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

// ===== VAPER =====
function renderVaper(){
  return`
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
      ${btn("Agregar","addVaperProduct()")}`)}
    <h2 class="section-title">Inventario</h2>
    <div id="vaperList">${state.vaperInventory.map(vaperProductHTML).join("")}</div>
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

function filterVaper(){
  const q=(document.getElementById("vaperSearch")?.value||"").toLowerCase();
  const el=document.getElementById("vaperList");
  if(el)el.innerHTML=state.vaperInventory.filter(p=>p.product.toLowerCase().includes(q)||p.flavor.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q)).map(vaperProductHTML).join("");
}

function vaperProductHTML(p){
  const gain=Number(p.price)-Number(p.cost);const low=Number(p.quantity)<=3;
  return`<article class="card" style="${low?"border-color:rgba(255,204,77,.6)":""}">
    <h3 class="title">☁ ${esc(p.product)} ${low?'<span class="pill warn">⚠ Stock bajo</span>':''}</h3>
    <p>Marca: ${esc(p.brand)} | Modelo: ${esc(p.model)} | Sabor: ${esc(p.flavor)} | Tipo: ${esc(p.type)}</p>
    <p>Cantidad: <strong>${p.quantity}</strong> uds. | Costo: ${money(p.cost)} → Venta: ${money(p.price)}</p>
    <p class="green">Ganancia/ud: ${money(gain)} | Valor inventario: ${money(Number(p.quantity)*Number(p.cost))}</p>
    <div class="row" style="margin-top:8px">
      ${sm("✏ Editar","openEdit('vaperProduct','"+p.id+"')","")}
      ${sm("🗑 Eliminar","deleteRecord('vaperProduct','"+p.id+"')","red")}
    </div>
  </article>`;
}

// ===== BARBERÍA =====
function renderBarber(){
  const todayApts=state.barberAppointments.filter(a=>a.date===today());
  return`
    <h1 class="section-title">✂ Módulo Barbería</h1>
    <section class="grid-3">
      ${metric("📅","Citas",state.barberAppointments.length,"Total")}
      ${metric("👥","Clientes",state.barberClients.length,"Registrados")}
      ${metric("💈","Ingresos",money(barberIncome()),"Total")}
    </section>
    <div class="search-box">${inp("barberSearch","Buscar cliente...")}${sm("🔍","filterBarber()","green")}</div>
    ${card("📅 Agenda de hoy",todayApts.length?todayApts.map(a=>`
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>${esc(a.client)}</strong> — ${esc(a.service)} <span class="muted">${esc(a.time)}</span></div>
        <div style="display:flex;align-items:center;gap:6px"><span class="pill green">${money(a.price)}</span>${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}</div>
      </div>`).join(""):`<div class="empty">Sin citas hoy</div>`)}
    ${card("➕ Agendar cita",`
      <div class="row">${inp("barberClient","Cliente")}${inp("barberPhone","Teléfono")}</div>
      ${inp("barberService","Servicio")}
      <div class="row">${inp("barberDate","Fecha","text",today())}${inp("barberTime","Hora")}${inp("barberPrice","Precio","number")}</div>
      ${sel("barberReminder",["Sí","No"],"Sí")}
      ${btn("Agregar cita","addBarberAppointment()")}`)}
    <h2 class="section-title">Todas las citas</h2>
    <div id="barberAptList">
      ${state.barberAppointments.map(a=>`<article class="card">
        <h3 class="title">✂ ${esc(a.client)}</h3>
        <p>${esc(a.service)} | ${esc(a.date)} ${esc(a.time)} | Tel: ${esc(a.phone)}</p>
        <p class="green">${money(a.price)}</p>
        <div class="row" style="margin-top:8px">
          ${sm("💬 WA","whatsappBarber('"+a.id+"')","green")}
          ${sm("✏ Editar","openEdit('barberApt','"+a.id+"')","")}
          ${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}
        </div>
      </article>`).join("")}
    </div>
    ${card("👥 Clientes frecuentes",`
      <div class="row">${inp("barberClientName","Nombre")}${inp("barberClientPhone","Teléfono")}</div>
      ${ta("barberClientHistory","Historial de cortes")}
      <div class="row">${inp("barberClientFrequency","Frecuencia")}${inp("barberClientBirthday","Cumpleaños")}</div>
      ${btn("Agregar cliente","addBarberClient()")}
      <div id="barberClientList">
        ${state.barberClients.map(cl=>`<div class="list-item" style="display:flex;justify-content:space-between;align-items:flex-start">
          <div><strong>${esc(cl.name)}</strong> ${cl.birthday?`<span class="pill gold">🎂 ${esc(cl.birthday)}</span>`:""}
          <p class="muted">${esc(cl.frequency)} | ${esc(cl.phone)}</p></div>
          <div class="row">${sm("💬","whatsappBarberClient('"+cl.id+"')","green")}${sm("🗑","deleteRecord('barberClient','"+cl.id+"')","red")}</div>
        </div>`).join("")}
      </div>`)}
    ${card("💈 Servicios",`
      <div class="row">${inp("serviceName","Servicio")}${inp("servicePrice","Precio","number")}${inp("serviceDuration","Duración")}</div>
      ${btn("Agregar servicio","addBarberService()")}
      ${state.barberServices.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:8px 0">
        <span class="pill green">${esc(s.name)} • ${money(s.price)} • ${esc(s.duration)}</span>
        ${sm("🗑","deleteRecord('barberService','"+s.id+"')","red")}
      </div>`).join("")}`)}
    ${card("👷 Empleados",`
      <div class="row">${inp("employeeName","Nombre")}${inp("employeePercent","Comisión %","number")}</div>
      <div class="row">${inp("employeeSchedule","Horario")}${inp("employeePaid","Pagos realizados","number")}</div>
      ${btn("Agregar empleado","addEmployee()")}
      ${state.barberEmployees.map(e=>`<div class="list-item" style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>${esc(e.name)}</strong> — ${e.percent}% comisión<br>
        <span class="muted">${esc(e.schedule)}</span>
        <span class="pill green" style="margin-left:8px">Comisión: ${money(barberIncome()*e.percent/100)}</span></div>
        ${sm("🗑","deleteRecord('employee','"+e.id+"')","red")}
      </div>`).join("")}`)}
    ${card("💰 Finanzas Barbería",`
      ${inp("barberExpense","Gasto diario","number")}
      ${btn("Guardar gasto","addBarberExpense()")}
      <p style="margin-top:10px">Ingresos: ${money(barberIncome())}</p>
      <p>Gastos: ${money(barberExpenseTotal())}</p>
      <p class="green" style="font-size:18px;font-weight:900">Ganancia: ${money(barberIncome()-barberExpenseTotal())}</p>`)}`;
}

function filterBarber(){
  const q=(document.getElementById("barberSearch")?.value||"").toLowerCase();
  const el=document.getElementById("barberAptList");
  if(el)el.innerHTML=state.barberAppointments.filter(a=>a.client.toLowerCase().includes(q)).map(a=>`<article class="card">
    <h3 class="title">✂ ${esc(a.client)}</h3>
    <p>${esc(a.service)} | ${esc(a.date)} ${esc(a.time)}</p>
    <p class="green">${money(a.price)}</p>
    <div class="row">${sm("🗑","deleteRecord('barberApt','"+a.id+"')","red")}</div>
  </article>`).join("");
}

function whatsappBarber(aptId){
  const a=state.barberAppointments.find(x=>x.id===aptId);if(!a)return;
  const msg=`Hola ${a.client} 💈, te recordamos tu cita en la barbería el *${a.date}* a las *${a.time}* para *${a.service}*. Precio: *${money(a.price)}*. ¡Te esperamos!`;
  window.open(`https://wa.me/${(a.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}
function whatsappBarberClient(clientId){
  const c=state.barberClients.find(x=>x.id===clientId);if(!c)return;
  const msg=`Hola ${c.name} 💈, te contactamos desde Cedano Barbería. ¿Deseas agendar una cita?`;
  window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

// ===== REPORTES =====
function renderReports(){
  const mora=state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora").length;
  const totalGains=Number(state.moneyToday)-Number(state.moneySpent);
  return`
    <h1 class="section-title">▥ Reportes</h1>
    <section class="grid-3">
      ${metric("💚","Ganancia hoy",money(totalGains),"Hoy")}
      ${metric("☁","Vaper",money(vaperGain()),"Ganancia")}
      ${metric("✂","Barbería",money(barberIncome()-barberExpenseTotal()),"Ganancia")}
    </section>
    ${card("📅 Calendario",renderCalendar())}
    ${card("📈 Ganancias diarias",`<div class="chart-wrap"><canvas id="chartDaily"></canvas></div>`)}
    ${card("📊 Ganancias mensuales",`<div class="chart-wrap"><canvas id="chartMonthly"></canvas></div>`)}
    ${card("🏢 Rendimiento por negocio",`<div class="chart-wrap"><canvas id="chartBusiness"></canvas></div>`)}
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
      <input type="file" id="importFile" accept=".json" style="display:none" onchange="importBackup(this)">
      ${btn("📊 CSV Préstamos","exportCSV('loans')","secondary")}
      ${btn("📊 CSV Ventas Vaper","exportCSV('vaper')","secondary")}
      ${btn("🖨 Imprimir reporte","window.print()","secondary")}`)}
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
      ${btn("🗑 Reiniciar todos los datos","resetData()","danger-btn")}`)}
    <h2 class="section-title">Historial (últimos 7 días)</h2>
    ${state.history.length?state.history.map(dayHTML).join(""):`<div class="card"><div class="empty">Guarda un cierre nocturno para ver el historial.</div></div>`}`;
}

function renderCalendar(){
  const months=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const weekDays=["L","M","M","J","V","S","D"];
  const firstDay=new Date(calendarYear,calendarMonth,1);
  const lastDay=new Date(calendarYear,calendarMonth+1,0);
  let startDow=firstDay.getDay();if(startDow===0)startDow=7;
  const todayStr=today();
  const eventsByDate={};
  state.calendarEvents.forEach(e=>{if(!eventsByDate[e.date])eventsByDate[e.date]=[];eventsByDate[e.date].push(e)});
  state.barberAppointments.forEach(a=>{if(!eventsByDate[a.date])eventsByDate[a.date]=[];eventsByDate[a.date].push({type:"cita",title:a.client})});
  state.loans.forEach(l=>{if(!l.dueDate)return;if(!eventsByDate[l.dueDate])eventsByDate[l.dueDate]=[];eventsByDate[l.dueDate].push({type:"cobro",title:"Vence: "+l.client})});
  let cells=[];
  for(let i=1;i<startDow;i++)cells.push({empty:true});
  for(let d=1;d<=lastDay.getDate();d++){
    const ds=`${calendarYear}-${String(calendarMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({d,ds,events:eventsByDate[ds]||[],isToday:ds===todayStr});
  }
  while(cells.length%7!==0)cells.push({empty:true});
  return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <button class="small-btn" onclick="prevMonth()">◀</button>
      <strong>${months[calendarMonth]} ${calendarYear}</strong>
      <button class="small-btn" onclick="nextMonth()">▶</button>
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

function prevMonth(){calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--}render()}
function nextMonth(){calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++}render()}

function patrimonioHTML(){
  const items=[
    {label:"Efectivo",val:Number(state.capital)},
    {label:"Préstamos",val:totalLoanBalance()},
    {label:"Inventario Vaper",val:vaperInventoryValue()},
    {label:"Barbería",val:barberIncome()},
    {label:"Ahorros",val:Number(state.savings||0)}
  ];
  const total=patrimonyTotal();
  return`
    <div style="margin-bottom:12px">
      <p class="label">Patrimonio Total</p>
      <p style="font-size:28px;font-weight:900;color:var(--neon)">${money(total)}</p>
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

function dayHTML(day){
  return`<article class="card">
    <h3 class="title">📅 ${esc(day.date)}</h3>
    <p>Completadas: ${day.completed} | Pendientes: ${day.pending}</p>
    <p>Misión: ${esc(day.mission||"Sin misión")}</p>
    <p>Dinero: ${money(day.moneyToday)} | Gastos: ${money(day.moneySpent)}</p>
    <p>Horas productivas: ${day.productiveHours}</p>
    <p class="green">Estado: ${day.status} | Disciplina: ${day.discipline||0}%</p>
    <p class="muted">${esc(day.note||"Sin nota")}</p>
  </article>`;
}

function initCharts(){
  const days=["L","M","M","J","V","S","D"];
  const months=["Ene","Feb","Mar","Abr","May","Jun"];
  const tickColor="#a8b0b7";
  const chartOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
    scales:{x:{grid:{color:"rgba(128,128,128,.1)"},ticks:{color:tickColor}},
            y:{grid:{color:"rgba(128,128,128,.1)"},ticks:{color:tickColor,callback:v=>"RD$"+v.toLocaleString()}}}};
  const dEl=document.getElementById("chartDaily");
  if(dEl)chartInstances.daily=new Chart(dEl,{type:"bar",data:{labels:days,datasets:[{data:state.dailyRevenue,backgroundColor:"rgba(34,212,104,.75)",borderRadius:6}]},options:chartOpts});
  const mEl=document.getElementById("chartMonthly");
  if(mEl)chartInstances.monthly=new Chart(mEl,{type:"line",data:{labels:months,datasets:[{data:state.monthlyRevenue,borderColor:"#22d468",backgroundColor:"rgba(34,212,104,.1)",fill:true,tension:.4}]},options:chartOpts});
  const bEl=document.getElementById("chartBusiness");
  if(bEl)chartInstances.biz=new Chart(bEl,{type:"doughnut",data:{
    labels:["Préstamos","Vaper","Barbería"],
    datasets:[{data:[totalLoanBalance(),vaperGain(),barberIncome()],backgroundColor:["#22d468","#4db5ff","#c084fc"],borderColor:"transparent"}]
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tickColor}}}}});
}

// ===== IMPERIO =====
function renderImperio(){
  const total=patrimonyTotal();
  const xpPct=Math.min(100,Math.round(state.xp/nextRankXP()*100));
  const habitsCompleted=state.habits.filter(h=>h.done).length;
  const discipline=Math.round(habitsCompleted/state.habits.length*100)||0;
  return`
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

// ===== EDIT MODAL =====
function openEdit(type,id){
  editingType=type;editingId=id;
  const m=document.getElementById("editModal");
  const h=document.getElementById("editTitle");
  const c=document.getElementById("editContent");
  if(!m)return;
  if(type==="task"){
    const t=state.tasks.find(x=>x.id===id);if(!t)return;
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
    const l=state.loans.find(x=>x.id===id);if(!l)return;
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
    const c2=state.loanClients.find(x=>x.id===id);if(!c2)return;
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
    const p=state.vaperInventory.find(x=>x.id===id);if(!p)return;
    h.textContent="✏ Editar producto";
    c.innerHTML=`<div class="edit-form">
      <label>Producto</label>${inp("eProd","Producto","text",p.product)}
      <label>Marca</label>${inp("eBrand","Marca","text",p.brand)}
      <label>Sabor</label>${inp("eFlavor","Sabor","text",p.flavor)}
      <label>Cantidad</label>${inp("eQty","Cantidad","number",p.quantity)}
      <label>Costo</label>${inp("eCost","Costo","number",p.cost)}
      <label>Precio</label>${inp("ePrice","Precio","number",p.price)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  } else if(type==="barberApt"){
    const a=state.barberAppointments.find(x=>x.id===id);if(!a)return;
    h.textContent="✏ Editar cita";
    c.innerHTML=`<div class="edit-form">
      <label>Cliente</label>${inp("eClient","Cliente","text",a.client)}
      <label>Servicio</label>${inp("eService","Servicio","text",a.service)}
      <label>Fecha</label>${inp("eDate","Fecha","text",a.date)}
      <label>Hora</label>${inp("eTime","Hora","text",a.time)}
      <label>Precio</label>${inp("ePrice","Precio","number",a.price)}
      ${btn("Guardar cambios","saveEdit()")}
    </div>`;
  }
  m.classList.add("open");
}

function closeEditModal(){document.getElementById("editModal").classList.remove("open");editingId=null;editingType=null}

function saveEdit(){
  const g=id=>{const el=document.getElementById(id);return el?el.value:""};
  if(editingType==="task"){
    state.tasks=state.tasks.map(t=>t.id!==editingId?t:{...t,text:g("eText"),type:g("eType"),priority:g("ePriority"),date:g("eDate"),time:g("eTime")});
  } else if(editingType==="loan"){
    state.loans=state.loans.map(l=>l.id!==editingId?l:{...l,client:g("eClient"),capital:Number(g("eCapital")),interest:Number(g("eInterest")),startDate:g("eStart"),dueDate:g("eDue"),frequency:g("eFreq"),paid:Number(g("ePaid"))});
  } else if(editingType==="loanClient"){
    state.loanClients=state.loanClients.map(c=>c.id!==editingId?c:{...c,name:g("eName"),cedula:g("eCedula"),phone:g("ePhone"),address:g("eAddress"),reference:g("eRef"),notes:g("eNotes")});
  } else if(editingType==="vaperProduct"){
    state.vaperInventory=state.vaperInventory.map(p=>p.id!==editingId?p:{...p,product:g("eProd"),brand:g("eBrand"),flavor:g("eFlavor"),quantity:Number(g("eQty")),cost:Number(g("eCost")),price:Number(g("ePrice"))});
  } else if(editingType==="barberApt"){
    state.barberAppointments=state.barberAppointments.map(a=>a.id!==editingId?a:{...a,client:g("eClient"),service:g("eService"),date:g("eDate"),time:g("eTime"),price:Number(g("ePrice"))});
  }
  saveState();closeEditModal();render();
}

// ===== DELETE =====
function deleteRecord(type,id){
  if(!confirm("¿Eliminar este registro?"))return;
  if(type==="task")state.tasks=state.tasks.filter(x=>x.id!==id);
  else if(type==="loan")state.loans=state.loans.filter(x=>x.id!==id);
  else if(type==="loanClient")state.loanClients=state.loanClients.filter(x=>x.id!==id);
  else if(type==="vaperProduct")state.vaperInventory=state.vaperInventory.filter(x=>x.id!==id);
  else if(type==="vaperClient")state.vaperClients=state.vaperClients.filter(x=>x.id!==id);
  else if(type==="barberApt")state.barberAppointments=state.barberAppointments.filter(x=>x.id!==id);
  else if(type==="barberClient")state.barberClients=state.barberClients.filter(x=>x.id!==id);
  else if(type==="barberService")state.barberServices=state.barberServices.filter(x=>x.id!==id);
  else if(type==="employee")state.barberEmployees=state.barberEmployees.filter(x=>x.id!==id);
  saveState();render();
}

// ===== BACKUP =====
function exportBackup(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`cedano-backup-${today()}.json`;a.click();
}
function importBackupTrigger(){document.getElementById("importFile").click()}
function importBackup(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{const data=JSON.parse(e.target.result);state={...initialState,...data};saveState();render();alert("✅ Backup restaurado correctamente.")}
    catch{alert("❌ Archivo inválido.")}
  };
  reader.readAsText(file);
}

// ===== CSV =====
function exportCSV(type){
  let rows=[];let filename="";
  if(type==="loans"){
    filename=`cedano-prestamos-${today()}.csv`;
    rows=[["Cliente","Capital","Interés","Frecuencia","Fecha inicio","Fecha venc.","Pagado","Balance","Estado","Días atraso"]];
    state.loans.forEach(l=>rows.push([l.client,l.capital,l.interest+"%",l.frequency,l.startDate||"",l.dueDate||"",l.paid,loanBalance(l),l.status,calcLateDays(l)]));
  } else if(type==="vaper"){
    filename=`cedano-ventas-vaper-${today()}.csv`;
    rows=[["Cliente","Producto","Cantidad","Fecha","Método","Ganancia"]];
    state.vaperSales.forEach(s=>rows.push([s.client,s.product,s.quantity,s.date,s.method,s.gain]));
  }
  const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();
}

// ===== PIN MANAGEMENT =====
function savePin(){
  const p=document.getElementById("newPin")?.value;
  if(!p||p.length!==4||isNaN(p)){alert("Ingresa exactamente 4 dígitos numéricos.");return}
  state.pinEnabled=true;state.pin=p;pinUnlocked=true;
  saveState();render();alert("✅ PIN activado.");
}
function disablePin(){
  state.pinEnabled=false;state.pin="";pinUnlocked=true;
  saveState();render();alert("PIN desactivado.");
}

// ===== ACTIONS =====
function saveMission(){const v=document.getElementById("missionInput")?.value.trim();if(!v)return;setState({mission:v})}
function completeMission(){setState({xp:state.xp+50})}
function saveMoney(){setState({moneyGoal:Number(document.getElementById("goalInput")?.value||state.moneyGoal),moneyToday:Number(document.getElementById("todayMoneyInput")?.value||state.moneyToday)})}
function updatePatrimony(){setState({capital:Number(document.getElementById("capitalInput")?.value||state.capital),savings:Number(document.getElementById("savingsInput")?.value||state.savings)})}
function saveProfile(){setState({userName:document.getElementById("profileName")?.value||state.userName,businessName:document.getElementById("profileBusiness")?.value||state.businessName,capital:Number(document.getElementById("profileCapital")?.value||state.capital),usdRate:Number(document.getElementById("usdRateInput")?.value||state.usdRate)})}

function addHabit(){const t=document.getElementById("newHabitInput")?.value.trim();if(!t)return;state.habits.push({id:uid(),text:t,done:false,streak:0});saveState();render()}
function toggleHabit(id){
  state.habits=state.habits.map(h=>{
    if(h.id!==id)return h;
    const done=!h.done;if(done)state.xp+=5;
    return{...h,done,streak:done?h.streak+1:Math.max(0,h.streak-1)};
  });saveState();render();
}
function addTask(){
  const text=document.getElementById("taskText")?.value.trim();if(!text)return;
  state.tasks.push({id:uid(),text,type:document.getElementById("taskType")?.value||"Diario",date:document.getElementById("taskDate")?.value||"",time:document.getElementById("taskTime")?.value||"",priority:document.getElementById("taskPriority")?.value||"Media",done:false});
  saveState();render();
}
function toggleTask(id){
  state.tasks=state.tasks.map(t=>{if(t.id!==id)return t;const done=!t.done;if(done)state.xp+=10;return{...t,done}});
  saveState();render();
}
function saveTomorrowPlan(){
  const task=document.getElementById("tomorrowTask")?.value.trim();
  const reminder=document.getElementById("tomorrowReminder")?.value.trim();
  state.tomorrow.mission=document.getElementById("tomorrowMission")?.value||"";
  state.tomorrow.moneyGoal=document.getElementById("tomorrowGoal")?.value||"";
  if(task)state.tomorrow.tasks.push({id:uid(),text:task,done:false});
  if(reminder)state.tomorrow.reminders.push({id:uid(),text:reminder});
  saveState();render();
}
function addLoanClient(){
  const name=document.getElementById("clientName")?.value.trim();if(!name)return;
  state.loanClients.push({id:uid(),name,photo:"",cedula:document.getElementById("clientCedula")?.value||"",phone:document.getElementById("clientPhone")?.value||"",address:document.getElementById("clientAddress")?.value||"",reference:document.getElementById("clientReference")?.value||"",notes:document.getElementById("clientNotes")?.value||"",lastVisit:today()});
  saveState();render();
}
function addContact(){
  const name=document.getElementById("contactName")?.value.trim();if(!name)return;
  state.contacts.push({id:uid(),name,phone:document.getElementById("contactPhone")?.value||"",address:document.getElementById("contactAddress")?.value||"",source:document.getElementById("contactSource")?.value||"",note:document.getElementById("contactNote")?.value||"",priority:document.getElementById("contactPriority")?.value||"Media",status:"Pendiente"});
  saveState();render();
}
function updateContactStatus(id){setContactStatus(id,document.getElementById("status-"+id)?.value)}
function setContactStatus(id,status){state.contacts=state.contacts.map(c=>c.id===id?{...c,status}:c);saveState();render()}
function callContact(id){const c=state.contacts.find(c=>c.id===id);if(c)alert(`Llamar a ${c.name}: ${c.phone||"Sin teléfono"}`)}
function whatsappContact(id){const c=state.contacts.find(c=>c.id===id);if(c)window.open(`https://wa.me/${(c.phone||"").replace(/\D/g,"")}?text=Hola%20${encodeURIComponent(c.name)}`,"_blank")}
function deleteContact(id){state.contacts=state.contacts.filter(c=>c.id!==id);saveState();render()}
function addLoan(){
  const client=document.getElementById("loanClient")?.value.trim();const capital=Number(document.getElementById("loanCapital")?.value);if(!client||!capital)return;
  let capitalRD=capital;if(loanCurrency==="USD")capitalRD=capital*Number(state.usdRate||59);
  state.loans.push({id:uid(),client,capital:capitalRD,interest:Number(document.getElementById("loanInterest")?.value||0),currency:loanCurrency,startDate:document.getElementById("loanStartDate")?.value||today(),dueDate:document.getElementById("loanDueDate")?.value||"",frequency:document.getElementById("loanFrequency")?.value||"Semanal",paid:0,lateDays:0,status:"Al día"});
  saveState();render();
}
function updateLoanStatus(id){const status=document.getElementById("loanstatus-"+id)?.value;state.loans=state.loans.map(l=>l.id===id?{...l,status}:l);saveState();render()}
function addPayment(){
  const client=document.getElementById("paymentLoan")?.value.trim();const amount=Number(document.getElementById("paymentAmount")?.value);if(!client||!amount)return;
  state.payments.push({id:uid(),client,amount,date:document.getElementById("paymentDate")?.value||today()});
  state.loans=state.loans.map(l=>l.client.toLowerCase()===client.toLowerCase()?{...l,paid:Number(l.paid||0)+amount}:l);
  state.moneyToday+=amount;saveState();render();
}
function addVaperProduct(){
  const product=document.getElementById("vpProduct")?.value.trim();if(!product)return;
  state.vaperInventory.push({id:uid(),product,brand:document.getElementById("vpBrand")?.value||"",model:document.getElementById("vpModel")?.value||"",type:document.getElementById("vpType")?.value||"Desechable",flavor:document.getElementById("vpFlavor")?.value||"",quantity:Number(document.getElementById("vpQty")?.value||0),cost:Number(document.getElementById("vpCost")?.value||0),price:Number(document.getElementById("vpPrice")?.value||0)});
  saveState();render();
}
function addVaperSale(){
  const productName=document.getElementById("saleProduct")?.value.trim();if(!productName)return;
  const item=state.vaperInventory.find(p=>p.product.toLowerCase()===productName.toLowerCase());
  const qty=Number(document.getElementById("saleQty")?.value||1);
  const gain=item?(Number(item.price)-Number(item.cost))*qty:0;
  const income=item?Number(item.price)*qty:0;
  state.vaperSales.push({id:uid(),client:document.getElementById("saleClient")?.value||"",product:productName,quantity:qty,date:document.getElementById("saleDate")?.value||today(),method:document.getElementById("saleMethod")?.value||"Efectivo",gain});
  if(item){item.quantity=Math.max(0,Number(item.quantity)-qty);state.moneyToday+=income}
  saveState();render();
}
function addVaperClient(){
  const name=document.getElementById("vaperClientName")?.value.trim();if(!name)return;
  state.vaperClients.push({id:uid(),name,phone:document.getElementById("vaperClientPhone")?.value||"",history:document.getElementById("vaperClientHistory")?.value||"",totalSpent:0});
  saveState();render();
}
function addBarberAppointment(){
  const client=document.getElementById("barberClient")?.value.trim();if(!client)return;
  const price=Number(document.getElementById("barberPrice")?.value||0);
  state.barberAppointments.push({id:uid(),client,phone:document.getElementById("barberPhone")?.value||"",service:document.getElementById("barberService")?.value||"",date:document.getElementById("barberDate")?.value||today(),time:document.getElementById("barberTime")?.value||"",price,reminder:document.getElementById("barberReminder")?.value==="Sí"});
  state.moneyToday+=price;saveState();render();
}
function addBarberClient(){
  const name=document.getElementById("barberClientName")?.value.trim();if(!name)return;
  state.barberClients.push({id:uid(),name,phone:document.getElementById("barberClientPhone")?.value||"",history:document.getElementById("barberClientHistory")?.value||"",frequency:document.getElementById("barberClientFrequency")?.value||"",birthday:document.getElementById("barberClientBirthday")?.value||""});
  saveState();render();
}
function addBarberService(){
  const name=document.getElementById("serviceName")?.value.trim();if(!name)return;
  state.barberServices.push({id:uid(),name,price:Number(document.getElementById("servicePrice")?.value||0),duration:document.getElementById("serviceDuration")?.value||""});
  saveState();render();
}
function addEmployee(){
  const name=document.getElementById("employeeName")?.value.trim();if(!name)return;
  state.barberEmployees.push({id:uid(),name,percent:Number(document.getElementById("employeePercent")?.value||0),schedule:document.getElementById("employeeSchedule")?.value||"",paid:Number(document.getElementById("employeePaid")?.value||0)});
  saveState();render();
}
function addBarberExpense(){
  const amount=Number(document.getElementById("barberExpense")?.value||0);if(!amount)return;
  state.barberExpenses.push({id:uid(),amount,date:today()});state.moneySpent+=amount;saveState();render();
}

// ===== NIGHT SUMMARY =====
function openNightSummary(){
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
    ${items.map((item,i)=>`<div class="habit-item" id="nc${i}" onclick="toggleNC(${i})"><div class="habit-check" id="nch${i}"></div><span>${item}</span></div>`).join("")}
    ${inp("nightHours","Horas productivas hoy","number")}
    ${ta("nightNote","Nota personal del día")}
    ${btn("💾 Guardar cierre","saveNightSummary()")}
    ${btn("✕ Cerrar","closeNightSummary()","secondary")}`;
  document.getElementById("nightModal").classList.add("open");
}
function toggleNC(i){
  const item=document.getElementById("nc"+i);const check=document.getElementById("nch"+i);
  const done=!item.classList.contains("done");item.classList.toggle("done",done);check.textContent=done?"✓":"";
}
function closeNightSummary(){document.getElementById("nightModal").classList.remove("open")}
function saveNightSummary(){
  const reached=state.moneyToday>=state.moneyGoal;
  const completed=completedTasks();const pending=pendingTasks();
  const checks=["nc0","nc1","nc2","nc3","nc4"].filter(id=>document.getElementById(id)?.classList.contains("done")).length;
  const discipline=Math.round(checks/5*100);
  const day={date:today(),completed,pending,mission:state.mission,moneyToday:state.moneyToday,moneySpent:state.moneySpent,productiveHours:Number(document.getElementById("nightHours")?.value||0),note:document.getElementById("nightNote")?.value||"",discipline,status:reached&&pending===0?"Excelente":reached?"Bueno":pending<=2?"Regular":"Malo"};
  state.history=[day,...state.history.filter(h=>h.date!==day.date)].slice(0,7);
  state.xp+=completed*10+checks*5;state.disciplineScore=discipline;
  state.dailyRevenue=[...state.dailyRevenue.slice(1),state.moneyToday];
  saveState();closeNightSummary();go("Reportes");
}

// ===== IA =====
function openAI(){document.getElementById("aiModal").classList.add("open")}
function closeAI(){document.getElementById("aiModal").classList.remove("open")}
function askAI(q){document.getElementById("aiInput").value=q;runAI()}
function runAI(){
  const q=(document.getElementById("aiInput")?.value||"").toLowerCase();
  const res=document.getElementById("aiResponse");let answer="";
  if(q.includes("semana")){const weekly=state.dailyRevenue.reduce((s,v)=>s+v,0);answer=`📊 Esta semana generaste aproximadamente <strong>${money(weekly)}</strong>. Mejor día: <strong>${money(Math.max(...state.dailyRevenue))}</strong>.`}
  else if(q.includes("cobrar")||q.includes("mora")){const mora=state.loans.filter(l=>calcLateDays(l)>0||l.status==="En mora");answer=mora.length?`🔴 ${mora.length} cliente(s) en mora:<br>${mora.map(l=>`<strong>${esc(l.client)}</strong> — ${calcLateDays(l)} días — Balance: ${money(loanBalance(l))}`).join("<br>")}`:` ✅ No tienes clientes en mora actualmente.`}
  else if(q.includes("creciendo")||q.includes("crecimiento")){const vals=[["Préstamos",totalLoanBalance()],["Vaper",vaperGain()],["Barbería",barberIncome()]];const top=vals.sort((a,b)=>b[1]-a[1])[0];answer=`📈 El negocio con mayor capital activo es <strong>${top[0]}</strong> con ${money(top[1])}.`}
  else if(q.includes("meta mensual")||q.includes("producir hoy")){const metaMensual=state.moneyGoal*30;const historico=state.dailyRevenue.reduce((s,v)=>s+v,0);const diasRestantes=30-new Date().getDate();const necesario=Math.max(0,(metaMensual-historico)/Math.max(1,diasRestantes));answer=`🎯 Meta mensual estimada: ${money(metaMensual)}.<br>Acumulado: ${money(historico)}.<br>Necesitas <strong>${money(Math.round(necesario))}/día</strong> los próximos ${diasRestantes} días.`}
  else if(q.includes("patrimonio")){answer=`💰 Patrimonio total: <strong>${money(patrimonyTotal())}</strong><br>Efectivo: ${money(state.capital)}<br>Préstamos: ${money(totalLoanBalance())}<br>Inventario Vaper: ${money(vaperInventoryValue())}<br>Barbería: ${money(barberIncome())}<br>Ahorros: ${money(state.savings||0)}`}
  else{answer=`🧠 Prueba:<br>• ¿Cuánto gané esta semana?<br>• ¿Quiénes debo cobrar hoy?<br>• ¿Qué negocio está creciendo más?<br>• ¿Cuánto debo producir hoy para llegar a mi meta mensual?<br>• Resumen de patrimonio total`}
  res.innerHTML=answer;res.style.display="block";
}
function closeDetail(){document.getElementById("detailModal").classList.remove("open")}

function resetData(){
  if(!confirm("¿Seguro que quieres reiniciar todos los datos? Esta acción no se puede deshacer."))return;
  localStorage.removeItem(KEY);state=structuredClone(initialState);pinUnlocked=true;saveState();render();
}

setInterval(()=>{const c=document.getElementById("clock");if(c)c.textContent=new Date().toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"})},1000);

document.body.classList.toggle("light-mode",!darkMode);
render();