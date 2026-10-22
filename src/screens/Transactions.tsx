import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Screen, EmptyState, Modal } from '../components/ui'
import { TransactionRow } from '../components/TransactionRow'
import { CATEGORY_META, EXPENSE_CATEGORIES, fmtINR, monthName, parseISO, relativeDate, toISO } from '../utils'
import type { CategoryId } from '../types'
import { IconSearch, IconFilter, IconList, IconClose } from '../icons'

type Tab = 'all' | 'income' | 'expense'

export const Transactions: React.FC = () => {
  const { data } = useStore()
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')
  const [month, setMonth] = useState<string>('all')
  const [cat, setCat] = useState<CategoryId | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)

  const months = useMemo(() => {
    const set = new Set(data.transactions.map((t) => t.date.slice(0, 7)))
    return [...set].sort().reverse().slice(0, 6)
  }, [data.transactions])

  const filtered = useMemo(() => {
    let list = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date))
    if (tab !== 'all') list = list.filter((t) => t.type === tab)
    if (month !== 'all') list = list.filter((t) => t.date.startsWith(month))
    if (cat !== 'all') list = list.filter((t) => t.category === cat)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      list = list.filter(
        (t) => t.title.toLowerCase().includes(needle) || (t.notes || '').toLowerCase().includes(needle) || CATEGORY_META[t.category].label.toLowerCase().includes(needle),
      )
    }
    return list
  }, [data.transactions, tab, month, cat, q])

  const totals = useMemo(() => {
    let inc = 0
    let exp = 0
    for (const t of filtered) t.type === 'income' ? (inc += t.amount) : (exp += t.amount)
    return { inc, exp }
  }, [filtered])

  /* group by date */
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, [])
      map.get(t.date)!.push(t)
    }
    return [...map.entries()]
  }, [filtered])

  const applyCat = (c: CategoryId | 'all') => {
    setCat(c)
    setActiveFilters((c !== 'all' ? 1 : 0) + (month !== 'all' ? 1 : 0))
    setFilterOpen(false)
  }
  const applyMonth = (m: string) => {
    setMonth(m)
    setFilterOpen(false)
  }

  return (
    <Screen title="Transactions" pad>
      {/* tabs */}
      <div className="seg" style={{ marginBottom: 14 }}>
        {(
          [
            ['all', 'All'],
            ['income', 'Income'],
            ['expense', 'Expenses'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* search + filter */}
      <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <IconSearch size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            className="input"
            style={{ paddingLeft: 40, paddingTop: 11, paddingBottom: 11 }}
            placeholder="Search name or description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search transactions"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
              aria-label="Clear search"
            >
              <IconClose size={16} />
            </button>
          )}
        </div>
        <button
          className="back-btn"
          style={{ width: 44, height: 44 }}
          onClick={() => setFilterOpen(true)}
          aria-label="Filters"
        >
          <IconFilter size={19} />
          {activeFilters > 0 && (
            <span
              style={{
                position: 'absolute',
                transform: 'translate(14px, -12px)',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 99,
                padding: '1px 6px',
              }}
            >
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* quick month chips */}
      <div className="chip-row" style={{ margin: '0 0 14px -20px', width: 'calc(100% + 40px)' }}>
        <button className={`chip ${month === 'all' ? 'on' : ''}`} onClick={() => setMonth('all')}>
          All months
        </button>
        {months.map((m) => (
          <button
            key={m}
            className={`chip ${month === m ? 'on' : ''}`}
            onClick={() => {
              setMonth(month === m ? 'all' : m)
              setActiveFilters((cat !== 'all' ? 1 : 0) + (month === m ? 0 : 1))
            }}
          >
            {monthName(m)}
          </button>
        ))}
      </div>

      {/* summary strip */}
      {filtered.length > 0 && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 18px', marginBottom: 16 }}>
          <span className="small muted">
            <b style={{ color: 'var(--text)' }}>{filtered.length}</b> transaction{filtered.length > 1 ? 's' : ''}
          </span>
          <span className="small" style={{ fontWeight: 700 }}>
            <span style={{ color: 'var(--success)' }}>+{fmtINR(totals.inc, { compact: true })}</span>
            <span style={{ color: 'var(--text-3)', margin: '0 6px' }}>|</span>
            <span style={{ color: 'var(--danger)' }}>−{fmtINR(totals.exp, { compact: true })}</span>
          </span>
        </div>
      )}

      {/* list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconList size={44} />}
          title="No transactions found"
          sub={q || activeFilters ? 'Try a different search or clear filters.' : 'Add your first transaction with the + button.'}
        />
      ) : (
        groups.map(([date, txs]) => (
          <div key={date} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px' }}>
              <span className="small" style={{ fontWeight: 700, color: 'var(--text-2)' }}>
                {relativeDate(date) === 'Today' || relativeDate(date) === 'Yesterday' ? relativeDate(date) : parseISO(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="list-card">
              {txs.map((t) => (
                <TransactionRow key={t.id} tx={t} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* filter modal */}
      <Modal open={filterOpen} onClose={() => setFilterOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="h2">Filters</h2>
          <button onClick={() => setFilterOpen(false)} aria-label="Close">
            <IconClose size={20} color="var(--text-3)" />
          </button>
        </div>
        <div className="field-label">Month</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          <button className={`chip ${month === 'all' ? 'on' : ''}`} style={{ padding: '8px 14px' }} onClick={() => applyMonth('all')}>
            All
          </button>
          {months.map((m) => (
            <button key={m} className={`chip ${month === m ? 'on' : ''}`} style={{ padding: '8px 14px' }} onClick={() => applyMonth(m)}>
              {monthName(m)}
            </button>
          ))}
        </div>
        <div className="field-label">Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <button className={`chip ${cat === 'all' ? 'on' : ''}`} style={{ padding: '8px 14px' }} onClick={() => applyCat('all')}>
            All
          </button>
          {EXPENSE_CATEGORIES.map((c) => (
            <button key={c} className={`chip ${cat === c ? 'on' : ''}`} style={{ padding: '8px 14px' }} onClick={() => applyCat(c)}>
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
            </button>
          ))}
        </div>
        <button
          className="btn btn-ghost btn-block btn-sm"
          style={{ marginTop: 16 }}
          onClick={() => {
            setCat('all')
            setMonth('all')
            setActiveFilters(0)
            setFilterOpen(false)
          }}
        >
          Clear all filters
        </button>
      </Modal>
    </Screen>
  )
}

void toISO
