# ExpCome Flow — Frontend

A React (Vite) frontend for the Expense & Income Tracker API. Light theme
with a vibrant indigo/emerald/coral palette, fully rounded UI (buttons, cards,
inputs), monospace tabular figures for money, and group expenses rendered as
torn-edge receipt cards.

## Stack
- React 18 + React Router 6
- Vite
- Tailwind CSS (custom `ledger` design tokens in `tailwind.config.js` — the
  key namespace is unchanged from earlier versions, only the color values
  and border radii were updated)
- Axios (with automatic JWT refresh)
- Recharts (category breakdown chart)

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

The app expects the Spring Boot backend running at `http://localhost:8080/api`
by default (see `.env.example`). Update `VITE_API_BASE_URL` if it's hosted
elsewhere.

## Structure

```
src/
  api/            axios client + one module per backend resource
  context/        AuthContext (session, login/register/logout)
  components/      shared UI: AppShell, Modal, Money, ReceiptCard,
                    SplitterForm, BalanceLedger, form primitives
  pages/          LoginPage, RegisterPage, DashboardPage, TransactionsPage,
                    GroupsPage, GroupDetailPage, NotFoundPage
  App.jsx         routes + auth guards
  main.jsx        entry point
```

## Notable pieces

- **Transactions page** — separate "+ Income" and "+ Expense" buttons open a
  modal already locked to that type (no in-form toggle to get wrong), showing
  only that type's categories.
- **`SplitterForm`** — the core splitter UI. Supports `EQUAL` (checkbox
  participants), `PERCENTAGE` (per-member % inputs, validated to sum to 100),
  and `EXACT` (per-member $ inputs, validated to sum to the total) — mirrors
  the backend's three split strategies exactly.
- **`BalanceLedger`** — renders net balances and the server's simplified
  "who owes whom" suggested transfers, with a one-click "mark settled" that
  pre-fills the settlement form.
- **`ReceiptCard`** — the signature visual element: each group expense looks
  like a torn receipt, with a perforated bottom edge and a paid/unpaid dot
  per participant.
- **`AddMemberSearch`** — debounced (300ms) search-as-you-type against
  `GET /api/users/search`, so members are added by name/email instead of a
  raw numeric ID.
- **JWT handling** — access + refresh tokens are stored in `localStorage`;
  a response interceptor in `src/api/client.js` automatically refreshes an
  expired access token once and retries the original request.

## Build for production

```bash
npm run build
```
Outputs static files to `dist/` — serve with any static host (Netlify,
Vercel, nginx, etc.), pointing `VITE_API_BASE_URL` at your deployed API.
