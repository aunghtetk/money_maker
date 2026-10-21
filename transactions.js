/* Money Mentor — Transactions
   Browser-only demo. Data is stored in localStorage, not sent to a bank.
*/
const STORAGE_KEY = 'moneyMentorTransactions';
const expenseCategories = [
  ['Food','utensils'],['Transport','car-front'],['Bills','receipt'],['Shopping','shopping-bag'],
  ['Entertainment','gamepad-2'],['Health','heart-pulse'],['Education','graduation-cap'],['Other','ellipsis']
];
const incomeCategories = [
  ['Salary','briefcase-business'],['Freelance Work','laptop'],['Gift','gift'],['Interest','landmark'],
  ['Bonus','badge-dollar-sign'],['Rent','house'],['Refund','rotate-ccw'],['Other','ellipsis']
];
const moods = [
  {name:'Happy',emoji:'😊'}, {name:'Stressed',emoji:'😰'},
  {name:'Neutral',emoji:'😐'}, {name:'Sad',emoji:'😢'}, {name:'Excited',emoji:'🤩'}
];
const iconMap = Object.fromEntries([...expenseCategories,...incomeCategories]);
const $ = (selector) => document.querySelector(selector);
const money = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const todayLocal = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const parseDay = (s) => new Date(`${s}T12:00:00`);
const safeText = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid = (t) => t && typeof t.id==='string' && ['income','expense'].includes(t.type) && Number.isFinite(Number(t.amount)) && Number(t.amount)>0 && /^\d{4}-\d{2}-\d{2}$/.test(t.date);
function readTransactions(){
  try {const v=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(v)?v.filter(valid):[]}
  catch{return []}
}
let transactions=readTransactions();
let activeFilter='all', activeType='expense', selectedCategory='Food', selectedMood=null, amountText='0', activePeriod='month';
const collapsedDays=new Set();
function refreshIcons(){if(window.lucide)lucide.createIcons()}
function showView(name){
  ['listView','addView','moodView'].forEach(id=>{$(`#${id}`).hidden=id!==name});
  if(name==='listView')renderTransactions();
  if(name==='moodView')renderMood();
  window.scrollTo({top:0,behavior:'instant'});
  refreshIcons();
}
function dateLabel(s){
  const now=todayLocal();
  if(s===now)return 'Today';
  const yesterday=new Date(`${now}T12:00:00`);yesterday.setDate(yesterday.getDate()-1);
  if(s===todayString(yesterday))return 'Yesterday';
  return parseDay(s).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function todayString(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function formatTime(t){
  const d=new Date(t.createdAt||`${t.date}T12:00:00`);
  return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
function renderTransactions(){
  const search=$('#searchInput').value.trim().toLowerCase();
  const ordered=[...transactions].sort((a,b)=>b.date.localeCompare(a.date)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  // Running balance starts at $0 for entries recorded in this app; it is not a linked bank balance.
  let running=0;const balances={};
  [...ordered].reverse().forEach(t=>{running+=t.type==='income'?Number(t.amount):-Number(t.amount);balances[t.id]=running});
  const filtered=ordered.filter(t=>(activeFilter==='all'||t.type===activeFilter)&&(`${t.note||''} ${t.category||''} ${t.type}`.toLowerCase().includes(search)));
  const groups=new Map();filtered.forEach(t=>{if(!groups.has(t.date))groups.set(t.date,[]);groups.get(t.date).push(t)});
  $('#transactionGroups').innerHTML=[...groups].map(([date,items])=>`
    <section class="day-group ${collapsedDays.has(date)?'collapsed':''}">
      <button class="day-heading" data-day="${date}" aria-expanded="${!collapsedDays.has(date)}"><strong>${dateLabel(date)}</strong><span>${items.length} transaction${items.length===1?'':'s'} <i data-lucide="chevron-down"></i></span></button>
      <div class="day-items" ${collapsedDays.has(date)?'hidden':''}>${items.map(t=>{
        const icon=iconMap[t.category]||'circle-dollar-sign';
        const title=t.note?.trim()||t.category||'Transaction';
        return `<article class="transaction-card"><div class="transaction-icon"><i data-lucide="${icon}"></i></div><div class="transaction-main"><div class="transaction-name">${safeText(title)}</div><div class="transaction-meta">${safeText(t.category||t.type)} · ${formatTime(t)}</div></div><div class="transaction-money"><div class="transaction-amount ${t.type}">${t.type==='income'?'+':'−'}${money(Number(t.amount))}</div><div class="transaction-balance">${money(balances[t.id])}</div></div></article>`;
      }).join('')}</div>
    </section>`).join('');
  $('#emptyMessage').hidden=filtered.length!==0;
  document.querySelectorAll('.day-heading').forEach(btn=>btn.addEventListener('click',()=>{
    const date=btn.dataset.day;collapsedDays.has(date)?collapsedDays.delete(date):collapsedDays.add(date);renderTransactions();
  }));
  refreshIcons();
}
function setFilter(filter){activeFilter=filter;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));renderTransactions()}
function setType(type){
  activeType=type;selectedCategory=(type==='expense'?expenseCategories:incomeCategories)[0][0];selectedMood=null;
  document.querySelectorAll('.type-tab').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  $('#moodField').hidden=type==='income';renderCategories();renderMoodChoices();
}
function renderCategories(){
  $('#categoryOptions').innerHTML=(activeType==='expense'?expenseCategories:incomeCategories).map(([name,icon])=>`
    <button type="button" class="category-option ${selectedCategory===name?'selected':''}" data-category="${safeText(name)}" aria-pressed="${selectedCategory===name}"><span class="category-icon"><i data-lucide="${icon}"></i></span>${safeText(name)}</button>`).join('');
  document.querySelectorAll('.category-option').forEach(btn=>btn.addEventListener('click',()=>{selectedCategory=btn.dataset.category;renderCategories()}));
  refreshIcons();
}
function renderMoodChoices(){
  $('#moodChoices').innerHTML=moods.map(m=>`<button type="button" class="mood-choice ${selectedMood===m.name?'selected':''}" data-mood="${m.name}" aria-pressed="${selectedMood===m.name}"><span class="emoji">${m.emoji}</span>${m.name}</button>`).join('');
  document.querySelectorAll('.mood-choice').forEach(btn=>btn.addEventListener('click',()=>{selectedMood=selectedMood===btn.dataset.mood?null:btn.dataset.mood;renderMoodChoices()}));
}
function updateAmount(){
  const num=Number(amountText);
  $('#amountInput').value=amountText==='0'?'0.00':amountText.endsWith('.')?`${amountText}`:num.toLocaleString('en-US',{maximumFractionDigits:2});
}
function pressKey(key){
  if(key==='back'){amountText=amountText.length<=1?'0':amountText.slice(0,-1);}
  else if(key==='.'){if(!amountText.includes('.'))amountText+='.';}
  else if(/^\d$/.test(key)){
    if(amountText.includes('.')&&amountText.split('.')[1].length>=2)return;
    if(amountText.replace('.','').length>=9)return;
    amountText=amountText==='0'?key:amountText+key;
  }
  updateAmount();
}
function openAdd(){
  amountText='0';updateAmount();$('#transactionDate').value=todayLocal();$('#transactionNote').value='';setType('expense');showView('addView');
}
function saveTransaction(event){
  event.preventDefault();const amount=Number(amountText);if(!Number.isFinite(amount)||amount<=0){alert('Please enter an amount greater than $0.');return}
  const date=$('#transactionDate').value;if(!date){alert('Please select a date.');return}
  const t={id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,type:activeType,amount:Math.round(amount*100)/100,category:selectedCategory,date,note:$('#transactionNote').value.trim(),mood:activeType==='expense'?selectedMood:null,createdAt:new Date().toISOString()};
  const updated=[...transactions,t];
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(updated))}catch{alert('Unable to save transaction in this browser. Check your storage settings.');return}
  transactions=updated;setFilter('all');showView('listView');
}
function periodMatch(t){
  if(activePeriod==='all')return true;
  const date=parseDay(t.date),today=parseDay(todayLocal());
  if(activePeriod==='month')return date.getFullYear()===today.getFullYear()&&date.getMonth()===today.getMonth();
  const start=new Date(today);start.setDate(start.getDate()-((start.getDay()+6)%7));
  return date>=start&&date<=today;
}
function renderMood(){
  const records=transactions.filter(t=>t.type==='expense'&&t.mood&&moods.some(m=>m.name===t.mood)&&periodMatch(t));
  const sum=records.reduce((s,t)=>s+Number(t.amount),0);
  const max=Math.max(1,...moods.map(m=>records.filter(t=>t.mood===m.name).reduce((s,t)=>s+Number(t.amount),0)));
  $('#moodTotal').innerHTML=`<strong>${money(sum)}</strong> &nbsp; ${records.length} transaction${records.length===1?'':'s'}`;
  $('#moodChart').innerHTML=moods.map(m=>{
    const amount=records.filter(t=>t.mood===m.name).reduce((s,t)=>s+Number(t.amount),0);
    return `<div class="chart-column"><div class="bar-zone"><span class="bar-value">${money(amount)}</span><div class="bar ${amount?'':'empty-bar'}" style="height:${Math.max(3,amount/max*113)}px"></div></div><div class="chart-emoji">${m.emoji}</div><div class="chart-label">${m.name}</div></div>`;
  }).join('');
  $('#moodBreakdown').innerHTML=moods.map(m=>{
    const matching=records.filter(t=>t.mood===m.name),amount=matching.reduce((s,t)=>s+Number(t.amount),0);
    return `<div class="breakdown-row"><span class="breakdown-emoji">${m.emoji}</span><div class="breakdown-name">${m.name}<small>${matching.length} transaction${matching.length===1?'':'s'}</small></div><div class="breakdown-value">${money(amount)}<small>${sum?(amount/sum*100).toFixed(1):'0.0'}%</small></div></div>`;
  }).join('');
}

