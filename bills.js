const STORAGE_KEY = "moneyMentorBills";
const defaults = [
  {id:1,name:"Rent",amount:1200,due:"2026-11-01",repeat:"Monthly",paid:false},
  {id:2,name:"Phone",amount:80,due:"2026-11-01",repeat:"Monthly",paid:false},
  {id:3,name:"Electricity",amount:120,due:"2026-11-01",repeat:"Monthly",paid:false},
  {id:4,name:"Internet",amount:60,due:"2026-11-05",repeat:"Monthly",paid:false},
  {id:5,name:"Insurance",amount:150,due:"2026-11-10",repeat:"Monthly",paid:false},
  {id:6,name:"Spotify",amount:10.99,due:"2026-11-12",repeat:"Monthly",paid:false},
  {id:7,name:"Gym Membership",amount:29.99,due:"2026-11-15",repeat:"Monthly",paid:false}
];
function loadBills(){try{const data=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(data)?data:defaults.map(b=>({...b}));}catch{return defaults.map(b=>({...b}));}}
let bills=loadBills();let activeTab="upcoming";let selectedId=null;
const $=id=>document.getElementById(id);
const money=n=>Number(n).toLocaleString("en-US",{style:"currency",currency:"USD"});
const dateLabel=iso=>new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
function dueLabel(iso){const today=new Date();today.setHours(0,0,0,0);const due=new Date(iso+"T00:00:00");const days=Math.round((due-today)/86400000);return days<0?`${Math.abs(days)} days overdue`:days===0?"Due today":`Due in ${days} day${days===1?"":"s"}`;}
function saveBills(){localStorage.setItem(STORAGE_KEY,JSON.stringify(bills));}
function iconFor(name){const n=name.toLowerCase();return n.includes("rent")?"house":n.includes("phone")?"smartphone":n.includes("electric")?"zap":n.includes("internet")?"wifi":n.includes("insurance")?"shield-check":n.includes("spotify")?"music":n.includes("gym")?"dumbbell":"receipt";}
function show(view){["listView","addView","payView"].forEach(id=>$(id).classList.toggle("hidden",id!==view));window.scrollTo(0,0);lucide.createIcons();}
function render(){
  const search=$("searchBill").value.trim().toLowerCase();
  const shown=bills.filter(b=>(activeTab==="all"||(activeTab==="paid"?b.paid:!b.paid))&&b.name.toLowerCase().includes(search));
  const list=$("billList");list.replaceChildren();$("emptyMessage").hidden=shown.length>0;
  shown.forEach(b=>{
    const button=document.createElement("button");button.className="bill-card";button.type="button";
    const left=document.createElement("span");left.className="bill-icon";left.innerHTML=`<i data-lucide="${iconFor(b.name)}"></i>`;
    const info=document.createElement("span");info.className="bill-info";
    const title=document.createElement("strong");title.textContent=b.name;
    const due=document.createElement("small");due.textContent=`Due ${dateLabel(b.due)}`;info.append(title,due);
    const right=document.createElement("span");right.className="bill-right";
    const price=document.createElement("strong");price.textContent=money(b.amount);
    const status=document.createElement("small");status.textContent=b.paid?"Paid":dueLabel(b.due);if(b.paid)status.className="paid";right.append(price,status);
    const arrow=document.createElement("i");arrow.dataset.lucide="chevron-right";arrow.className="chevron";
    button.append(left,info,right,arrow);button.addEventListener("click",()=>openBill(b.id));list.append(button);
  });lucide.createIcons();
}
function openBill(id){selectedId=id;const b=bills.find(x=>x.id===id);if(!b)return;$("payName").textContent=b.name;$("payDue").textContent=`Due ${dateLabel(b.due)}`;$("payAmount").textContent=money(b.amount);$("payStatus").textContent=b.paid?"This bill has been paid.":"";$("confirmPay").disabled=b.paid;$("confirmPay").textContent=b.paid?"Paid":"Pay";show("payView");}
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{activeTab=tab.dataset.tab;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));render();}));
$("searchBill").addEventListener("input",render);
$("addBillBtn").addEventListener("click",()=>show("addView"));
document.querySelectorAll(".back-list").forEach(btn=>btn.addEventListener("click",()=>{show("listView");render();}));
$("addBillForm").addEventListener("submit",event=>{
  event.preventDefault();const name=$("billName").value.trim();const amount=Number($("billAmount").value);if(!name||!Number.isFinite(amount)||amount<=0)return;
  bills.push({id:Date.now(),name,amount,due:$("billDue").value,repeat:document.querySelector('input[name="repeat"]:checked').value,reminder:$("billReminder").checked,autoPay:$("billAuto").checked,paid:false});
  saveBills();event.target.reset();activeTab="upcoming";document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===activeTab));show("listView");render();
});
$("confirmPay").addEventListener("click",()=>{
  const bill=bills.find(b=>b.id===selectedId);if(!bill||bill.paid)return;
  bill.paid=true;bill.paidAt=new Date().toISOString();saveBills();activeTab="paid";
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===activeTab));show("listView");render();
});
render();lucide.createIcons();
