// ============================================================
// DATA LAYER
// ============================================================
const STORAGE_KEY = 'rcc_v3';
let state = {
  activeSection: null,
  sections: [],
  ctxRow: null,
  editRowId: null,
  selectedStatus: 'Pending',
  charts: {},
  releaseName: 'My Project'
};

const DEFAULT_SECTIONS = [
  {
    id:'dev', name:'Development & Solution Delivery', icon:'💻', color:'#6366f1',
    subsections:[
      { id:'feat', label:'Features & User Stories', rows:[] },
      { id:'sprint', label:'Sprint Tracking', rows:[] },
      { id:'bugfix', label:'Bug Fixes & Tech Debt', rows:[] }
    ]
  },
  {
    id:'devops', name:'DevOps & Platform', icon:'⚙️', color:'#22d3ee',
    subsections:[
      { id:'cicd', label:'CI/CD Pipeline', rows:[] },
      { id:'prod_deploy', label:'Deploy to PROD', rows:[] },
      { id:'infra', label:'Infrastructure & Config', rows:[] }
    ]
  },
  {
    id:'data', name:'Data Migration', icon:'🗄️', color:'#f59e0b',
    subsections:[
      { id:'data_prep', label:'Data Preparation & Validation', rows:[] },
      { id:'data_prod', label:'Migration to PROD', rows:[] },
      { id:'data_rollback', label:'Rollback Plan', rows:[] }
    ]
  },
  {
    id:'qa', name:'QA & Testing', icon:'🧪', color:'#10b981',
    subsections:[
      { id:'sanity', label:'Sanity Check on PROD', rows:[] },
      { id:'e2e', label:'E2E Flow Check on PROD', rows:[] },
      { id:'uat', label:'UAT — Feature-by-Feature', rows:[] },
      { id:'regression', label:'Regression Suite', rows:[] }
    ]
  },
  {
    id:'release', name:'Release Management', icon:'🚀', color:'#a855f7',
    subsections:[
      { id:'go_nogo', label:'Go / No-Go Checklist', rows:[] },
      { id:'comm', label:'Stakeholder Comms', rows:[] },
      { id:'hotfix', label:'Hotfix / Rollback Plan', rows:[] }
    ]
  }
];

const DEFAULT_ROWS = () => [
  {id:uid(), name:'Sample item', owner:'Unassigned', date:'', priority:'Medium', status:'Pending', progress:0, notes:''}
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e){}
  const s = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  s.forEach(sec=>sec.subsections.forEach(sub=>sub.rows=DEFAULT_ROWS()));
  return { sections:s };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ sections: state.sections }));
  updateSidebar();
  updateOverall();
}

function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', ()=>{
  const loaded = loadState();
  state.sections = loaded.sections;
  updateSidebar();
  updateOverall();
  // auto select first
  if (state.sections.length) selectSection(state.sections[0].id);
  renderDashboard();
});

// ============================================================
// SIDEBAR
// ============================================================
function updateSidebar() {
  const list = document.getElementById('sectionList');
  list.innerHTML = '';
  state.sections.forEach(sec=>{
    const total = sec.subsections.reduce((a,s)=>a+s.rows.length,0);
    const done = sec.subsections.reduce((a,s)=>a+s.rows.filter(r=>r.status==='Done').length,0);
    const el = document.createElement('div');
    el.className = 'section-item'+(state.activeSection===sec.id?' active':'');
    el.onclick = ()=>selectSection(sec.id);
    el.oncontextmenu = (e)=>{ e.preventDefault(); showSectionCtx(e,sec.id); };
    el.innerHTML = `
      <div class="section-icon" style="background:${sec.color}22;">${sec.icon}</div>
      <span class="section-name">${sec.name}</span>
      <span class="section-count">${done}/${total}</span>
    `;
    list.appendChild(el);
  });
}

function selectSection(id) {
  state.activeSection = id;
  updateSidebar();
  renderGrid();
}

function updateOverall() {
  let total=0,done=0;
  state.sections.forEach(s=>s.subsections.forEach(sub=>{
    total+=sub.rows.length; done+=sub.rows.filter(r=>r.status==='Done').length;
  }));
  const pct = total?Math.round(done/total*100):0;
  document.getElementById('overallPct').textContent = pct+'%';
  document.getElementById('overallBar').style.width = pct+'%';
}

