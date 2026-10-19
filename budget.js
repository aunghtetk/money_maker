
const budgetData = {
  totalBudget: 1500,
  categories: [
    {
      name: "Food",
      spent: 300,
      budget: 400,
      icon: "shopping-cart",
      color: "#ff526a",
      className: "food"
    },
    {
      name: "Shopping",
      spent: 200,
      budget: 300,
      icon: "shopping-bag",
      color: "#ae35e8",
      className: "shopping"
    },
    {
      name: "Transport",
      spent: 150,
      budget: 200,
      icon: "car-front",
      color: "#00a971",
      className: "transport"
    },
    {
      name: "Bills",
      spent: 200.20,
      budget: 400,
      icon: "file-text",
      color: "#ff831f",
      className: "bills"
    },
    {
      name: "Entertainment",
      spent: 100,
      budget: 200,
      icon: "gamepad-2",
      color: "#2678f9",
      className: "entertainment"
    }
  ]
};

function money(value) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getTotalSpent() {
  return budgetData.categories.reduce(
    (total, category) => total + category.spent, 0
  );
}

function getCategory(name) {
  return budgetData.categories.find(
    category => category.name === name
  );
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setProgress(id, percentage) {
  const element = document.getElementById(id);
  if (element) {
    element.style.width =
      Math.max(0, Math.min(100, percentage)) + "%";
  }
}

function renderBudget() {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  const spent = getTotalSpent();
  const remaining = budgetData.totalBudget - spent;
  const percentage = budgetData.totalBudget > 0
    ? spent / budgetData.totalBudget * 100
    : 0;

  setText("totalBudget", money(budgetData.totalBudget));
  setText("totalSpent", money(spent));
  setText("totalRemaining", money(remaining));
  setText("totalPercent", Math.round(percentage) + "%");
  setProgress("totalProgress", percentage);

  categoryList.innerHTML = "";

  budgetData.categories.forEach(category => {
    const percent = category.budget > 0
      ? category.spent / category.budget * 100
      : 0;

    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <div class="category-icon ${category.className}">
        <i data-lucide="${category.icon}"></i>
      </div>

      <div class="category-details">
        <strong>${category.name}</strong>
        <p>${money(category.spent)} / ${money(category.budget)}</p>

        <div class="progress">
          <div class="fill"
               style="width:${Math.min(percent, 100)}%;
                      background:${category.color}">
          </div>
        </div>
      </div>

      <span class="category-percent"
            style="color:${category.color}">
        ${Math.round(percent)}%
      </span>
    `;

    categoryList.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function setupSimulator() {
  const form = document.getElementById("simulatorForm");
  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("purchaseName")
      .value.trim();

    const amount = Number(
      document.getElementById("purchaseAmount").value
    );

    const category = document.getElementById(
      "purchaseCategory"
    ).value;

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid purchase and amount.");
      return;
    }

    const scenario = {
      name,
      amount,
      category
    };

    sessionStorage.setItem(
      "moneyMentorScenario",
      JSON.stringify(scenario)
    );

    window.location.href = "what-if-impact.html";
  });
}

function renderImpact() {
  if (!document.getElementById("impactName")) return;

  let scenario;

  try {
    scenario = JSON.parse(
      sessionStorage.getItem("moneyMentorScenario")
    );
  } catch (error) {
    scenario = null;
  }

  if (
    !scenario ||
    !scenario.name ||
    !Number.isFinite(scenario.amount) ||
    scenario.amount <= 0
  ) {
    window.location.replace("what-if-simulator.html");
    return;
  }

  const category = getCategory(scenario.category);

  if (!category) {
    window.location.replace("what-if-simulator.html");
    return;
  }

  const totalSpent = getTotalSpent();

  const before =
    budgetData.totalBudget - totalSpent;

  const after = before - scenario.amount;

  const purchasePercent = budgetData.totalBudget > 0
    ? scenario.amount / budgetData.totalBudget * 100
    : 0;

  const newCategorySpent =
    category.spent + scenario.amount;

  const categoryPercent = category.budget > 0
    ? newCategorySpent / category.budget * 100
    : 0;

  setText("impactName", scenario.name);
  setText("impactCategory", category.name);
  setText("impactPrice", money(scenario.amount));

  setText("beforeBudget", money(before));
  setText("purchaseCost", "-" + money(scenario.amount));
  setText("afterBudget", money(after));
  setText(
    "purchasePercent",
    Math.round(purchasePercent) + "%"
  );

  setText("categoryName", category.name);

  setText(
    "categoryNumbers",
    money(newCategorySpent) + " / " + money(category.budget)
  );

  setProgress("categoryProgress", categoryPercent);

  const afterElement = document.getElementById("afterBudget");
  if (after < 0) afterElement.classList.add("negative");

  const warning = document.getElementById("impactWarning");

  if (newCategorySpent > category.budget) {
    const overAmount = newCategorySpent - category.budget;

    warning.textContent =
      "This purchase would put your " +
      category.name +
      " category over budget by " +
      money(overAmount) + ".";
  } else {
    warning.textContent =
      "This purchase is within your " +
      category.name + " category budget.";
  }

  const savingsMessage = document.getElementById(
    "savingsMessage"
  );

  if (after < 0) {
    savingsMessage.textContent =
      "This purchase would exceed your remaining monthly " +
      "budget by " + money(Math.abs(after)) +
      ". You may need to reduce spending or use savings.";
  } else if (after < budgetData.totalBudget * 0.10) {
    savingsMessage.textContent =
      "This purchase would leave only " + money(after) +
      " in your monthly budget. It could make it harder " +
      "to contribute to your savings goals.";
  } else {
    savingsMessage.textContent =
      "You would have " + money(after) +
      " remaining in your monthly budget. " +
      "Your savings goals are not directly changed " +
      "by this simulation.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderBudget();
  setupSimulator();
  renderImpact();

  if (window.lucide) lucide.createIcons();
});
