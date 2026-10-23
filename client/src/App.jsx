
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'https://spendwise-api-kspm.onrender.com/api/transactions'

const emptyForm = {
  type: 'expense',
  amount: '',
  category: 'Food',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

function App() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Could not load transactions.')
        }

        setTransactions(await response.json())
      } catch {
        setError(
          'Could not connect to the backend. Make sure the server is running on port 5000.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    return { income, expenses, savings: income - expenses }
  }, [transactions])

  const visibleTransactions = transactions.filter(
    (item) => filter === 'all' || item.type === filter
  )

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function startEditing(transaction) {
    setEditingId(transaction.id)
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      category: transaction.category,
      description: transaction.description || '',
      date: transaction.date,
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditing() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    })
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const amount = Number(form.amount)

    if (!form.amount.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }

    if (!form.category || !form.date) {
      setError('Please complete the required fields.')
      return
    }

    const description = form.description.trim() || form.category

    setSubmitting(true)

    try {
      const isEditing = editingId !== null
      const url = isEditing ? `${API_URL}/${editingId}` : API_URL

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not save transaction.')
      }

      if (isEditing) {
        setTransactions((current) =>
          current.map((item) => item.id === editingId ? data : item)
        )
      } else {
        setTransactions((current) => [data, ...current])
      }

      setEditingId(null)
      setForm({
        ...emptyForm,
        date: new Date().toISOString().slice(0, 10),
      })
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (editingId === id) {
      cancelEditing()
    }

    setError('')
    setDeletingId(id)

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not delete transaction.')
      }

      setTransactions((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.message || 'Could not delete transaction.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark">₹</span>
          <span>SpendWise</span>
        </a>
        <span className="topbar-label">PERSONAL FINANCE</span>
      </header>

      <section className="page-content" id="dashboard">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR MONEY, CLEARLY</p>
            <h1>Expense Tracker</h1>
            <p className="subtitle">
              Track your income, understand your spending, and stay in control.
            </p>
          </div>

          <span className="date-chip">
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <section className="summary-grid" aria-label="Financial summary">
          <article className="summary-card income-card">
            <span className="summary-icon">↙</span>
            <p>Total income</p>
            <h2>{currency.format(totals.income)}</h2>
            <span className="summary-note">Money received</span>
          </article>

          <article className="summary-card expense-card">
            <span className="summary-icon">↗</span>
            <p>Total expenses</p>
            <h2>{currency.format(totals.expenses)}</h2>
            <span className="summary-note">Money spent</span>
          </article>

          <article className="summary-card savings-card">
            <span className="summary-icon">◎</span>
            <p>Net savings</p>
            <h2>{currency.format(totals.savings)}</h2>
            <span className="summary-note">Income minus expenses</span>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel form-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">
                  {editingId !== null ? 'EDIT ENTRY' : 'NEW ENTRY'}
                </p>
                <h2>
                  {editingId !== null ? 'Edit transaction' : 'Add transaction'}
                </h2>
              </div>
              <span className="heading-icon">
                {editingId !== null ? '✎' : '＋'}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="field-label">Transaction type</label>

              <div className="type-switch">
                <button
                  type="button"
                  className={
                    form.type === 'expense'
                      ? 'type-option active expense-active'
                      : 'type-option'
                  }
                  onClick={() => updateForm('type', 'expense')}
                >
                  Expense
                </button>

                <button
                  type="button"
                  className={
                    form.type === 'income'
                      ? 'type-option active income-active'
                      : 'type-option'
                  }
                  onClick={() => updateForm('type', 'income')}
                >
                  Income
                </button>
              </div>

              <label className="field-label" htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 500"
                value={form.amount}
                onChange={(event) => updateForm('amount', event.target.value)}
                required
              />

              <label className="field-label" htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
                required
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Education</option>
                <option>Health</option>
                <option>Salary</option>
                <option>Freelance</option>
                <option>Other</option>
              </select>

              <label className="field-label" htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                placeholder="What was it for?"
                maxLength={120}
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
              />

              <label className="field-label" htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => updateForm('date', event.target.value)}
                required
              />

              {error && <p className="form-error" role="alert">{error}</p>}

              <button
                className="submit-button"
                type="submit"
                disabled={submitting || loading}
              >
                {submitting
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save changes'
                    : `Add ${form.type === 'income' ? 'income' : 'expense'}`}
                {!submitting && <span>→</span>}
              </button>

              {editingId !== null && (
                <button
                  className="filter-button"
                  type="button"
                  onClick={cancelEditing}
                  disabled={submitting}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Cancel editing
                </button>
              )}
            </form>
          </section>

          <section className="panel history-panel">
            <div className="panel-heading history-heading">
              <div>
                <p className="eyebrow">YOUR ACTIVITY</p>
                <h2>Transactions</h2>
              </div>
              <span className="transaction-count">
                {visibleTransactions.length}{' '}
                {visibleTransactions.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <div className="filter-row" aria-label="Transaction filters">
              {[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expenses' },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={filter === option.value ? 'filter-button selected' : 'filter-button'}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="transaction-list">
              {loading ? (
                <p>Loading transactions...</p>
              ) : visibleTransactions.length === 0 ? (
                <div className="empty-state">
                  <span>○</span>
                  <h3>No transactions yet</h3>
                  <p>Add an income or expense to see it here.</p>
                </div>
              ) : (
                visibleTransactions.map((transaction) => (
                  <article className="transaction-row" key={transaction.id}>
                    <div className={`transaction-icon ${transaction.type}`}>
                      {transaction.type === 'income' ? '↓' : '↑'}
                    </div>

                    <div className="transaction-details">
                      <h3>{transaction.description || transaction.category}</h3>
                      <div className="transaction-meta">
                        <span className={`category-badge ${transaction.category.toLowerCase()}`}>
                          {transaction.category}
                        </span>
                        <time dateTime={transaction.date}>
                          {new Date(`${transaction.date}T00:00:00`).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>

                    <div className="transaction-end">
                      <strong className={transaction.type}>
                        {transaction.type === 'income' ? '+' : '−'}
                        {currency.format(Number(transaction.amount))}
                      </strong>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          className="filter-button"
                          type="button"
                          disabled={submitting || deletingId === transaction.id}
                          onClick={() => startEditing(transaction)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          type="button"
                          aria-label={`Delete ${transaction.description || transaction.category}`}
                          disabled={deletingId === transaction.id || submitting}
                          onClick={() => handleDelete(transaction.id)}
                        >
                          {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <footer className="page-footer">
          <span>SpendWise · Expense Tracker</span>
          <span>Built to make every rupee count.</span>
        </footer>
      </section>
    </main>
  )
}

export default App
