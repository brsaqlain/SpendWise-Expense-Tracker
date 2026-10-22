import type { AppData, Budget, CategoryId, Goal, PaymentMethod, Transaction } from './types'
import { toISO, uid } from './utils'

/* ---- deterministic pseudo-random so the seed data is stable ---- */
let seedState = 42
const rnd = () => {
  seedState = (seedState * 1103515245 + 12345) % 2147483648
  return seedState / 2147483648
}
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]
const between = (a: number, b: number, step = 10) =>
  a + Math.round(rnd() * ((b - a) / step)) * step

interface Spec {
  cat: CategoryId
  titles: string[]
  min: number
  max: number
  pay: PaymentMethod[]
  freq: number // avg entries per month
}

const SPECS: Spec[] = [
  { cat: 'food', titles: ['Mess dinner', 'Cafe coffee', 'Aroma Bakery', 'Pizza Corner', 'Fruit vendor', 'Zomato order', 'Maggi & buns', 'Samosa break', 'Chai point', 'Hostel canteen'], min: 40, max: 650, pay: ['upi', 'cash', 'upi', 'debit'], freq: 9 },
  { cat: 'transport', titles: ['Metro card recharge', 'Auto to college', 'Rapido ride', 'Bus pass', 'Petrol top-up', 'Uber ride'], min: 30, max: 450, pay: ['upi', 'cash'], freq: 5 },
  { cat: 'shopping', titles: ['Amazon order', 'Nike sneakers', 'Myntra kurtas', 'Mobile cover', 'Kirana store', 'Decathlon tee', 'Stationery kit'], min: 150, max: 2400, pay: ['upi', 'debit', 'credit', 'cash'], freq: 3 },
  { cat: 'education', titles: ['Coursera subscription', 'Printout & xerox', 'Reference book', 'Python course fee', 'Notion templates? no', 'Exam form fee'], min: 100, max: 1800, pay: ['upi', 'debit'], freq: 2 },
  { cat: 'bills', titles: ['Electricity bill', 'Mobile recharge — Jio', 'Water bill', 'Broadband bill', 'PG rent share'], min: 200, max: 3200, pay: ['upi', 'debit'], freq: 3 },
  { cat: 'entertainment', titles: ['Netflix subscription', 'Movie ticket — PVR', 'Spotify Premium', 'Bowling with friends', 'Concert ticket'], min: 100, max: 900, pay: ['upi', 'credit'], freq: 3 },
  { cat: 'healthcare', titles: ['Pharmacy — Dolo', 'Doctor consultation', 'Gym fee', 'Health checkup', 'Protein powder'], min: 120, max: 2600, pay: ['upi', 'cash', 'debit'], freq: 1 },
  { cat: 'others', titles: ['Gift for Aisha', 'Temple donation', 'Courier charges', 'Barber cut', 'Laundry'], min: 60, max: 900, pay: ['cash', 'upi'], freq: 2 },
]

export function seedTransactions(): Transaction[] {
  seedState = 1337
  const txs: Transaction[] = []
  const now = new Date()

  const addMonth = (monthIdx: number) => {
    for (const spec of SPECS) {
      const count = Math.max(1, Math.round(spec.freq * (0.7 + rnd() * 0.6)))
      const usedDays = new Set<number>()
      for (let i = 0; i < count; i++) {
        const maxDay = monthIdx === 2 ? now.getDate() : 28
        let day = 1 + Math.floor(rnd() * maxDay)
        while (usedDays.has(day)) day = day === maxDay ? 1 : day + 1
        if (usedDays.size >= maxDay) break
        usedDays.add(day)
        const date = toISO(new Date(now.getFullYear(), now.getMonth() + monthIdx - 2, day))
        txs.push({
          id: uid() + i,
          type: 'expense',
          category: spec.cat,
          title: pick(spec.titles).replace('? no', ''),
          amount: between(spec.min, spec.max),
          date,
          payment: pick(spec.pay),
          notes: '',
        })
      }
    }
    // income
    const incomes: [CategoryId, string, number, number][] = [
      ['salary', 'Monthly internship stipend', 18000, 0],
      ['freelance', 'Website project — client', between(3000, 8000, 500), 12],
      ['interest', 'Savings account interest', 412, 27],
    ]
    for (const [cat, title, amt, day] of incomes) {
      const d = Math.min(day || 5, monthIdx === 2 ? now.getDate() : 28)
      txs.push({
        id: uid(),
        type: 'income',
        category: cat,
        title,
        amount: amt,
        date: toISO(new Date(now.getFullYear(), now.getMonth() + monthIdx - 2, Math.max(1, d))),
        payment: 'upi',
        notes: '',
      })
    }
  }

  addMonth(0) // two months ago
  addMonth(1) // last month
  addMonth(2) // current month

  return txs
}

const BUDGETS: Budget[] = [
  { id: 'b1', category: 'food', limit: 4500 },
  { id: 'b2', category: 'transport', limit: 2000 },
  { id: 'b3', category: 'shopping', limit: 3000 },
  { id: 'b4', category: 'entertainment', limit: 1500 },
  { id: 'b5', category: 'education', limit: 2000 },
]

const GOALS: Goal[] = [
  { id: 'g1', name: 'New MacBook Air', target: 95000, saved: 34200, targetDate: toISO(new Date(Date.now() + 300 * 864e5)), emoji: '💻' },
  { id: 'g2', name: 'Emergency Fund', target: 60000, saved: 22800, targetDate: toISO(new Date(Date.now() + 540 * 864e5)), emoji: '🛡️' },
  { id: 'g3', name: 'Manali Trip (Dec)', target: 18000, saved: 18000, targetDate: toISO(new Date(Date.now() + 70 * 864e5)), emoji: '🏔️' },
]

export const seedData = (): AppData => ({
  transactions: seedTransactions().sort((a, b) => b.date.localeCompare(a.date)),
  budgets: BUDGETS,
  goals: GOALS,
  settings: {
    name: 'Arjun Sharma',
    email: 'arjun.sharma@gmail.com',
    monthlyIncome: 21000,
    theme: 'light',
    notifications: true,
    weeklyReport: true,
    hideAmounts: false,
  },
})
