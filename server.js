const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function validateTransaction(body) {
  const { type, title, amount, category, date } = body;
  if (!["income", "expense"].includes(type)) return "Type must be income or expense.";
  if (typeof title !== "string" || !title.trim()) return "Title is required.";
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return "Amount must be greater than zero.";
  if (typeof category !== "string" || !category.trim()) return "Category is required.";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return "A valid date is required (YYYY-MM-DD).";
  return null;
}

app.get("/api/transactions", (req, res) => {
  const { month, type, category } = req.query;
  let sql = "SELECT * FROM transactions WHERE 1=1";
  const params = [];
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    sql += " AND substr(date, 1, 7) = ?";
    params.push(month);
  }
  if (type && ["income", "expense"].includes(type)) {
    sql += " AND type = ?";
    params.push(type);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  sql += " ORDER BY date DESC, id DESC";
  res.json(db.prepare(sql).all(...params));
});

app.get("/api/summary", (req, res) => {
  const month = req.query.month;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "Provide month as YYYY-MM." });
  }
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
    FROM transactions WHERE substr(date, 1, 7) = ?
  `).get(month);
  const categories = db.prepare(`
    SELECT category, SUM(amount) AS total
    FROM transactions
    WHERE substr(date, 1, 7) = ? AND type = 'expense'
    GROUP BY category ORDER BY total DESC
  `).all(month);
  res.json({ ...totals, balance: totals.income - totals.expenses, categories });
});

app.post("/api/transactions", (req, res) => {
  const error = validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const { type, title, amount, category, date, notes = "" } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO transactions (type, title, amount, category, date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(type, title.trim(), Number(amount), category.trim(), date, String(notes).trim());
    res.status(201).json(db.prepare("SELECT * FROM transactions WHERE id = ?").get(result.lastInsertRowid));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save transaction." });
  }
});

app.put("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid transaction ID." });
  const error = validateTransaction(req.body);
  if (error) return res.status(400).json({ error });
  const { type, title, amount, category, date, notes = "" } = req.body;
  const result = db.prepare(`
    UPDATE transactions
    SET type = ?, title = ?, amount = ?, category = ?, date = ?, notes = ?
    WHERE id = ?
  `).run(type, title.trim(), Number(amount), category.trim(), date, String(notes).trim(), id);
  if (!result.changes) return res.status(404).json({ error: "Transaction not found." });
  res.json(db.prepare("SELECT * FROM transactions WHERE id = ?").get(id));
});

app.delete("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid transaction ID." });
  const result = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  if (!result.changes) return res.status(404).json({ error: "Transaction not found." });
  res.status(204).end();
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Expense Tracker running at http://localhost:${PORT}`));