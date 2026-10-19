
// DEFAULT SAVINGS GOALS

const defaults = [
  {
    id: 1,
    name: "Emergency Fund",
    saved: 800,
    target: 2000,
    icon: "💰",
    color: "green"
  },
  {
    id: 2,
    name: "New Car",
    saved: 2500,
    target: 10000,
    icon: "🚘",
    color: "red"
  },
  {
    id: 3,
    name: "Vacation",
    saved: 3000,
    target: 5000,
    icon: "🌴",
    color: "green"
  },
  {
    id: 4,
    name: "New Computer",
    saved: 400,
    target: 2000,
    icon: "💻",
    color: "blue"
  }
];

// LOAD SAVED DATA

let goals;

try {
  const stored = JSON.parse(
    localStorage.getItem("moneyMentorGoals")
  );

  goals = Array.isArray(stored) ? stored : defaults;
} catch {
  goals = defaults;
}

let activeId = null;
let chosenIcon = "💰";

const $ = id => document.getElementById(id);

// FORMAT MONEY

function money(n) {
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });
}

// SAVE DATA

function save() {
  localStorage.setItem(
    "moneyMentorGoals",
    JSON.stringify(goals)
  );
}

// REFRESH LUCIDE ICONS

function refreshIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// CREATE A SAVINGS GOAL CARD

function card(g) {
  const pct = Math.min(
    100,
    Math.max(0, Math.round(g.saved / g.target * 100))
  );

  const el = document.createElement("button");
  el.type = "button";
  el.className = "goal-card";

  const icon = document.createElement("span");
  icon.className = "goal-icon " + g.color;
  icon.textContent = g.icon;

  const main = document.createElement("div");
  main.className = "goal-main";

  const head = document.createElement("div");
  head.className = "goal-head";

  const name = document.createElement("span");
  name.textContent = g.name;

  const percent = document.createElement("span");
  percent.className = "percent";
  percent.textContent = pct + "%";

  head.append(name, percent);

  const track = document.createElement("div");
  track.className = "progress";

  const fill = document.createElement("div");
  fill.className = "progress-fill" +
    (g.color === "blue" ? " bluebar" : "");

  fill.style.width = pct + "%";

  track.append(fill);

  const detail = document.createElement("div");
  detail.className = "goal-detail";

  detail.textContent =
    `${money(g.saved)} of ${money(g.target)}`;

  main.append(head, track, detail);
  el.append(icon, main);

  el.addEventListener("click", () => openMoney(g.id));

  return el;
}

// DISPLAY ALL GOALS

function render() {
  const list = $("goalsList");
  list.replaceChildren(...goals.map(card));
}

// SWITCH BETWEEN PAGES

function page(id) {
  for (const p of document.querySelectorAll(".page")) {
    p.classList.toggle("hidden", p.id !== id);
  }

  $("bottomNav").classList.toggle(
    "hidden",
    id !== "listPage"
  );

  $("message").textContent = "";
  refreshIcons();
}

// OPEN ADD MONEY PAGE

function openMoney(id) {
  activeId = id;

  const g = goals.find(x => x.id === id);

  if (!g) return;

  $("selectedGoal").replaceChildren(card(g));
  $("moneyForm").reset();

  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  $("moneyDate").value = localDate;

  page("moneyPage");
}

// OPEN CREATE GOAL PAGE

$("newGoalBtn").addEventListener("click", () => {
  page("createPage");
  $("goalForm").reset();
  chosenIcon = "💰";
  renderChoices();
});

// BACK BUTTONS

document.querySelectorAll("[data-back]").forEach(b => {
  b.addEventListener("click", () => {
    render();
    page("listPage");
  });
});

// AVAILABLE GOAL ICONS

const choices = [
  ["💰", "General", "green"],
  ["🚘", "Car", "red"],
  ["🌴", "Vacation", "green"],
  ["💻", "Computer", "blue"],
  ["🏠", "House", "red"],
  ["✨", "Other", "blue"]
];

// DISPLAY ICON OPTIONS

function renderChoices() {
  const wrap = $("iconChoices");
  wrap.replaceChildren();

  choices.forEach(([icon, label]) => {
    const b = document.createElement("button");

    b.type = "button";
    b.className = "icon-choice" +
      (chosenIcon === icon ? " selected" : "");

    b.textContent = icon;

    const sub = document.createElement("span");
    sub.textContent = label;

    b.append(sub);

    b.addEventListener("click", () => {
      chosenIcon = icon;
      renderChoices();
    });

    wrap.append(b);
  });
}

// ADD MONEY TO EXISTING GOAL

$("moneyForm").addEventListener("submit", e => {
  e.preventDefault();

  const amount = Number($("moneyAmount").value);

  const g = goals.find(x => x.id === activeId);

  if (!g || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  g.saved = Math.round((g.saved + amount) * 100) / 100;

  save();
  render();
  page("listPage");

});

// CREATE NEW SAVINGS GOAL

$("goalForm").addEventListener("submit", e => {
  e.preventDefault();

  const target = Number($("goalTarget").value);
  const name = $("goalName").value.trim();

  if (!name || !Number.isFinite(target) || target <= 0) {
    return;
  }

  const option = choices.find(
    x => x[0] === chosenIcon
  );

  goals.push({
    id: Date.now(),
    name: name,
    saved: 0,
    target: target,
    icon: chosenIcon,
    color: option[2],
    date: $("goalDate").value,
    note: $("goalNote").value
  });

  save();
  render();
  page("listPage");

});

// INITIALIZE PAGE

render();
renderChoices();
refreshIcons();
