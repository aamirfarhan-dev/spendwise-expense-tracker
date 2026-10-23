
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test endpoints
app.get("/", (req, res) => {
  res.send("Expense Tracker API is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working correctly",
  });
});

// Get all transactions
app.get("/api/transactions", (req, res) => {
  const transactions = db
    .prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC")
    .all();

  res.json(transactions);
});

// Add a transaction
app.post("/api/transactions", (req, res) => {
  const { type, amount, category, description, date } = req.body;

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: "Invalid transaction type" });
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (typeof category !== "string" || !category.trim()) {
    return res.status(400).json({ error: "Category is required" });
  }

  if (typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
  ) {
    return res.status(400).json({ error: "A valid date is required" });
  }

  const result = db
    .prepare(
      `INSERT INTO transactions (type, amount, category, description, date)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(type, amount, category.trim(), description.trim(), date);

  const transaction = db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(transaction);
});


/* Update an existing transaction */
app.put("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);
  const { type, amount, category, description, date } = req.body;

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: "Invalid transaction type" });
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return res.status(400).json({
      error: "Amount must be a positive number",
    });
  }

  if (typeof category !== "string" || !category.trim()) {
    return res.status(400).json({ error: "Category is required" });
  }

  if (typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
  ) {
    return res.status(400).json({ error: "A valid date is required" });
  }

  const result = db
    .prepare(`
      UPDATE transactions
      SET type = ?, amount = ?, category = ?, description = ?, date = ?
      WHERE id = ?
    `)
    .run(type, amount, category.trim(), description.trim(), date, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const updatedTransaction = db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(id);

  res.json(updatedTransaction);
});

// Delete a transaction
app.delete("/api/transactions/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  const result = db
    .prepare("DELETE FROM transactions WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  res.json({ success: true, message: "Transaction deleted" });
});

// Dashboard totals
app.get("/api/transactions/summary", (req, res) => {
  const summary = db
    .prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)
          AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
          AS totalExpenses
      FROM transactions
    `)
    .get();

  res.json({
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
    netSavings: summary.totalIncome - summary.totalExpenses,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
