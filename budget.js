
/* MONEY MENTOR - BUDGET AND WHAT-IF SIMULATOR */

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

/* MONEY FORMATTING */

function money(value) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

/* TOTAL SPENDING */

function getTotalSpent() {
  return budgetData.categories.reduce(
    (total, category) => total + category.spent,
    0
  );
}

/* CATEGORY LOOKUP */

function getCategory(name) {
  return budgetData.categories.find(
    category => category.name === name
  );
}

/* UPDATE TEXT */

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

/* UPDATE PROGRESS BAR */

function setProgress(id, percent) {
  const element = document.getElementById(id);

  if (element) {
    element.style.width =
      Math.max(0, Math.min(100, percent)) + "%";
  }
}

/* BUDGET PAGE */

function renderBudget() {
  const categoryList = document.getElementById("categoryList");

  if (!categoryList) return;

  const spent = getTotalSpent();
  const remaining = budgetData.totalBudget - spent;

  const percentage =
    budgetData.totalBudget > 0
      ? spent / budgetData.totalBudget * 100
      : 0;

  setText("totalBudget", money(budgetData.totalBudget));
  setText("totalSpent", money(spent));
  setText("totalRemaining", money(remaining));
  setText("totalPercent", Math.round(percentage) + "%");

  setProgress("totalProgress", percentage);

  categoryList.innerHTML = "";

  budgetData.categories.forEach(category => {
    const percent =
      category.budget > 0
        ? category.spent / category.budget * 100
        : 0;

    const card = document.createElement("div");
    card.className = "category-card";

    const icon = document.createElement("div");
    icon.className = "category-icon " + category.className;

    const iconElement = document.createElement("i");
    iconElement.setAttribute("data-lucide", category.icon);
    icon.appendChild(iconElement);

    const details = document.createElement("div");
    details.className = "category-details";

    const name = document.createElement("strong");
    name.textContent = category.name;

    const amounts = document.createElement("p");
    amounts.textContent =
      money(category.spent) + " / " + money(category.budget);

    const progress = document.createElement("div");
    progress.className = "progress";

    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.width = Math.min(percent, 100) + "%";
    fill.style.backgroundColor = category.color;

    progress.appendChild(fill);
    details.append(name, amounts, progress);

    const percentageText = document.createElement("span");
    percentageText.className = "category-percent";
    percentageText.textContent = Math.round(percent) + "%";
    percentageText.style.color = category.color;

    card.append(icon, details, percentageText);
    categoryList.appendChild(card);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* WHAT-IF SIMULATOR */

function setupSimulator() {
  const form = document.getElementById("simulatorForm");

  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document
      .getElementById("purchaseName")
      .value.trim();

    const amount = Number(
      document.getElementById("purchaseAmount").value
    );

    const category = document
      .getElementById("purchaseCategory")
      .value;

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid purchase name and amount.");
      return;
    }

    const purchase = {
      name: name,
      amount: amount,
      category: category
    };

    sessionStorage.setItem(
      "moneyMentorScenario",
      JSON.stringify(purchase)
    );

    window.location.href = "what_if_impact.html";
  });
}

/* WHAT-IF IMPACT PAGE */

function renderImpact() {
  const impactName = document.getElementById("impactName");

  if (!impactName) return;

  let purchase;

  try {
    purchase = JSON.parse(
      sessionStorage.getItem("moneyMentorScenario")
    );
  } catch (error) {
    purchase = null;
  }

  if (
    !purchase ||
    typeof purchase.name !== "string" ||
    !Number.isFinite(purchase.amount) ||
    purchase.amount <= 0
  ) {
    window.location.replace("what_if_simulator.html");
    return;
  }

  const category = getCategory(purchase.category);

  if (!category) {
    window.location.replace("what_if_simulator.html");
    return;
  }

  const totalSpent = getTotalSpent();

  const remainingBefore =
    budgetData.totalBudget - totalSpent;

  const remainingAfter =
    remainingBefore - purchase.amount;

  const purchasePercent =
    budgetData.totalBudget > 0
      ? purchase.amount / budgetData.totalBudget * 100
      : 0;

  const categorySpentAfter =
    category.spent + purchase.amount;

  const categoryPercent =
    category.budget > 0
      ? categorySpentAfter / category.budget * 100
      : 0;

  /* PURCHASE DETAILS */

  setText("impactName", purchase.name);
  setText("impactCategory", category.name);
  setText("impactPrice", money(purchase.amount));

  /* BUDGET IMPACT */

  setText("beforeBudget", money(remainingBefore));
  setText("purchaseCost", "-" + money(purchase.amount));
  setText("afterBudget", money(remainingAfter));

  setText(
    "purchasePercent",
    Math.round(purchasePercent) + "%"
  );

  if (remainingAfter < 0) {
    document.getElementById("afterBudget")
      .classList.add("negative");
  }

  /* CATEGORY IMPACT */

  setText("categoryName", category.name);

  setText(
    "categoryNumbers",
    money(categorySpentAfter) + " / " + money(category.budget)
  );

  setProgress("categoryProgress", categoryPercent);

  /* CATEGORY WARNING */

  const warning = document.getElementById("impactWarning");

  if (categorySpentAfter > category.budget) {
    const overBudget =
      categorySpentAfter - category.budget;

    warning.textContent =
      "This purchase would put your " +
      category.name +
      " category over budget by " +
      money(overBudget) + ".";
  } else {
    warning.textContent =
      "This purchase is within your " +
      category.name + " category budget.";
  }

  /* SAVINGS GOAL IMPACT */

  const savingsMessage =
    document.getElementById("savingsMessage");

  if (remainingAfter < 0) {
    savingsMessage.textContent =
      "This purchase would exceed your remaining " +
      "monthly budget by " +
      money(Math.abs(remainingAfter)) +
      ". You may need to reduce spending or use savings.";
  } else if (remainingAfter < budgetData.totalBudget * 0.10) {
    savingsMessage.textContent =
      "This purchase would leave only " +
      money(remainingAfter) +
      " in your monthly budget. " +
      "It could make it harder to reach your savings goals.";
  } else {
    savingsMessage.textContent =
      "You would still have " +
      money(remainingAfter) +
      " remaining in your monthly budget. " +
      "This simulation does not change your savings.";
  }
}

/* INITIALIZE ALL PAGES */

document.addEventListener("DOMContentLoaded", function() {
  renderBudget();
  setupSimulator();
  renderImpact();

  if (window.lucide) {
    lucide.createIcons();
  }
});
