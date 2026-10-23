# SpendWise — Expense Tracker

SpendWise is a responsive full-stack expense tracker built with React, Express, and SQLite.

## Features

- Add income and expenses
- Dashboard totals for income, expenses, and net savings
- Transaction history with category labels
- Edit and delete transactions
- Filter by all transactions, income, or expenses
- Frontend and backend validation
- Persistent SQLite storage
- Responsive desktop and mobile layout

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** SQLite with better-sqlite3

## Run Locally

Prerequisites: Node.js and npm.

### Start the backend

Open a terminal in the project root:

```bash
cd server
npm install
npm run dev
```

Backend: `http://localhost:5000`

### Start the frontend

Open a second terminal in the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

Keep both terminals running.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API status |
| GET | `/api/health` | Health check |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/summary` | Get summary totals |

## Database Model

The `transactions` table contains:

- `id` — unique identifier
- `type` — income or expense
- `amount` — transaction amount
- `category` — transaction category
- `description` — transaction description
- `date` — transaction date
- `created_at` — creation timestamp

## Project Structure

```text
Expense Tracker/
├── client/       # React frontend
├── server/       # Express API and SQLite setup
├── .gitignore
└── README.md
```

## Security

The root `.gitignore` excludes local database files, dependencies, and environment secrets. Never commit credentials or private financial data.

## Status

Core transaction management, editing, deletion, filtering, dashboard totals, and local database persistence have been tested. Deployment and final CodeNova submission checks remain.
