// =============================================
// MONEY MENTOR DASHBOARD — JAVASCRIPT
// =============================================

// 1. Shared dialog for features not yet available
const dialog = document.getElementById("messageDialog");
const dialogText = document.getElementById("dialogText");
const closeDialog = document.getElementById("closeDialog");

function showMessage(message) {
  dialogText.textContent = message;
  dialog.showModal();
}

closeDialog.addEventListener("click", () => dialog.close());

// 2. Show or hide available balance
const balance = document.getElementById("balance");
const toggleBalance = document.getElementById("toggleBalance");
const originalBalance = balance.textContent;
let balanceVisible = true;

toggleBalance.addEventListener("click", () => {
  balanceVisible = !balanceVisible;
  balance.textContent = balanceVisible ? originalBalance : "••••••••";
});

// 3. Student Survival Mode navigates through its HTML link.
//    No click handler is needed here.

// 4. Pandora AI placeholder
const adjustButton = document.getElementById("adjust");
adjustButton.addEventListener("click", () => {
  showMessage("Budget adjustment coming soon.");
});

// 5. Bottom navigation placeholders
//    Pages with real <a href> links navigate automatically.
document.querySelectorAll(".bottom-nav button").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;
    if (page && page !== "Home") {
      showMessage(`${page} page coming soon.`);
    }
  });
});

// 6. Render Lucide icons after HTML is parsed.
if (window.lucide) {
  window.lucide.createIcons();
}
