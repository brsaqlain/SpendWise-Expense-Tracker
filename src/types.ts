export type TXType = 'income' | 'expense'

export type CategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'education'
  | 'bills'
  | 'entertainment'
  | 'healthcare'
  | 'others'
  | 'salary'
  | 'freelance'
  | 'interest'

export type PaymentMethod = 'cash' | 'upi' | 'debit' | 'credit'

export interface Transaction {
  id: string
  type: TXType
  category: CategoryId
  amount: number
  title: string
  date: string // YYYY-MM-DD
  payment: PaymentMethod
  notes?: string
}

export interface Budget {
  id: string
  category: CategoryId
  limit: number
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  targetDate: string // YYYY-MM-DD
  emoji: string
}

export interface Settings {
  name: string
  email: string
  monthlyIncome: number
  theme: 'light' | 'dark'
  notifications: boolean
  weeklyReport: boolean
  hideAmounts: boolean
}

export interface AppData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  settings: Settings
}
