
const dialog = document.getElementById("messageDialog");
const dialogText = document.getElementById("dialogText");

function showMessage(message) {
  dialogText.textContent = message;
  dialog.showModal();
}

document.getElementById("closeDialog")
  .addEventListener("click", () => dialog.close());

// Show or hide balance
const balance = document.getElementById("balance");
let balanceVisible = true;

document.getElementById("toggleBalance")
  .addEventListener("click", () => {
    balanceVisible = !balanceVisible;

    balance.textContent = balanceVisible
      ? "$4,250.80"
      : "••••••••";
  });

// Student Survival Mode
document.getElementById("survival")
  .addEventListener("click", () => {
    showMessage("Student Survival Mode coming soon.");
  });

// Upcoming Bills
document.getElementById("seeAll")
  .addEventListener("click", () => {
    showMessage("Upcoming Bills page coming soon.");
  });

// Pandora AI
document.getElementById("adjust")
  .addEventListener("click", () => {
    showMessage("Budget adjustment coming soon.");
  });

// Bottom navigation
document.querySelectorAll(".bottom-nav button")
  .forEach(button => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;

      if (page !== "Home") {
        showMessage(`${page} page coming soon.`);
      }
    });
  });

// Convert Lucide icon placeholders into SVG icons
lucide.createIcons();