/* ==========================================
   EVENT LISTENERS
   ========================================== */

// Search transactions
$('#searchInput').addEventListener('input', renderTransactions);

// Filter transactions
document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

// Switch between Expense and Income
document.querySelectorAll('.type-tab').forEach(button => {
  button.addEventListener('click', () => {
    setType(button.dataset.type);
  });
});

// Mood analytics time filters
document.querySelectorAll('.period-tab').forEach(button => {
  button.addEventListener('click', () => {
    activePeriod = button.dataset.period;

    document.querySelectorAll('.period-tab').forEach(tab => {
      tab.classList.toggle('active', tab === button);
    });

    renderMood();
  });
});

// Open Add Transaction page
$('#addButton').addEventListener('click', openAdd);

// Open Mood & Spending Patterns page
$('#moodLink').addEventListener('click', () => {
  showView('moodView');
});

// Back buttons
document.querySelectorAll('.back').forEach(button => {
  button.addEventListener('click', () => {
    showView('listView');
  });
});

// Number keypad
document.querySelectorAll('[data-key]').forEach(button => {
  button.addEventListener('click', () => {
    pressKey(button.dataset.key);
  });
});

// Save transaction
$('#transactionForm').addEventListener('submit', saveTransaction);


/* ==========================================
   INITIALIZE PAGE
   ========================================== */

setType('expense');
renderTransactions();
refreshIcons();
