const $ = (id) => document.getElementById(id);
const form = $("transactionForm");
const monthFilter = $("monthFilter");
const typeFilter = $("typeFilter");
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
monthFilter.value = localDate.slice(0, 7);
$("date").value = localDate;

const currency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0));
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function showMessage(message, success = false) {
  $("formMessage").textContent = message;
  $("formMessage").className = `message${success ? " success" : ""}`;
}

function resetForm() {
  form.reset();
  $("transactionId").value = "";
  $("date").value = localDate;
  $("type").value = "expense";
  $("formTitle").textContent = "Add transaction";
  $("saveButton").textContent = "Save transaction";
  $("cancelEdit").classList.add("hidden");
}

async function loadDashboard() {
  const month = monthFilter.value || localDate.slice(0, 7);
  const type = typeFilter.value;
  const params = new URLSearchParams({ month });
  if (type) params.set("type", type);
  try {
    const [summary, transactions] = await Promise.all([
      api(`/api/summary?month=${encodeURIComponent(month)}`),
      api(`/api/transactions?${params.toString()}`)
    ]);
    $("incomeTotal").textContent = currency(summary.income);
    $("expenseTotal").textContent = currency(summary.expenses);
    $("balanceTotal").textContent = currency(summary.balance);
    $("categorySummary").innerHTML = summary.categories.length
      ? summary.categories.map(item => `<span class="category-chip">${escapeHtml(item.category)} <strong>${currency(item.total)}</strong></span>`).join("")
      : "";
    renderTransactions(transactions);
  } catch (error) {
    $("transactionList").innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function renderTransactions(transactions) {
  const list = $("transactionList");
  if (!transactions.length) {
    list.innerHTML = '<p class="empty-state">No transactions for this month yet. Add one using the form.</p>';
    return;
  }
  list.innerHTML = transactions.map(item => {
    const isIncome = item.type === "income";
    const icon = isIncome ? "↙" : "↗";
    return `<article class="transaction-item">
      <div class="transaction-main">
        <div class="transaction-icon" aria-hidden="true">${icon}</div>
        <div>
          <div class="transaction-title">${escapeHtml(item.title)}</div>
          <div class="transaction-meta">${escapeHtml(item.category)} · ${escapeHtml(item.date)}${item.notes ? `<br>${escapeHtml(item.notes)}` : ""}</div>
          <div class="item-actions">
            <button class="text-button" data-edit="${item.id}">Edit</button>
            <button class="text-button" data-delete="${item.id}">Delete</button>
          </div>
        </div>
      </div>
      <div class="transaction-amount ${isIncome ? "amount-income" : "amount-expense"}">${isIncome ? "+" : "−"}${currency(item.amount)}</div>
    </article>`;
  }).join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("transactionId").value;
  const payload = {
    type: $("type").value,
    title: $("title").value.trim(),
    amount: Number($("amount").value),
    category: $("category").value,
    date: $("date").value,
    notes: $("notes").value.trim()
  };
  $("saveButton").disabled = true;
  try {
    await api(id ? `/api/transactions/${id}` : "/api/transactions", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    resetForm();
    showMessage(id ? "Transaction updated successfully." : "Transaction added successfully.", true);
    await loadDashboard();
  } catch (error) {
    showMessage(error.message);
  } finally {
    $("saveButton").disabled = false;
  }
});

$("transactionList").addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    try {
      const transactions = await api(`/api/transactions?month=${encodeURIComponent(monthFilter.value || localDate.slice(0, 7))}`);
      const item = transactions.find(t => t.id === Number(editButton.dataset.edit));
      if (!item) throw new Error("Transaction not found in this month.");
      $("transactionId").value = item.id;
      $("type").value = item.type;
      $("title").value = item.title;
      $("amount").value = item.amount;
      $("category").value = item.category;
      // If an existing category is not in the preset list, add it before selecting.
      if (![...$("category").options].some(option => option.value === item.category)) {
        $("category").add(new Option(item.category, item.category));
      }
      $("date").value = item.date;
      $("notes").value = item.notes || "";
      $("formTitle").textContent = "Edit transaction";
      $("saveButton").textContent = "Update transaction";
      $("cancelEdit").classList.remove("hidden");
      showMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { showMessage(error.message); }
  }
  if (deleteButton) {
    if (!window.confirm("Delete this transaction permanently?")) return;
    try {
      await api(`/api/transactions/${deleteButton.dataset.delete}`, { method: "DELETE" });
      showMessage("Transaction deleted.", true);
      await loadDashboard();
    } catch (error) { showMessage(error.message); }
  }
});

$("cancelEdit").addEventListener("click", () => { resetForm(); showMessage(""); });
monthFilter.addEventListener("change", loadDashboard);
typeFilter.addEventListener("change", loadDashboard);
loadDashboard();