// ============================================================
// GRID RENDER
// ============================================================
function renderGrid() {
  const sec = state.sections.find(s=>s.id===state.activeSection);
  if (!sec) return;
  document.getElementById('sectionTitle').textContent = sec.icon+' '+sec.name;
  const totalItems = sec.subsections.reduce((a,s)=>a+s.rows.length,0);
  const doneItems = sec.subsections.reduce((a,s)=>a+s.rows.filter(r=>r.status==='Done').length,0);
  document.getElementById('sectionMeta').textContent = `${totalItems} items · ${doneItems} done`;

  const body = document.getElementById('gridBody');
  body.innerHTML = '';

  sec.subsections.forEach(sub=>{
    const wrap = document.createElement('div');
    wrap.className = 'subsection';
    wrap.innerHTML = `
      <div class="subsection-header">
        <span class="subsection-label">${sub.label}</span>
        <div class="subsection-line"></div>
        <span class="subsection-add" onclick="addRow('${sub.id}')">+ Add</span>
      </div>
      ${renderTable(sub)}
    `;
    body.appendChild(wrap);
  });
}

function renderTable(sub) {
  if (!sub.rows.length) return `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;background:var(--bg-card);border-radius:10px;border:1px dashed var(--border);">No items yet — click + Add to start</div>`;
  
  let rows = sub.rows.map((r,i)=>`
    <tr data-id="${r.id}" data-sub="${sub.id}" oncontextmenu="showRowCtx(event,'${r.id}','${sub.id}')">
      <td style="width:32px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;font-size:11px;">${i+1}</td>
      <td>
        <span class="editable" contenteditable="true" data-field="name" data-id="${r.id}" data-sub="${sub.id}" onblur="inlineEdit(this)">${esc(r.name)}</span>
      </td>
      <td>
        <span class="avatar">${initials(r.owner)}</span>
        <span class="editable" contenteditable="true" data-field="owner" data-id="${r.id}" data-sub="${sub.id}" onblur="inlineEdit(this)" style="margin-left:6px;">${esc(r.owner)}</span>
      </td>
      <td><span class="editable" contenteditable="true" data-field="date" data-id="${r.id}" data-sub="${sub.id}" onblur="inlineEdit(this)">${r.date||'—'}</span></td>
      <td><span class="priority priority-${r.priority==='High'?'high':r.priority==='Low'?'low':'med'}">${r.priority}</span></td>
      <td onclick="cycleStatus('${r.id}','${sub.id}')">${statusBadge(r.status)}</td>
      <td style="min-width:130px;">
        <div class="mini-progress">
          <div class="mini-bar"><div class="mini-fill" style="width:${r.progress}%;background:${progressColor(r.progress)}"></div></div>
          <span class="mini-pct editable" contenteditable="true" data-field="progress" data-id="${r.id}" data-sub="${sub.id}" onblur="inlineEdit(this)">${r.progress}%</span>
        </div>
      </td>
      <td><span class="editable" contenteditable="true" data-field="notes" data-id="${r.id}" data-sub="${sub.id}" onblur="inlineEdit(this)" style="color:var(--text-secondary);font-size:12px;">${esc(r.notes)||'—'}</span></td>
      <td><span class="row-del" onclick="deleteRow('${r.id}','${sub.id}')">✕</span></td>
    </tr>
  `).join('');

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name / Description</th>
          <th>Owner</th>
          <th>Target Date</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function statusBadge(status) {
  const map = { 'Done':'done','In Progress':'progress','Blocked':'blocked','Pending':'pending','N/A':'na' };
  return `<span class="badge badge-${map[status]||'pending'}">${status}</span>`;
}
function progressColor(p) {
  if(p>=75) return 'linear-gradient(90deg,#10b981,#22d3ee)';
  if(p>=40) return 'linear-gradient(90deg,#6366f1,#a855f7)';
  return 'linear-gradient(90deg,#f59e0b,#ef4444)';
}
function esc(s='') { return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function initials(name='') { return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('') || '?'; }

// ============================================================
// INLINE EDIT
// ============================================================
function inlineEdit(el) {
  const { field, id, sub } = el.dataset;
  const sec = state.sections.find(s=>s.id===state.activeSection);
  if (!sec) return;
  const subsec = sec.subsections.find(s=>s.id===sub);
  if (!subsec) return;
  const row = subsec.rows.find(r=>r.id===id);
  if (!row) return;
  let val = el.textContent.trim();
  if (field==='progress') { val=parseInt(val)||0; val=Math.min(100,Math.max(0,val)); }
  row[field] = val;
  saveState();
  renderGrid();
  updateDashboardLive();
}

// ============================================================
// STATUS CYCLE
// ============================================================
const STATUS_CYCLE = ['Pending','In Progress','Done','Blocked','N/A'];
function cycleStatus(rowId, subId) {
  const sec = state.sections.find(s=>s.id===state.activeSection);
  const subsec = sec.subsections.find(s=>s.id===subId);
  const row = subsec.rows.find(r=>r.id===rowId);
  const idx = STATUS_CYCLE.indexOf(row.status);
  row.status = STATUS_CYCLE[(idx+1)%STATUS_CYCLE.length];
  if (row.status==='Done') row.progress=100;
  saveState();
  renderGrid();
  updateDashboardLive();
  toast('Status updated to '+row.status, '✅');
}

// ============================================================
// ADD / DELETE ROW
// ============================================================
let activeSubId = null;
function addRow(subId) {
  activeSubId = subId;
  state.editRowId = null;
  document.getElementById('modalTitle').textContent = 'Add Item';
  clearModal();
  openModal();
}
function deleteRow(rowId, subId) {
  const sec = state.sections.find(s=>s.id===state.activeSection);
  const subsec = sec.subsections.find(s=>s.id===subId);
  subsec.rows = subsec.rows.filter(r=>r.id!==rowId);
  saveState();
  renderGrid();
  updateDashboardLive();
  toast('Item removed','🗑');
}

// ============================================================
// MODAL
// ============================================================
function openModal() { document.getElementById('rowModal').classList.add('open'); document.getElementById('fName').focus(); }
function closeModal() { document.getElementById('rowModal').classList.remove('open'); }
function clearModal() {
  ['fName','fOwner','fNotes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fDate').value='';
  document.getElementById('fPriority').value='Medium';
  document.getElementById('fProgress').value='0';
  selectStatus(document.querySelector('[data-val="Pending"]'));
}
function selectStatus(el) {
  document.querySelectorAll('.status-opt').forEach(e=>e.classList.remove('sel'));
  el.classList.add('sel');
  state.selectedStatus = el.dataset.val;
}
function saveRow() {
  const sec = state.sections.find(s=>s.id===state.activeSection);
  if (!sec) return;
  const name = document.getElementById('fName').value.trim();
  if (!name) { alert('Please enter a name.'); return; }
  const row = {
    id: state.editRowId||uid(),
    name, owner: document.getElementById('fOwner').value||'Unassigned',
    date: document.getElementById('fDate').value,
    priority: document.getElementById('fPriority').value,
    status: state.selectedStatus,
    progress: parseInt(document.getElementById('fProgress').value)||0,
    notes: document.getElementById('fNotes').value
  };
  if (state.editRowId) {
    sec.subsections.forEach(sub=>{
      const idx=sub.rows.findIndex(r=>r.id===state.editRowId);
      if(idx>-1) sub.rows[idx]=row;
    });
    toast('Item updated','✏️');
  } else {
    const targetSub = activeSubId ? sec.subsections.find(s=>s.id===activeSubId) : sec.subsections[0];
    if (targetSub) targetSub.rows.push(row);
    toast('Item added','➕');
  }
  closeModal();
  saveState();
  renderGrid();
  updateDashboardLive();
}

// ============================================================
// SECTION MODAL
// ============================================================
function openAddSection() { document.getElementById('sectionModal').classList.add('open'); document.getElementById('sName').focus(); }
function closeSectionModal() { document.getElementById('sectionModal').classList.remove('open'); }
function saveSection() {
  const name = document.getElementById('sName').value.trim();
  if (!name) return;
  const icon = document.getElementById('sIcon').value||'📁';
  const color = document.getElementById('sColor').value;
  const id = uid();
  state.sections.push({ id, name, icon, color, subsections:[
    { id:uid(), label:'General', rows:[] }
  ]});
  document.getElementById('sName').value='';
  document.getElementById('sIcon').value='';
  closeSectionModal();
  saveState();
  selectSection(id);
  toast('Section created: '+name,'📁');
}

// ============================================================
// CONTEXT MENU
// ============================================================
let ctxRowId=null, ctxSubId=null;
function showRowCtx(e, rowId, subId) {
  e.preventDefault();
  ctxRowId=rowId; ctxSubId=subId;
  const m=document.getElementById('ctxMenu');
  m.style.left=e.clientX+'px'; m.style.top=e.clientY+'px';
  m.classList.add('open');
}
document.addEventListener('click',()=>document.getElementById('ctxMenu').classList.remove('open'));
function ctxEdit() {
  const sec=state.sections.find(s=>s.id===state.activeSection);
  let row; sec.subsections.forEach(sub=>{const r=sub.rows.find(r=>r.id===ctxRowId);if(r)row=r;});
  if(!row)return;
  state.editRowId=ctxRowId; activeSubId=ctxSubId;
  document.getElementById('modalTitle').textContent='Edit Item';
  document.getElementById('fName').value=row.name;
  document.getElementById('fOwner').value=row.owner;
  document.getElementById('fDate').value=row.date;
  document.getElementById('fPriority').value=row.priority;
  document.getElementById('fProgress').value=row.progress;
  document.getElementById('fNotes').value=row.notes;
  const opt=document.querySelector(`.status-opt[data-val="${row.status}"]`);
  if(opt)selectStatus(opt);
  openModal();
}
function ctxDuplicate() {
  const sec=state.sections.find(s=>s.id===state.activeSection);
  sec.subsections.forEach(sub=>{
    const idx=sub.rows.findIndex(r=>r.id===ctxRowId);
    if(idx>-1){ const clone={...sub.rows[idx],id:uid(),name:sub.rows[idx].name+' (copy)'}; sub.rows.splice(idx+1,0,clone); }
  });
  saveState();renderGrid();toast('Row duplicated','📄');
}
function ctxDelete() { deleteRow(ctxRowId,ctxSubId); }
function ctxSetStatus(status) {
  const sec=state.sections.find(s=>s.id===state.activeSection);
  sec.subsections.forEach(sub=>{
    const row=sub.rows.find(r=>r.id===ctxRowId);
    if(row){row.status=status;if(status==='Done')row.progress=100;}
  });
  saveState();renderGrid();updateDashboardLive();toast('Marked '+status,'✅');
}

function showSectionCtx(e,secId) {
  // simple delete for sections
  if(confirm('Delete this section and all its data?')){
    state.sections=state.sections.filter(s=>s.id!==secId);
    if(state.activeSection===secId) state.activeSection=state.sections[0]?.id||null;
    saveState();
    if(state.activeSection) renderGrid(); else document.getElementById('gridBody').innerHTML='';
    toast('Section deleted','🗑');
  }
}

// ============================================================
// EXPORT
// ============================================================
function exportJSON() {
  const data = { exportedAt:new Date().toISOString(), sections:state.sections };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const projectName = document.getElementById('releaseBadge').textContent.trim().toLowerCase().replace(/\s+/g,'-');
  dlBlob(blob, projectName+'-release-status-'+Date.now()+'.json');
  toast('JSON exported','⬇');
}
function exportSectionCSV() {
  const sec=state.sections.find(s=>s.id===state.activeSection);
  if(!sec)return;
  const rows=[['Section','Subsection','Name','Owner','Date','Priority','Status','Progress','Notes']];
  sec.subsections.forEach(sub=>{
    sub.rows.forEach(r=>{
      rows.push([sec.name,sub.label,r.name,r.owner,r.date,r.priority,r.status,r.progress+'%',r.notes]);
    });
  });
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  dlBlob(blob,sec.name.replace(/\s+/g,'-').toLowerCase()+'.csv');
  toast('CSV exported','📄');
}
function dlBlob(blob,name) {
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name;a.click();URL.revokeObjectURL(a.href);
}

// ============================================================
// DASHBOARD
// ============================================================
let chartInstances={};
function renderDashboard() {
  buildKPIs();
  buildCharts();
}
function updateDashboardLive() {
  if(document.getElementById('dashboardView').classList.contains('active')) {
    buildKPIs();
    Object.values(chartInstances).forEach(c=>c.destroy());
    chartInstances={};
    buildCharts();
  }
}

function allRows() {
  return state.sections.flatMap(s=>s.subsections.flatMap(sub=>sub.rows));
}

function buildKPIs() {
  const rows=allRows();
  const total=rows.length;
  const done=rows.filter(r=>r.status==='Done').length;
  const blocked=rows.filter(r=>r.status==='Blocked').length;
  const inprog=rows.filter(r=>r.status==='In Progress').length;
  const avgProg=total?Math.round(rows.reduce((a,r)=>a+Number(r.progress),0)/total):0;
  const pct=total?Math.round(done/total*100):0;
  const kpis=[
    {label:'Overall Completion',value:pct+'%',sub:`${done} of ${total} items done`,cls:'kpi-green',icon:'✅'},
    {label:'In Progress',value:inprog,sub:'Active work items',cls:'kpi-blue',icon:'⚡'},
    {label:'Blocked Items',value:blocked,sub:'Need immediate attention',cls:'kpi-red',icon:'🚫'},
    {label:'Avg Progress',value:avgProg+'%',sub:'Across all items',cls:'kpi-purple',icon:'📊'},
    {label:'Total Sections',value:state.sections.length,sub:'Release areas',cls:'kpi-amber',icon:'📁'},
    {label:'Total Items',value:total,sub:'Across all sections',cls:'kpi-blue',icon:'📋'},
  ];
  document.getElementById('kpiGrid').innerHTML=kpis.map(k=>`
    <div class="kpi-card ${k.cls}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');
}

function buildCharts() {
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  const textColor=isDark?'#8b91a8':'#5a6080';
  const gridColor=isDark?'#2a2f42':'#e2e5ef';
  const font={family:'DM Sans'};
  Chart.defaults.color=textColor;
  Chart.defaults.font=font;

  const rows=allRows();
  const g=document.getElementById('chartsGrid');
  g.innerHTML='';

  // 1. Status breakdown donut
  const c1=mkCard('Status Breakdown','Distribution across all items','200px');
  g.appendChild(c1.wrap);
  const statusCounts={Done:0,'In Progress':0,Blocked:0,Pending:0,'N/A':0};
  rows.forEach(r=>{statusCounts[r.status]=(statusCounts[r.status]||0)+1;});
  chartInstances.status=new Chart(c1.canvas,{type:'doughnut',data:{labels:Object.keys(statusCounts),datasets:[{data:Object.values(statusCounts),backgroundColor:['#10b981','#6366f1','#ef4444','#f59e0b','#64748b'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{padding:12,font:{size:12}}}}}});

  // 2. Progress by section bar
  const c2=mkCard('Progress by Section','Average completion %','200px');
  g.appendChild(c2.wrap);
  const secLabels=state.sections.map(s=>s.icon+' '+s.name.split(' ')[0]);
  const secAvg=state.sections.map(s=>{
    const r=s.subsections.flatMap(sub=>sub.rows);
    return r.length?Math.round(r.reduce((a,x)=>a+Number(x.progress),0)/r.length):0;
  });
  chartInstances.secProgress=new Chart(c2.canvas,{type:'bar',data:{labels:secLabels,datasets:[{label:'Avg Progress',data:secAvg,backgroundColor:state.sections.map(s=>s.color+'aa'),borderColor:state.sections.map(s=>s.color),borderWidth:2,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{min:0,max:100,grid:{color:gridColor},ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}},plugins:{legend:{display:false}}}});

  // 3. Priority split bar
  const c3=mkCard('Priority Distribution','Items by priority level','200px');
  g.appendChild(c3.wrap);
  const pri={High:0,Medium:0,Low:0};
  rows.forEach(r=>{pri[r.priority]=(pri[r.priority]||0)+1;});
  chartInstances.priority=new Chart(c3.canvas,{type:'bar',data:{labels:['High','Medium','Low'],datasets:[{data:[pri.High,pri.Medium,pri.Low],backgroundColor:['#ef444488','#f59e0b88','#10b98188'],borderColor:['#ef4444','#f59e0b','#10b981'],borderWidth:2,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{grid:{color:gridColor}},x:{grid:{display:false}}},plugins:{legend:{display:false}}}});

  // 4. Section items count
  const c4=mkCard('Items per Section','Total workload distribution','200px');
  g.appendChild(c4.wrap);
  const secCounts=state.sections.map(s=>s.subsections.reduce((a,sub)=>a+sub.rows.length,0));
  chartInstances.secCount=new Chart(c4.canvas,{type:'polarArea',data:{labels:secLabels,datasets:[{data:secCounts,backgroundColor:state.sections.map(s=>s.color+'55'),borderColor:state.sections.map(s=>s.color),borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{padding:10,font:{size:11}}}}}});

  // 5. Overall burndown radar
  const c5=mkCard('Section Health Radar','Done vs Blocked ratio','240px',true);
  g.appendChild(c5.wrap);
  const radDone=state.sections.map(s=>{ const r=s.subsections.flatMap(sub=>sub.rows); return r.length?Math.round(r.filter(x=>x.status==='Done').length/r.length*100):0; });
  const radBlocked=state.sections.map(s=>{ const r=s.subsections.flatMap(sub=>sub.rows); return r.length?Math.round(r.filter(x=>x.status==='Blocked').length/r.length*100):0; });
  chartInstances.radar=new Chart(c5.canvas,{type:'radar',data:{labels:secLabels,datasets:[{label:'Done %',data:radDone,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.15)',pointBackgroundColor:'#10b981',pointRadius:4,borderWidth:2},{label:'Blocked %',data:radBlocked,borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,0.1)',pointBackgroundColor:'#ef4444',pointRadius:4,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,scales:{r:{grid:{color:gridColor},ticks:{callback:v=>v+'%',stepSize:25,backdropColor:'transparent'},pointLabels:{font:{size:11,family:'DM Sans'}}}},plugins:{legend:{position:'top'}}}});
}

function mkCard(title,sub,h,full=false) {
  const wrap=document.createElement('div');
  wrap.className='chart-card'+(full?' chart-card-full':'');
  const canvas=document.createElement('canvas');
  canvas.style.maxHeight=h;
  wrap.innerHTML=`
    <div class="chart-title">${title}</div>
    <div class="chart-sub">${sub}</div>
  `;
  wrap.appendChild(canvas);
  return {wrap,canvas};
}

function downloadCharts(format) {
  const charts=document.querySelectorAll('#chartsGrid canvas');
  charts.forEach((canvas,i)=>{
    const a=document.createElement('a');
    if(format==='png'){
      a.href=canvas.toDataURL('image/png');
      a.download=`chart-${i+1}.png`;
    } else {
      // SVG approximation via canvas
      a.href=canvas.toDataURL('image/png');
      a.download=`chart-${i+1}.png`;
    }
    a.click();
  });
  toast('Charts downloaded (PNG)','📸');
}

// ============================================================
// VIEW SWITCH
// ============================================================
function switchView(view) {
  document.querySelectorAll('.view-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  if(view==='tracker'){
    document.getElementById('trackerView').classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
  } else {
    document.getElementById('dashboardView').classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    Object.values(chartInstances).forEach(c=>c.destroy());
    chartInstances={};
    buildKPIs();
    buildCharts();
  }
}

// ============================================================
// THEME
// ============================================================
function toggleTheme() {
  const html=document.documentElement;
  const isDark=html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme',isDark?'light':'dark');
  document.querySelector('.theme-toggle').textContent=isDark?'🌙':'☀️';
  if(document.getElementById('dashboardView').classList.contains('active')){
    Object.values(chartInstances).forEach(c=>c.destroy());
    chartInstances={};
    buildCharts();
  }
}

// ============================================================
// TOAST
// ============================================================
function toast(msg,icon='ℹ️') {
  const w=document.getElementById('toastWrap');
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML=`<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  w.appendChild(el);
  setTimeout(()=>el.remove(),3000);
}

// close modals on backdrop click
document.getElementById('rowModal').addEventListener('click',e=>{ if(e.target===e.currentTarget)closeModal(); });
document.getElementById('sectionModal').addEventListener('click',e=>{ if(e.target===e.currentTarget)closeSectionModal(); });
document.getElementById('importModal').addEventListener('click',e=>{ if(e.target===e.currentTarget)closeImport(); });

// keyboard
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){closeModal();closeSectionModal();closeImport();} });

