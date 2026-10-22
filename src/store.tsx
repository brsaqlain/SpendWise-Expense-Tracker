import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  AppData,
  Budget,
  Goal,
  Settings,
  Transaction,
} from './types'
import { seedData } from './data'

const KEY = 'spendwise.v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed.transactions && parsed.settings) return parsed
    }
  } catch {
    /* corrupted store -> reseed */
  }
  return seedData()
}

interface Store {
  data: AppData
  ready: boolean
  addTx: (t: Omit<Transaction, 'id'>) => void
  updateTx: (id: string, t: Omit<Transaction, 'id'>) => void
  deleteTx: (id: string) => void
  setBudget: (category: Budget['category'], limit: number, id?: string) => void
  deleteBudget: (id: string) => void
  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, saved: number) => void
  deleteGoal: (id: string) => void
  updateSettings: (s: Partial<Settings>) => void
  resetAll: () => void
}

const Ctx = createContext<Store | null>(null)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => load())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* storage full — ignore */
    }
  }, [data])

  useEffect(() => {
    if (!ready) {
      const t = setTimeout(() => setReady(true), 1400)
      return () => clearTimeout(t)
    }
  }, [ready])

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
  }, [data.settings.theme])

  const addTx: Store['addTx'] = useCallback((t) => {
    setData((d) => ({ ...d, transactions: [{ ...t, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }, ...d.transactions] }))
  }, [])

  const updateTx: Store['updateTx'] = useCallback((id, t) => {
    setData((d) => ({
      ...d,
      transactions: d.transactions.map((x) => (x.id === id ? { ...t, id } : x)),
    }))
  }, [])

  const deleteTx: Store['deleteTx'] = useCallback((id) => {
    setData((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) }))
  }, [])

  const setBudget: Store['setBudget'] = useCallback((category, limit, id) => {
    setData((d) => {
      const existing = d.budgets.find((b) => b.category === category && b.id !== id)
      const budgets = existing
        ? d.budgets.map((b) => (b.id === existing.id ? { ...b, limit } : b))
        : id && d.budgets.some((b) => b.id === id)
          ? d.budgets.map((b) => (b.id === id ? { ...b, category, limit } : b))
          : [...d.budgets, { id: 'b' + Date.now().toString(36), category, limit }]
      return { ...d, budgets }
    })
  }, [])

  const deleteBudget: Store['deleteBudget'] = useCallback((id) => {
    setData((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) }))
  }, [])

  const addGoal: Store['addGoal'] = useCallback((g) => {
    setData((d) => ({ ...d, goals: [...d.goals, { ...g, id: 'g' + Date.now().toString(36) }] }))
  }, [])

  const updateGoal: Store['updateGoal'] = useCallback((id, saved) => {
    setData((d) => ({
      ...d,
      goals: d.goals.map((g) => (g.id === id ? { ...g, saved: Math.min(saved, g.target) } : g)),
    }))
  }, [])

  const deleteGoal: Store['deleteGoal'] = useCallback((id) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }))
  }, [])

  const updateSettings: Store['updateSettings'] = useCallback((s) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...s } }))
  }, [])

  const resetAll = useCallback(() => {
    localStorage.removeItem(KEY)
    setData(seedData())
  }, [])

  const value = useMemo(
    () => ({
      data,
      ready,
      addTx,
      updateTx,
      deleteTx,
      setBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      updateSettings,
      resetAll,
    }),
    [data, ready, addTx, updateTx, deleteTx, setBudget, deleteBudget, addGoal, updateGoal, deleteGoal, updateSettings, resetAll],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}

/* ---------- derived selectors ---------- */

export const useMonthStats = (monthKey: string) => {
  const { data } = useStore()
  return useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of data.transactions) {
      if (t.date.startsWith(monthKey)) {
        if (t.type === 'income') income += t.amount
        else expense += t.amount
      }
    }
    const extra = data.goals.reduce((a, g) => a + 0, 0)
    void extra
    const opening = (() => {
      let bal = 0
      for (const t of data.transactions) if (t.date < monthKey + '-01') bal += t.type === 'income' ? t.amount : -t.amount
      return bal
    })()
    return { income, expense, remaining: income - expense, balance: opening + income - expense }
  }, [data, monthKey])
}

export const useCategorySpend = (monthKey: string) => {
  const { data } = useStore()
  return useMemo(() => {
    const map = new Map<string, number>()
    for (const t of data.transactions) {
      if (t.type === 'expense' && t.date.startsWith(monthKey)) {
        map.set(t.category, (map.get(t.category) || 0) + t.amount)
      }
    }
    return map
  }, [data, monthKey])
}
