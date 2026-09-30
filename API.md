# ExpenseFlow Backend API

Base URL: `http://localhost:5000`  
All successful responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "message": "..." }`.

## Health

- **GET** `/api/health` — Checks that the API is running.
- Example: `{ "success": true, "message": "ExpenseFlow API is running" }`

## Expenses

| Method and URL | Purpose |
| --- | --- |
| **POST** `/api/expenses` | Create an expense. |
| **GET** `/api/expenses` | List expenses, optionally filtered and sorted. |
| **GET** `/api/expenses/:id` | Get one expense. |
| **PUT** `/api/expenses/:id` | Update supplied expense fields. |
| **DELETE** `/api/expenses/:id` | Delete one expense. |

Create example body (category must already exist):

```json
{
  "title": "Lunch",
  "amount": 450,
  "category": "Food",
  "date": "2026-09-27",
  "paymentMethod": "UPI",
  "description": "Lunch with colleagues"
}
```

Update accepts any subset of those fields. Amount must be greater than zero; payment method must be `UPI`, `Cash`, `Debit Card`, `Credit Card`, or `Net Banking`.

Supported list query parameters:

- `search` — case-insensitive match against title, category, or description.
- `category` — exact category filter.
- `month` — calendar month in `YYYY-MM` format, based on expense date.
- `sort` — `newest` (date descending, default), `oldest` (date ascending), `highest` (amount descending), or `lowest` (amount ascending).

Example: `/api/expenses?category=Food&month=2026-09&sort=newest`

List example: `{ "success": true, "count": 1, "data": [{ "_id": "...", "title": "Lunch", "amount": 450, "category": "Food", "date": "2026-09-27T00:00:00.000Z", "paymentMethod": "UPI" }] }`

## Categories

| Method and URL | Purpose |
| --- | --- |
| **POST** `/api/categories` | Create a category. Body: `{ "name": "Food" }`. |
| **GET** `/api/categories` | List categories. |
| **GET** `/api/categories/:id` | Get one category. |
| **PUT** `/api/categories/:id` | Rename a category. Body: `{ "name": "Dining" }`. |
| **DELETE** `/api/categories/:id` | Delete an unused category. |

Names are trimmed and compared case-insensitively. Duplicate names return `409`. A category used by expenses cannot be deleted (`409`). Expenses cannot use a category that does not exist (`400`).

## Dashboard

- **GET** `/api/dashboard/summary` — Returns totals, current UTC calendar-month and day amounts, transaction count, two-decimal average, five most recent expenses, category totals, and monthly totals. All date calculations use the expense `date` field (UTC date-only values), not `createdAt`.
- Example shape:

```json
{
  "success": true,
  "data": {
    "totalExpenses": 6968,
    "currentMonthExpenses": 6968,
    "todayExpenses": 450,
    "transactionCount": 6,
    "averageExpense": 1161.33,
    "recentExpenses": [],
    "categorySummary": [{ "category": "Food", "amount": 450, "count": 1 }],
    "monthlySummary": [{ "month": "2026-09", "amount": 6968, "count": 6 }]
  }
}
```

## Reports

- **GET** `/api/reports/summary` — Returns monthly, category, and payment-method totals, the five highest expenses, total expense, and transaction count. Dates use the expense `date` field.
- Example shape:

```json
{
  "success": true,
  "data": {
    "monthlySummary": [{ "month": "2026-09", "amount": 6968, "count": 6 }],
    "categorySummary": [{ "category": "Food", "amount": 450, "count": 1 }],
    "paymentMethodSummary": [{ "paymentMethod": "UPI", "amount": 450, "count": 1 }],
    "highestExpenses": [],
    "totalExpense": 6968,
    "transactionCount": 6
  }
}
```

## Common errors

- `400` — Invalid fields, date, month, sort option, ID, or a category that does not exist.
- `404` — Requested expense, category, or route does not exist.
- `409` — Duplicate category or attempt to delete a category that is in use.
- `500` — Generic server error; internal stack traces and database details are not returned.
