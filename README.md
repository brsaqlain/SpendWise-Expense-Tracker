# SpendWise 💚

A modern, mobile-first personal expense tracker built as a UI/UX design project (React + TypeScript + Vite). Every button works — data is persisted to `localStorage` under `spendwise.v1`.

## Run it

```bash
npm install
npm run dev      # opens on http://localhost:5173
npm run build    # production typecheck + bundle (dist/)
```

For screenshots / viva: use Chrome DevTools device toolbar (iPhone 12/13/14 — 390×844).

## Screens

1. **Splash** — branded green gradient, wallet logo, auto-transitions to onboarding or dashboard
2. **Onboarding** — 3-slide carousel with Get Started / Login
3. **Dashboard** — greeting, total balance, income/expense/remaining, daily spend area chart, weekly comparison, budget status, recent transactions, FAB → Add
4. **Add Transaction** — Income/Expense toggle, big amount pad with quick-add chips, 8 expense + 3 income categories, date, payment method (Cash/UPI/Debit/Credit), notes, validation + confirmation dialog
5. **Transactions** — search, month/category filter modal, All/Income/Expenses tabs, date-grouped rows, empty state
6. **Transaction Details** — full receipt card + edit (reuses Add form) + delete with confirmation
7. **Budgets** — total allocation card, exceeded/near-limit warnings, per-category progress bars (normal/warning/over), create/edit/delete budget
8. **Analytics** — month selector, expense donut, income-vs-expense bars, weekly trend, auto-generated insights
9. **Savings Goals** — goal cards with progress, add money, achieved trophy state, create/delete goals
10. **Profile & Settings** — avatar, monthly income editor, **dark mode**, privacy masking, INR currency, notification toggles, local-only privacy note, data reset, logout

Design system: emerald `#087F5B` / mint `#D3F9E8` / bg `#F7F9FC` / navy `#172B4D`, Inter font, tabular numerals for money, 8px rhythm, ≥44px touch targets, dark theme via CSS variables.

## Verify the journey

```bash
npx vite preview --port 4173   # in one terminal
node scripts/smoke.mjs         # drives Chrome headlessly through splash → onboarding
                               # → dashboard → add expense → edit → search → budgets
                               # → analytics → savings → settings → dark mode
```

The smoke script uses `puppeteer-core` with an installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` (change `CHROME` at the top for other systems).

## Notes

- Seed data: ~150 realistic INR transactions across 3 months (internship stipend, mess dinners, UPI autos, Jio recharges…) so every chart, filter and budget state is populated. Two budgets intentionally exceed limits to demonstrate warnings; one goal is achieved.
- **Reset app data** in Profile → Privacy & data restores the sample dataset.
