import type { CategoryId, PaymentMethod, TXType } from './types'

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const fmtINR = (n: number, opts: { compact?: boolean; sign?: boolean } = {}) => {
  const { compact = false, sign = false } = opts
  const abs = Math.abs(n)
  let body: string
  if (compact && abs >= 100000) {
    body = '₹' + (abs / 100000).toFixed(abs >= 1000000 ? 1 : 2) + 'L'
  } else if (compact && abs >= 1000) {
    body = '₹' + (abs / 1000).toFixed(abs >= 10000 ? 1 : 2) + 'K'
  } else {
    body = '₹' + abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })
  }
  if (sign) return (n < 0 ? '-' : n > 0 ? '+' : '') + body
  return (n < 0 ? '-₹' : '₹') + body.replace('₹', '')
}

export const toISO = (d: Date) => {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const monthKey = (iso: string) => iso.slice(0, 7)

export const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1)

export const daysInMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

export const fmtDate = (iso: string) =>
  parseISO(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export const fmtDateShort = (iso: string) =>
  parseISO(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export const fmtDayBadge = (iso: string) => {
  const d = parseISO(iso)
  return {
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    num: String(d.getDate()),
  }
}

export const relativeDate = (iso: string) => {
  const today = toISO(new Date())
  if (iso === today) return 'Today'
  const y = new Date()
  y.setDate(y.getDate() - 1)
  if (iso === toISO(y)) return 'Yesterday'
  return fmtDateShort(iso)
}

export const monthName = (key: string, long = false) =>
  parseISO(key + '-01').toLocaleDateString('en-IN', {
    month: long ? 'long' : 'short',
    year: 'numeric',
  })

export const CATEGORY_META: Record<
  CategoryId,
  { label: string; color: string; soft: string; emoji: string }
> = {
  food: { label: 'Food', color: '#e8590c', soft: '#ffe8d9', emoji: '🍛' },
  transport: { label: 'Transport', color: '#1971c2', soft: '#d0ebff', emoji: '🚌' },
  shopping: { label: 'Shopping', color: '#9c36b5', soft: '#f3d9fa', emoji: '🛍️' },
  education: { label: 'Education', color: '#087f5b', soft: '#d3f9e8', emoji: '📚' },
  bills: { label: 'Bills', color: '#e03131', soft: '#ffe8e6', emoji: '🧾' },
  entertainment: { label: 'Entertainment', color: '#f08c00', soft: '#fff3d6', emoji: '🎬' },
  healthcare: { label: 'Healthcare', color: '#0c8599', soft: '#c5f6fa', emoji: '💊' },
  others: { label: 'Others', color: '#5c6b84', soft: '#e4eaf2', emoji: '📦' },
  salary: { label: 'Salary', color: '#0b8a4c', soft: '#d3f9e8', emoji: '💼' },
  freelance: { label: 'Freelance', color: '#087f5b', soft: '#eafcf5', emoji: '💻' },
  interest: { label: 'Interest', color: '#74b816', soft: '#e9fac8', emoji: '🏦' },
}

export const EXPENSE_CATEGORIES: CategoryId[] = [
  'food',
  'transport',
  'shopping',
  'education',
  'bills',
  'entertainment',
  'healthcare',
  'others',
]

export const INCOME_CATEGORIES: CategoryId[] = ['salary', 'freelance', 'interest']

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  debit: 'Debit Card',
  credit: 'Credit Card',
}

export const txColor = (t: TXType) => (t === 'income' ? 'var(--success)' : 'var(--danger)')
