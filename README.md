Personal Expense Tracker

A full-stack expense tracker built with JavaScript, Express.js and SQLite. The frontend uses HTML, CSS and plain JavaScript.

Features

Add, view, edit and delete income and expense transactions.

Categorize transactions. Add notes if needed.

Filter the list of transactions by month and by type of transaction.

Income, expense and net balance summary.

Totals for expenses by category using SQL GROUP BY.

Validation on the server side and safe SQL statements.

Design that works well on both desktop and mobile devices.

An SQLite database file is made automatically. Saved as expenses.db.

Requirements

Node.js 18 or higher is recommended.

Npm is needed.

Run it locally.

Extract this folder.

Open a terminal in the PersonalExpenseTracker folder.

Install the needed packages:

npm install

Start the server:

npm start

Go to http://localhost:3000 in your browser.

To have the server restart automatically while working, use npm run dev.

Project structure

PersonalExpenseTracker/

├── database.js          # Connection to SQLite and table setup

├── server.js            # Express app and API routes

├── package.json

├── expenses.db          # Created after the first run

└── public/

├── index.html       # Layout of the user interface

├── styles.css       # Styles for different screen sizes

└── app.js           # Code that runs in the browser and talks to the API

API reference

Method	Endpoint	Purpose

GET	/api/transactions	List all transactions; can add filters for month, type and category

GET	/api/summary?month=YYYY-MM	Get income, expenses, balance and category totals

POST	/api/transactions	Create a new transaction

PUT	/api/transactions/:id	Update an existing transaction

DELETE	/api/transactions/:id	Remove a transaction

Example of a request body

{

"type": "expense"

"title": "Groceries"

"amount": 850

"category": "Food"

"date": "2026-10-11"

"notes": " shopping"

}

Database design

The transactions table includes:

id: unique number that increases automatically.

Type: can be income or expense checked by SQLite.

a description of the transaction.

Amount: a number.

Category: a label for the type of expense.

Date: the date of the transaction in YYYY-MM-DD format.

Notes: a message.

Created_at: the time when the transaction was added, automatically set by SQLite.

Architecture

The browser gets data from a form.

JavaScript on the frontend sends a request using fetch().

An Express route checks the data that was sent.

A safe SQL statement. Writes to the SQLite database.

Express sends back data in JSON format.

The frontend updates the list of transactions and the monthly summaries.

Future improvements

This is a project made to learn and practice not for financial use. For financial services add things like user login, protection against fake requests limits on how many times something can be done, tests, ways to deploy, backups and better checks for dates. This app uses a local SQLite database and does not have support, for multiple users.