// ============================================================
// IMPORT JSON
// ============================================================
let importedData = null;

function openImport() {
  importedData = null;
  document.getElementById('importModal').classList.add('open');
  document.getElementById('fileInput').value = '';
  document.getElementById('importPreview').className = 'import-preview';
  document.getElementById('importStats').className = 'import-stats';
  document.getElementById('importStats').innerHTML = '';
  document.getElementById('importError').className = 'import-error';
  document.getElementById('importError').textContent = '';
  document.getElementById('importModeWrap').style.display = 'none';
  const btn = document.getElementById('importConfirmBtn');
  btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed';
  document.getElementById('dropZone').querySelector('.drop-icon').textContent = '📂';
  document.getElementById('dropZone').querySelector('.drop-title').textContent = 'Drop your JSON file here';
}

function closeImport() {
  document.getElementById('importModal').classList.remove('open');
}

// Drag-and-drop
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

function handleFileSelect(file) {
  if (!file) return;
  if (!file.name.endsWith('.json') && file.type !== 'application/json') {
    showImportError('Please select a valid .json file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => parseImportedJSON(e.target.result, file.name);
  reader.onerror = () => showImportError('Could not read the file. Please try again.');
  reader.readAsText(file);
}

function parseImportedJSON(text, fileName) {
  clearImportError();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch(err) {
    showImportError('Invalid JSON — could not parse the file. (' + err.message + ')');
    return;
  }

  // Normalise: accept both this app's format and the Google Sheets GAS export format
  const sections = normaliseImport(parsed);
  if (!sections || !sections.length) {
    showImportError('No valid sections found in this file. Make sure it was exported from the Release Command Center (HTML or Google Sheets version).');
    return;
  }

  importedData = sections;

  // Stats
  const totalItems = sections.reduce((a,s)=>a+s.subsections.reduce((b,sub)=>b+sub.rows.length,0),0);
  const statEl = document.getElementById('importStats');
  statEl.className = 'import-stats visible';
  statEl.innerHTML = `
    <div class="stat-chip">📁 Sections: <span>${sections.length}</span></div>
    <div class="stat-chip">📋 Items: <span>${totalItems}</span></div>
    <div class="stat-chip">📄 File: <span>${fileName}</span></div>
    ${parsed.exportedAt ? `<div class="stat-chip">🕐 Exported: <span>${new Date(parsed.exportedAt).toLocaleDateString()}</span></div>` : ''}
  `;

  // Preview — show section/subsection tree
  const preview = sections.map(s =>
    `${s.icon||'📁'} ${s.name}\n` +
    s.subsections.map(sub =>
      `  └─ ${sub.label} (${sub.rows.length} items)`
    ).join('\n')
  ).join('\n\n');
  const previewEl = document.getElementById('importPreview');
  previewEl.className = 'import-preview visible';
  previewEl.textContent = preview;

  // Show mode options and enable button
  document.getElementById('importModeWrap').style.display = 'block';
  const btn = document.getElementById('importConfirmBtn');
  btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';

  // Update drop zone to success state
  dropZone.querySelector('.drop-icon').textContent = '✅';
  dropZone.querySelector('.drop-title').textContent = 'File loaded — ' + fileName;
}

function normaliseImport(parsed) {
  // Format A: this HTML app's export — { sections: [ { id, name, icon, color, subsections: [ { id, label, rows: [] } ] } ] }
  if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections[0]?.subsections) {
    return parsed.sections.map(s => ({
      id: s.id || uid(),
      name: s.name || 'Imported Section',
      icon: s.icon || '📁',
      color: s.color || '#6366f1',
      subsections: (s.subsections || []).map(sub => ({
        id: sub.id || uid(),
        label: sub.label || 'Items',
        rows: (sub.rows || []).map(r => ({
          id: r.id || uid(),
          name: r.name || '',
          owner: r.owner || '',
          date: r.date || '',
          priority: r.priority || 'Medium',
          status: r.status || 'Pending',
          progress: Number(r.progress) || 0,
          notes: r.notes || ''
        }))
      }))
    }));
  }

  // Format B: Google Sheets GAS export — { sections: [ { name, tab, items: [ { name, owner, targetDate, priority, status, progress, uatResult, notes } ] } ] }
  if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections[0]?.items) {
    return parsed.sections.map(s => ({
      id: uid(),
      name: s.name || s.tab || 'Imported Section',
      icon: guessIcon(s.name || s.tab || ''),
      color: guessColor(s.name || s.tab || ''),
      subsections: [{
        id: uid(),
        label: 'Imported Items',
        rows: (s.items || []).map(r => ({
          id: uid(),
          name: r.name || '',
          owner: r.owner || '',
          date: r.targetDate || r.date || '',
          priority: r.priority || 'Medium',
          status: r.status || 'Pending',
          progress: Number(r.progress) || 0,
          notes: [r.notes, r.uatResult && r.uatResult !== '—' ? 'UAT: '+r.uatResult : ''].filter(Boolean).join(' · ')
        }))
      }]
    }));
  }

  return null;
}

function guessIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('dev') || n.includes('feature')) return '💻';
  if (n.includes('devops') || n.includes('platform') || n.includes('infra')) return '⚙️';
  if (n.includes('data') || n.includes('migr')) return '🗄️';
  if (n.includes('qa') || n.includes('test')) return '🧪';
  if (n.includes('release') || n.includes('mgmt')) return '🚀';
  return '📁';
}

function guessColor(name) {
  const n = name.toLowerCase();
  if (n.includes('dev') && !n.includes('devops')) return '#6366f1';
  if (n.includes('devops') || n.includes('platform')) return '#22d3ee';
  if (n.includes('data')) return '#f59e0b';
  if (n.includes('qa') || n.includes('test')) return '#10b981';
  if (n.includes('release')) return '#a855f7';
  return '#6366f1';
}

function confirmImport() {
  if (!importedData) return;
  const mode = document.querySelector('input[name="importMode"]:checked').value;

  if (mode === 'replace') {
    const ok = confirm(`Replace ALL current data with ${importedData.length} imported sections?\n\nThis cannot be undone.`);
    if (!ok) return;
    state.sections = importedData;
    state.activeSection = state.sections[0]?.id || null;
  } else if (mode === 'merge') {
    state.sections = [...state.sections, ...importedData];
    state.activeSection = state.sections[0]?.id || null;
  } else if (mode === 'rows') {
    let matched = 0, skipped = 0;
    importedData.forEach(importSec => {
      const existing = state.sections.find(s =>
        s.name.replace(/\s+/g,'').toLowerCase() === importSec.name.replace(/\s+/g,'').toLowerCase()
      );
      if (existing) {
        importSec.subsections.forEach(importSub => {
          const existSub = existing.subsections.find(sub =>
            sub.label.toLowerCase() === importSub.label.toLowerCase()
          );
          if (existSub) {
            existSub.rows.push(...importSub.rows);
          } else {
            existing.subsections.push(importSub);
          }
        });
        matched++;
      } else {
        skipped++;
      }
    });
    toast(`Merged ${matched} sections · ${skipped} skipped (no name match)`, '🔀');
  }

  saveState();
  if (state.activeSection) renderGrid();
  updateDashboardLive();
  closeImport();
  toast('Import complete — ' + importedData.length + ' sections loaded', '✅');
}

function showImportError(msg) {
  const el = document.getElementById('importError');
  el.textContent = '⚠ ' + msg;
  el.className = 'import-error visible';
  importedData = null;
  const btn = document.getElementById('importConfirmBtn');
  btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed';
}

function clearImportError() {
  document.getElementById('importError').className = 'import-error';
}


  // Get URL parameter ?r=
  const params = new URLSearchParams(window.location.search);
  const releaseParam = params.get('r');

  // Get badge element
  const releaseBadge = document.getElementById('releaseBadge');

  // Set badge text if parameter exists
  if (releaseParam) {
    releaseBadge.textContent = releaseParam;
    state.releaseName = releaseParam;
  }

  // Function to get current badge value
  function getReleaseBadge() {
    return releaseBadge.textContent;
  }

  // Function to set badge value
  function setReleaseBadge(value) {
    releaseBadge.textContent = value;

    // Optional: update URL parameter too
    const url = new URL(window.location);
    url.searchParams.set('r', value);
    window.history.replaceState({}, '', url);
  }