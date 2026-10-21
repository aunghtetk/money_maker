
/* MONEY MENTOR - BUDGET AND WHAT-IF SIMULATOR */

/* SAMPLE BUDGET DATA */

let budgetData = {
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
const savedBudget = localStorage.getItem("moneyMentorBudget");

if (savedBudget) {
  try {
    const parsedBudget = JSON.parse(savedBudget);

    if (parsedBudget && Array.isArray(parsedBudget.categories)) {
      budgetData = parsedBudget;
    }
  } catch (error) {
    console.error("Could not load saved budget:", error);
  }
}

/* FORMAT MONEY */

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

/* FIND CATEGORY */

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

/* RENDER BUDGET PAGE */

function renderBudget() {
  const categoryList = document.getElementById("categoryList");

  if (!categoryList) return;

  const spent = getTotalSpent();
  const remaining = budgetData.totalBudget - spent;

  const percentage =
    budgetData.totalBudget > 0
      ? (spent / budgetData.totalBudget) * 100
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
        ? (category.spent / category.budget) * 100
        : 0;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "category-card";

    card.addEventListener("click", function() {
      window.location.href =
        "category.html?name=" + encodeURIComponent(category.name);
});


    const icon = document.createElement("div");
    icon.className =
      "category-icon " + category.className;

    const iconElement = document.createElement("i");
    iconElement.setAttribute("data-lucide", category.icon);
    icon.appendChild(iconElement);

    const details = document.createElement("div");
    details.className = "category-details";

    const name = document.createElement("strong");
    name.textContent = category.name;

    const amounts = document.createElement("p");
    amounts.textContent =
      money(category.spent) +
      " / " +
      money(category.budget);

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
    percentageText.textContent =
      Math.round(percent) + "%";
    percentageText.style.color = category.color;

    card.append(icon, details, percentageText);
    categoryList.appendChild(card);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* WHAT-IF SIMULATOR FORM */

function setupSimulator() {
  const form = document.getElementById("simulatorForm");

  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const nameInput =
      document.getElementById("purchaseName");

    const amountInput =
      document.getElementById("purchaseAmount");

    const categoryInput =
      document.getElementById("purchaseCategory");

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid purchase name and amount.");
      return;
    }

    const purchase = {
      name: name,
      amount: amount,
      category: category
    };

    try {
      sessionStorage.setItem(
        "moneyMentorScenario",
        JSON.stringify(purchase)
      );
    } catch (error) {
      alert(
        "Unable to save your scenario. " +
        "Please open the project using Live Server."
      );
      console.error(error);
      return;
    }

    window.location.href = "what_if_impact.html";
  });
}

/* WHAT-IF IMPACT PAGE */

function renderImpact() {
  const impactName = document.getElementById("impactName");

  if (!impactName) return;

  let purchase = null;

  try {
    const savedScenario =
      sessionStorage.getItem("moneyMentorScenario");

    if (savedScenario) {
      purchase = JSON.parse(savedScenario);
    }
  } catch (error) {
    console.error("Unable to read scenario:", error);
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

  const totalSpent = getTotalSpent();

  const remainingBefore =
    budgetData.totalBudget - totalSpent;

  const remainingAfter =
    remainingBefore - purchase.amount;

  const purchasePercent =
    budgetData.totalBudget > 0
      ? (purchase.amount / budgetData.totalBudget) * 100
      : 0;

  /* PURCHASE DETAILS */

  setText("impactName", purchase.name);
  setText("impactCategory", purchase.category);
  setText("impactPrice", money(purchase.amount));

  /* BUDGET IMPACT */

  setText("beforeBudget", money(remainingBefore));
  setText("purchaseCost", "-" + money(purchase.amount));
  setText("afterBudget", money(remainingAfter));

  setText(
    "purchasePercent",
    Math.round(purchasePercent) + "%"
  );

  const afterBudgetElement =
    document.getElementById("afterBudget");

  if (remainingAfter < 0 && afterBudgetElement) {
    afterBudgetElement.classList.add("negative");
  }

  /* CATEGORY IMPACT */

  const categorySpentBefore =
    category ? category.spent : 0;

  const categoryBudget =
    category ? category.budget : 0;

  const categorySpentAfter =
    categorySpentBefore + purchase.amount;

  const categoryPercent =
    categoryBudget > 0
      ? (categorySpentAfter / categoryBudget) * 100
      : 0;

  setText("categoryName", purchase.category);
  updateCategoryIcon(purchase.category);

  setText(
    "categoryNumbers",
    money(categorySpentAfter) +
    " / " +
    money(categoryBudget)
  );

  setProgress("categoryProgress", categoryPercent);

  /* CATEGORY WARNING */

  const warning =
    document.getElementById("impactWarning");

  if (warning) {
    if (!category) {
      warning.textContent =
        "There is no separate budget set for this category.";
    } else if (categorySpentAfter > categoryBudget) {
      const overBudget =
        categorySpentAfter - categoryBudget;

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
  }

  /* SAVINGS GOAL IMPACT */

  const savingsMessage =
    document.getElementById("savingsMessage");

  if (!savingsMessage) return;

  if (remainingAfter < 0) {
    savingsMessage.textContent =
      "This purchase would exceed your remaining " +
      "monthly budget by " +
      money(Math.abs(remainingAfter)) +
      ". You may need to reduce spending or use savings.";
  } else if (
    remainingAfter < budgetData.totalBudget * 0.10
  ) {
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

/* INITIALIZE */

document.addEventListener("DOMContentLoaded", function() {
  renderBudget();
  setupSimulator();
  renderImpact();

  if (window.lucide) {
    lucide.createIcons();
  }
});

function updateCategoryIcon(categoryName) {
  const icon = document.getElementById("categoryImpactIcon");

  if (!icon) return;

  const categoryIcons = {
    Food: "utensils",
    Shopping: "shopping-bag",
    Transport: "car-front",
    Bills: "receipt",
    Entertainment: "gamepad-2",
    Other: "package"
  };

  const categoryColors = {
    Food: "#ff526a",
    Shopping: "#ae35e8",
    Transport: "#00a971",
    Bills: "#ff831f",
    Entertainment: "#2678f9",
    Other: "#8492a6"
  };

  const iconName = categoryIcons[categoryName] || "package";
  const iconColor = categoryColors[categoryName] || "#8492a6";

  icon.setAttribute("data-lucide", iconName);
  icon.style.color = iconColor;

  if (window.lucide) {
    lucide.createIcons();
  }

  // Lucide replaces the <i> element with an <svg>.
  // Apply the color to the rendered SVG.
  const renderedIcon =
    document.getElementById("categoryImpactIcon");

  if (renderedIcon) {
    renderedIcon.style.color = iconColor;
  }
}
