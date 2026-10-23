# SpendWise — Expense Tracker

SpendWise is a responsive full-stack expense tracker built with React, Express, and SQLite. It helps users record income and expenses, review their financial summary, and manage transactions.

## Features

- Add income and expense transactions
- View total income, total expenses, and net savings
- View transaction history with category labels
- Edit and delete transactions
- Filter transactions by all, income, or expenses
- Validate transaction data on the frontend and backend
- Persist data in a local SQLite database
- Responsive layout for desktop and mobile screens

## Tech Stack

**Frontend:** React, Vite, CSS  
**Backend:** Node.js, Express  
**Database:** SQLite with better-sqlite3

## Prerequisites

- Node.js and npm
- Git (optional, for version control)

## Run Locally

### 1. Start the backend

Open a terminal in the project root:

```bash
cd server
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### 2. Start the frontend

Open a second terminal in the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Keep both terminals running while using the app.

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API status message |
| GET | `/api/health` | Health check |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/summary` | Retrieve summary totals |

### Transaction Data Model

The SQLite `transactions` table contains:

- `id` — unique transaction identifier
- `type` — income or expense
- `amount` — transaction amount
- `category` — transaction category
- `description` — transaction description
- `date` — transaction date
- `created_at` — record creation timestamp

## Database and Privacy

The application stores transactions in a local SQLite database. The database file is excluded from Git so personal transaction data is not published with the source code.

Do not commit `.env` files, credentials, or private financial data.

## Project Structure

```text
Expense Tracker/
├── client/       # React frontend
├── server/       # Express API and SQLite database setup
├── .gitignore
└── README.md
```

## Project Status

Core transaction management, editing, deletion, filtering, dashboard totals, and database persistence have been implemented and tested locally. Deployment and final submission checks may still be required.
