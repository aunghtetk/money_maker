// Sample bills match the Figma mockup. Replace or populate from your bills page later.
const sampleBills = [
  { id: 'rent', name: 'Rent', due: 'Oct 20', amount: 150, selected: true },
  { id: 'phone', name: 'Phone Bill', due: 'Oct 22', amount: 40, selected: true },
  { id: 'netflix', name: 'Netflix', due: 'Oct 24', amount: 10, selected: true }
];

const bills = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem('moneyMentorUpcomingBills'));
    if (Array.isArray(saved) && saved.every(b => typeof b.name === 'string' && Number.isFinite(Number(b.amount)))) {
      return saved.map((b, i) => ({ id: String(b.id ?? i), name: b.name, due: String(b.due ?? ''), amount: Math.max(0, Number(b.amount)), selected: b.selected !== false }));
    }
  } catch (_) { /* Keep sample bills */ }
  return sampleBills;
})();
const $ = id => document.getElementById(id);
const currency = amount => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(amount);
const iconRefresh = () => window.lucide?.createIcons();
const make = (tag, cls, value) => { const el = document.createElement(tag); if(cls) el.className = cls; if(value !== undefined) el.textContent = value; return el; };

function selectedBills() { return bills.filter(b => b.selected); }
function totalBills() { return selectedBills().reduce((sum, b) => sum + b.amount, 0); }
function renderBills() {
  const list = $('billChoices'); list.replaceChildren();
  bills.forEach(bill => {
    const row = make('label','bill-row');
    const check = make('input'); check.type='checkbox'; check.checked=bill.selected;
    check.addEventListener('change', () => { bill.selected=check.checked; updateTotal(); });
    const info = make('span','bill-info');
    info.append(make('span','bill-name',bill.name),make('span','bill-due',`Due ${bill.due}`));
    row.append(check,info,make('strong','bill-amount',currency(bill.amount))); list.append(row);
  });
  updateTotal();
}
function updateTotal() { $('billsTotal').textContent=currency(totalBills()); }
function showForm() { $('resultView').hidden=true; $('formView').hidden=false; window.scrollTo(0,0); }
function showResult(event) {
  event.preventDefault();
  const money=Number($('availableMoney').value), days=Number($('daysUntilIncome').value);
  const error=$('formError'); error.hidden=true;
  if (!$('availableMoney').value || !Number.isFinite(money) || money<0 || !$('daysUntilIncome').value || !Number.isSafeInteger(days) || days<1) {
    error.textContent='Enter a valid money amount and a whole number of days (at least 1).';error.hidden=false;return;
  }
  const billTotal=totalBills(), remaining=money-billTotal, daily=Math.max(0,remaining/days);
  $('dailyAmount').textContent=currency(Math.floor(daily*100)/100);
  $('daysSummary').textContent=`For the next ${days} ${days===1?'day':'days'}`;
  $('summaryMoney').textContent=currency(money);
  $('summaryBills').textContent=`−${currency(billTotal)}`;
  $('summaryRemaining').textContent=currency(remaining);
  const included=$('includedBills');included.replaceChildren();
  if (!selectedBills().length) included.append(make('p','bill-due','No upcoming bills selected.'));
  selectedBills().forEach(b => {
    const row=make('div','included-row');const check=make('i');check.setAttribute('data-lucide','check-square');
    const label=make('span','name',b.name);label.append(make('span','due',` · ${b.due}`));
    row.append(check,label,make('strong','',currency(b.amount)));included.append(row);
  });
  $('tipText').textContent=remaining<0
    ? `Your selected bills exceed your available money by ${currency(-remaining)}. Your safe daily spending is $0. Consider adjusting expenses or finding additional funds.`
    : remaining===0 ? 'Your available money is fully committed to bills. Avoid extra spending until your next income.'
    : `Try to stay below ${currency(Math.floor(daily*100)/100)} per day. Spending less on some days gives you more flexibility on others.`;
  $('formView').hidden=true;$('resultView').hidden=false;iconRefresh();window.scrollTo(0,0);
}
$('budgetForm').addEventListener('submit',showResult);
$('recalculate').addEventListener('click',showForm);
$('backButton').addEventListener('click',() => {if (!$('resultView').hidden) showForm(); else window.location.href='index.html';});
renderBills();iconRefresh();
