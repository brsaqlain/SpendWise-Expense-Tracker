import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, useMonthStats, useCategorySpend } from '../store'
import { fmtINR, monthKey, toISO, monthName, CATEGORY_META, fmtDateShort } from '../utils'
import { TransactionRow } from '../components/TransactionRow'
import { Progress, EmptyState } from '../components/ui'
import { DailySpendChart, WeekBars } from '../components/charts'
import { IconPlus, IconChevronRight, IconTrendUp, IconEye, IconEyeOff } from '../icons'

const greet = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export const Dashboard: React.FC = () => {
  const { data, ready, addTx } = useStore()
  void addTx
  const nav = useNavigate()
  const mk = monthKey(toISO(new Date()))
  const stats = useMonthStats(mk)
  const catSpend = useCategorySpend(mk)
  const hide = data.settings.hideAmounts

  /* daily spend for chart */
  const daily = useMemo(() => {
    const now = new Date()
    const days: { day: number; amount: number }[] = []
    const daysSoFar = monthKey(toISO(now)) === mk ? now.getDate() : 30
    const arr = new Array(daysSoFar).fill(0)
    for (const t of data.transactions) {
      if (t.type === 'expense' && t.date.startsWith(mk)) {
        const d = Number(t.date.slice(8, 10))
        if (d <= daysSoFar) arr[d - 1] += t.amount
      }
    }
    arr.forEach((v, i) => days.push({ day: i + 1, amount: v }))
    return days
  }, [data.transactions, mk])

  /* weekly bars (last 4 weeks incl. today) */
  const weeks = useMemo(() => {
    const now = new Date()
    const labels = ['4 wks ago', '3 wks ago', '2 wks ago', 'This week']
    void labels
    const out: { label: string; value: number }[] = [0, 1, 2, 3].map(() => ({ label: '', value: 0 }))
    const today = toISO(now)
    for (const t of data.transactions) {
      if (t.type !== 'expense' || t.date < today.slice(0, 0) + today.slice(0, 8) + '00') continue
      if (t.date > today) continue
      const dt = new Date(t.date)
      const diff = Math.floor((now.getTime() - dt.getTime()) / 864e5)
      const w = 3 - Math.floor(diff / 7)
      if (w >= 0 && w <= 3) out[w].value += t.amount
    }
    out[0].label = 'W-4'
    out[1].label = 'W-3'
    out[2].label = 'W-2'
    out[3].label = 'W-1'
    return out
  }, [data.transactions])

  const topCat = useMemo(() => {
    let best: import('../types').CategoryId = 'others'
    let v = 0
    catSpend.forEach((val, k) => {
      if (val > v) {
        v = val
        best = k as import('../types').CategoryId
      }
    })
    return { best, v }
  }, [catSpend])

  const budget = useMemo(() => {
    const total = data.budgets.reduce((a, b) => a + b.limit, 0)
    const spent = data.budgets.reduce((a, b) => a + (catSpend.get(b.category) || 0), 0)
    const over = data.budgets.filter((b) => (catSpend.get(b.category) || 0) > b.limit).length
    const warn = data.budgets.filter((b) => {
      const s = catSpend.get(b.category) || 0
      return s <= b.limit && s >= b.limit * 0.8
    }).length
    return { total, spent, over, warn, pct: total ? (spent / total) * 100 : 0 }
  }, [data.budgets, catSpend])

  const recent = useMemo(
    () => [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [data.transactions],
  )

  if (!ready) {
    return (
      <div style={{ placeItems: 'center', minHeight: '60vh' }} className="empty">
        <span className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--primary-soft)' }} />
      </div>
    )
  }

  return (
    <div>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* header */}
        <div className="screen" style={{ paddingBottom: 8, marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar">A</div>
            <div className="grow">
              <div className="small muted">{greet()},</div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{data.settings.name.split(' ')[0]} 👋</div>
            </div>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--text-2)',
                boxShadow: 'var(--shadow-card)',
              }}
              onClick={() => (data.settings.hideAmounts ? {} : {})}
              title="Privacy"
              aria-label="Balance visibility"
            >
              {hide ? <IconEyeOff size={19} /> : <IconEye size={19} />}
            </button>
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          {/* main balance card */}
          <div
            className="card card-lg"
            style={{
              background: 'linear-gradient(150deg, #0a8f66 0%, #087f5b 55%, #05503a 100%)',
              color: '#fff',
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 190,
                height: 190,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.07)',
                top: -70,
                right: -50,
              }}
            />
            <div className="small" style={{ opacity: 0.85, fontWeight: 600 }}>
              Total balance this month · {monthName(mk)}
            </div>
            <div className="serif-num" style={{ fontSize: 34, fontWeight: 800, margin: '6px 0 14px' }}>
              {hide ? '₹ •••••' : fmtINR(stats.balance)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Income', v: stats.income, c: '#7dffc8' },
                { label: 'Expenses', v: stats.expense, c: '#ffb4ab' },
                { label: 'Remaining', v: stats.remaining, c: '#e6f4ff' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'rgba(255,255,255,.13)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>{s.label}</div>
                  <div className="serif-num" style={{ fontWeight: 700, fontSize: 14.5, marginTop: 2, color: s.c }}>
                    {hide ? '₹ •••' : fmtINR(s.v)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* budget indicator */}
          <Link to="/budgets" style={{ display: 'block', marginBottom: 16 }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="icon-badge" style={{ background: budget.over ? 'var(--danger-soft)' : 'var(--primary-soft)', fontSize: 22 }}>
                {budget.over ? '⚠️' : '🎯'}
              </div>
              <div className="grow">
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {budget.over
                    ? `${budget.over} budget${budget.over > 1 ? 's' : ''} exceeded`
                    : budget.warn
                      ? `${budget.warn} budget${budget.warn > 1 ? 's' : ''} close to limit`
                      : 'Budgets on track'}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 7 }}>
                  <div className="grow">
                    <Progress pct={budget.pct} over={budget.over > 0} />
                  </div>
                  <span className="small serif-num muted">
                    {hide ? '••' : fmtINR(budget.spent, { compact: true })}/{fmtINR(budget.total, { compact: true })}
                  </span>
                </div>
              </div>
              <IconChevronRight size={18} color="var(--text-3)" />
            </div>
          </Link>

          {/* savings goals shortcut */}
          <Link to="/savings" style={{ display: 'block', marginBottom: 16, color: 'inherit' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="icon-badge" style={{ background: 'var(--primary-soft)', fontSize: 22 }}>
                🏦
              </div>
              <div className="grow">
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  Savings goals
                  {data.goals.some((g) => g.saved >= g.target) && (
                    <span className="chip chip-green" style={{ marginLeft: 8, padding: '2px 9px', fontSize: 11 }}>
                      🏆 trophy unlocked
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 7 }}>
                  <div className="grow">
                    <Progress
                      pct={(() => {
                        const sv = data.goals.reduce((a, g) => a + g.saved, 0)
                        const tg = data.goals.reduce((a, g) => a + g.target, 0)
                        return tg ? (sv / tg) * 100 : 0
                      })()}
                    />
                  </div>
                  <span className="small serif-num muted">
                    {(() => {
                      const sv = data.goals.reduce((a, g) => a + g.saved, 0)
                      const tg = data.goals.reduce((a, g) => a + g.target, 0)
                      return hide ? '₹•••' : fmtINR(sv, { compact: true }) + '/' + fmtINR(tg, { compact: true })
                    })()}
                  </span>
                </div>
              </div>
              <IconChevronRight size={18} color="var(--text-3)" />
            </div>
          </Link>

          {/* spending chart */}
          <div className="card section">
            <div className="section-title">
              <h3 className="h3">Monthly spending overview</h3>
              <Link to="/analytics" className="link">
                Analytics
              </Link>
            </div>
            <DailySpendChart days={daily} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }} className="small muted">
              <span>Daily spend · {monthName(mk)}</span>
              <span className="serif-num" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                {hide ? '' : `${fmtINR(stats.expense, { compact: true })} spent`}
              </span>
            </div>
          </div>

          <div className="card section">
            <div className="section-title">
              <h3 className="h3">Weekly comparison</h3>
              <span className="chip chip-green">
                <IconTrendUp size={13} /> Trending down
              </span>
            </div>
            <WeekBars data={weeks} />
          </div>

          <div className="card section" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="icon-badge" style={{ background: CATEGORY_META[topCat.best]?.soft, fontSize: 22 }}>
              {CATEGORY_META[topCat.best]?.emoji}
            </div>
            <div className="grow">
              <div className="small muted">Highest spend category</div>
              <div style={{ fontWeight: 700 }}>
                {CATEGORY_META[topCat.best]?.label} ·{' '}
                <span className="serif-num" style={{ color: 'var(--danger)' }}>
                  {hide ? '₹•••' : fmtINR(topCat.v)}
                </span>
              </div>
            </div>
            <Link to="/analytics" className="link">
              Details
            </Link>
          </div>

          {/* recent transactions */}
          <div className="section">
            <div className="section-title">
              <h3 className="h3">Recent transactions</h3>
              <Link to="/transactions" className="link">
                See all
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                sub="Tap + to add your first expense"
              />
            ) : (
              <div className="list-card">
                {recent.map((t) => (
                  <TransactionRow key={t.id} tx={t} />
                ))}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', padding: '4px 0 10px' }} className="small muted">
            Data updated {fmtDateShort(toISO(new Date()))} · stored on this device
          </div>
        </div>
      </div>

      <button className="btn-fab" onClick={() => nav('/add')} aria-label="Add expense">
        <IconPlus size={26} color="#fff" />
      </button>
    </div>
  )
}
