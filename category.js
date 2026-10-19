
/* CATEGORY DATA */

const categorySettings = {
  Food: {
    icon: "utensils",
    spent: 340,
    budget: 400
  },
  Shopping: {
    icon: "shopping-bag",
    spent: 200,
    budget: 300
  },
  Transport: {
    icon: "car",
    spent: 150,
    budget: 200
  },
  Bills: {
    icon: "receipt",
    spent: 180,
    budget: 300
  },
  Entertainment: {
    icon: "gamepad-2",
    spent: 80,
    budget: 150
  },
  Other: {
    icon: "wallet",
    spent: 30,
    budget: 150
  }
};

/* GET CATEGORY FROM URL */

const params = new URLSearchParams(window.location.search);

const requestedCategory = params.get("name") || "Food";

const categoryName = Object.prototype.hasOwnProperty.call(
  categorySettings,
  requestedCategory
) ? requestedCategory : "Food";

const category = categorySettings[categoryName];

/* LOAD SAVED BUDGET */

const savedBudget = localStorage.getItem(
  "budget_" + categoryName
);

if (savedBudget !== null) {
  const amount = Number(savedBudget);

  if (Number.isFinite(amount) && amount > 0) {
    category.budget = amount;
  }
}

/* FORMAT MONEY */

function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

/* DISPLAY CATEGORY */

function renderCategory() {
  const percent =
    (category.spent / category.budget) * 100;

  document.getElementById("categoryName").textContent =
    categoryName;

  document.getElementById("categoryPercent").textContent =
    Math.round(percent) + "%";

  document.getElementById("categoryAmount").textContent =
    formatMoney(category.spent) +
    " of " +
    formatMoney(category.budget);

  document.getElementById("categoryProgress").style.width =
    Math.min(percent, 100) + "%";

  const iconContainer =
    document.getElementById("categoryIcon");

  iconContainer.className =
    "category-icon " + categoryName.toLowerCase();

  iconContainer.innerHTML =
    '<i data-lucide="' + category.icon + '"></i>';

  document.getElementById("budgetAmount").value =
    category.budget.toFixed(2);

  lucide.createIcons();
}

/* SAVE NEW BUDGET */

document.getElementById("budgetForm").addEventListener(
  "submit",
  function(event) {
    event.preventDefault();

    const newBudget = Number(
      document.getElementById("budgetAmount").value
    );

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
      document.getElementById("saveMessage").textContent =
        "Please enter a valid budget.";
      return;
    }

    category.budget = newBudget;

    localStorage.setItem(
      "budget_" + categoryName,
      newBudget.toString()
    );

    renderCategory();

    document.getElementById("saveMessage").textContent =
      "Budget updated successfully!";
  }
);

/* INITIAL DISPLAY */

renderCategory();
