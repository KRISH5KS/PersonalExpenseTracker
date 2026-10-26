# Personal Expense Tracker

A full-stack expense tracker built with **JavaScript, Express.js, and SQLite**. The frontend uses HTML, CSS, and vanilla JavaScript.

## Features

- Add, view, edit, and delete income/expense transactions (CRUD).
- Categorize transactions and optionally add notes.
- Filter the transaction list by month and transaction type.
- Monthly income, expense, and net-balance summary.
- Category-wise monthly expense totals using SQL `GROUP BY`.
- Server-side validation and parameterized SQL statements.
- Responsive layout for desktop and mobile.
- SQLite database file is created automatically at `expenses.db`.

## Requirements

- Node.js 18+ recommended
- npm

## Run locally

1. Extract this folder.
2. Open a terminal in the `PersonalExpenseTracker` directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open <http://localhost:3000> in your browser.

For automatic server restarts during development, use `npm run dev`.

## Project structure

```text
PersonalExpenseTracker/
├── database.js          # SQLite connection and schema
├── server.js            # Express app and REST API routes
├── package.json
├── expenses.db          # Generated automatically after first run
└── public/
    ├── index.html       # UI structure
    ├── styles.css       # Responsive styles
    └── app.js           # Browser logic and API calls
```

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/transactions` | List transactions; optional `month=YYYY-MM`, `type`, and `category` filters |
| GET | `/api/summary?month=YYYY-MM` | Monthly income, expenses, balance, category totals |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

### Example request body

```json
{
  "type": "expense",
  "title": "Groceries",
  "amount": 850,
  "category": "Food",
  "date": "2026-10-11",
  "notes": "Weekly shopping"
}
```

## Database design

The `transactions` table contains:

- `id`: integer primary key, auto-incremented.
- `type`: `income` or `expense`, checked by SQLite.
- `title`: short description.
- `amount`: positive numeric amount.
- `category`: category label.
- `date`: transaction date in `YYYY-MM-DD`.
- `notes`: optional note.
- `created_at`: timestamp automatically added by SQLite.

## Architecture

1. The browser collects transaction data from the form.
2. Frontend JavaScript sends an HTTP request using `fetch()`.
3. Express route validates the request body.
4. A parameterized SQL statement reads/writes the SQLite database.
5. Express sends JSON back to the browser.
6. The frontend refreshes transactions and monthly summaries.

## Notes and next improvements

This is a practical learning project, not a production financial service. For production use, add authentication/authorization, CSRF protection where applicable, rate limiting, automated tests, deployment configuration, backups, and stronger date validation. The app currently uses one local SQLite database and does not have multi-user accounts.
