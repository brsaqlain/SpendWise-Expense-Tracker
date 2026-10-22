import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Screen, EmptyState } from '../components/ui'
import { DonutChart, BarPairsChart, Legend } from '../components/charts'
import { CATEGORY_META, EXPENSE_CATEGORIES, fmtINR, monthKey, monthName, toISO, daysInMonth } from '../utils'
import type { CategoryId } from '../types'
import { IconTrendUp, IconSparkle } from '../icons'

export const Analytics: React.FC = () => {
  const { data } = useStore()
  const now = new Date()

  const months = useMemo(() => {
    const out: string[] = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      out.push(monthKey(toISO(d)))
    }
    return out
  }, []) // eslint-disable-line

  const [mk, setMk] = useState(months[0])

  const stats = useMemo(() => {
    let income = 0
    let expense = 0
    const byCat = new Map<CategoryId, number>()
    const daily = new Map<number, number>()
    for (const t of data.transactions) {
      if (!t.date.startsWith(mk)) continue
      if (t.type === 'income') income += t.amount
      else {
        expense += t.amount
        byCat.set(t.category, (byCat.get(t.category) || 0) + t.amount)
        daily.set(Number(t.date.slice(8, 10)), (daily.get(Number(t.date.slice(8, 10))) || 0) + t.amount)
      }
    }
    const week = new Map<number, number>()
    for (const [d, v] of daily) {
      const w = Math.min(3, Math.floor((d - 1) / 7) + 1)
      week.set(w, (week.get(w) || 0) + v)
    }
    const weeks = [1, 2, 3, 4].map((w) => ({ label: 'Wk ' + w, value: week.get(w) || 0 }))
    return { income, expense, byCat, daily, weeks }
  }, [data.transactions, mk])

  /* income vs expense for 3 months */
  const barData = useMemo(() => {
    return months.map((m) => {
      let income = 0
      let expense = 0
      for (const t of data.transactions) {
        if (!t.date.startsWith(m)) continue
        t.type === 'income' ? (income += t.amount) : (expense += t.amount)
      }
      return {
        label: monthName(m).replace(' 20', ' ’'),
        income,
        expense,
      }
    })
  }, [data.transactions, months])

  const slices = useMemo(
    () =>
      EXPENSE_CATEGORIES.map((c) => ({
        label: CATEGORY_META[c].label,
        value: stats.byCat.get(c) || 0,
        color: CATEGORY_META[c].color,
      })).filter((s) => s.value > 0),
    [stats.byCat],
  )

  const top = slices.reduce((a, s) => (s.value > (a?.value ?? -1) ? s : a), slices[0])
  void top

  const insights = useMemo(() => {
    const list: { icon: string; text: string }[] = []
    const total = stats.expense
    if (total > 0) {
      const sorted = [...slices].sort((a, b) => b.value - a.value)
      const first = sorted[0]
      if (first)
        list.push({ icon: '🥇', text: `${first.label} is your top category this month — ${fmtINR(first.value)} (${Math.round((first.value / total) * 100)}% of spending).` })
      const prevMk = months[months.indexOf(mk) + 1]
      if (prevMk) {
        let prev = 0
        for (const t of data.transactions) if (t.type === 'expense' && t.date.startsWith(prevMk)) prev += t.amount
        const diff = total - prev
        if (prev > 0)
          list.push({
            icon: diff > 0 ? '📈' : '📉',
            text:
              diff > 0
                ? `You spent ${fmtINR(diff)} more than in ${monthName(prevMk)}. ${fmtINR(diff / 30)} extra a day on average.`
                : `Nice — you spent ${fmtINR(-diff)} less than in ${monthName(prevMk)}.`,
          })
      }
      // avg / projection
      const daysNow = new Date().getDate()
      const isCurrent = mk === monthKey(toISO(new Date()))
      const perDay = total / (isCurrent ? daysNow : daysInMonth(new Date(mk + '-01')))
      const proj = isCurrent ? perDay * daysInMonth(new Date()) : total
      list.push({ icon: '🧮', text: `Daily average: ${fmtINR(perDay)}. At this pace, ${isCurrent ? 'projected month-end spend is ' + fmtINR(proj) : 'the month closed at ' + fmtINR(total)}.` })
      const noSpend = stats.daily.size
      list.push({ icon: '🌱', text: `${noSpend} day${noSpend === 1 ? '' : 's'} had spending this month — ${Math.max(0, daysInMonth(new Date(mk + '-01')) - noSpend)} no-spend days so far.` })
    }
    return list
  }, [stats, slices, mk, data.transactions, months])

  return (
    <Screen title="Analytics & Reports">
      {/* month selector */}
      <div className="chip-row" style={{ margin: '0 0 16px -20px', width: 'calc(100% + 40px)' }}>
        {months.map((m) => (
          <button key={m} className={`chip ${mk === m ? 'on' : ''}`} onClick={() => setMk(m)}>
            {monthName(m)}
          </button>
        ))}
      </div>

      {stats.expense === 0 && stats.income === 0 ? (
        <EmptyState
          icon={<span style={{ fontSize: 40 }}>📊</span>}
          title="No data for this month"
          sub="Add transactions to see insights and charts."
        />
      ) : (
        <>
          {/* headline numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="card">
              <div className="small muted" style={{ fontWeight: 600 }}>
                Total income
              </div>
              <div className="serif-num" style={{ fontSize: 21, fontWeight: 800, color: 'var(--success)' }}>
                {fmtINR(stats.income)}
              </div>
            </div>
            <div className="card">
              <div className="small muted" style={{ fontWeight: 600 }}>
                Total spent
              </div>
              <div className="serif-num" style={{ fontSize: 21, fontWeight: 800, color: 'var(--danger)' }}>
                {fmtINR(stats.expense)}
              </div>
            </div>
          </div>

          {/* donut */}
          <div className="card section">
            <h3 className="h3" style={{ marginBottom: 14 }}>
              Expense breakdown by category
            </h3>
            {slices.length === 0 ? (
              <EmptyState title="No expenses yet" sub="Chart appears once you log expenses." />
            ) : (
              <>
                <DonutChart
                  slices={slices}
                  centerTop="Total spent"
                  centerMain={fmtINR(stats.expense, { compact: true })}
                  centerSub={monthName(mk)}
                />
                <div style={{ marginTop: 6 }}>
                  {[...slices].sort((a, b) => b.value - a.value).map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                      <i style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                      <span className="grow" style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {s.label}
                      </span>
                      <span className="small muted serif-num">{Math.round((s.value / stats.expense) * 100)}%</span>
                      <span className="serif-num" style={{ fontWeight: 700, fontSize: 13.5 }}>
                        {fmtINR(s.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* income vs expense bars */}
          <div className="card section">
            <div className="section-title">
              <h3 className="h3">Income vs expenses</h3>
              <Legend
                items={[
                  { label: 'Income', color: 'var(--primary)' },
                  { label: 'Expense', color: '#e8a09a' },
                ]}
              />
            </div>
            <BarPairsChart data={barData} />
          </div>

          {/* weekly trend */}
          <div className="card section">
            <div className="section-title">
              <h3 className="h3">Spending by week</h3>
              <span className="chip chip-green">
                <IconTrendUp size={13} /> {monthName(mk)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 130, padding: '6px 4px 0' }} className="serif-num">
              {stats.weeks.map((w, i) => {
                const max = Math.max(...stats.weeks.map((x) => x.value), 1)
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div className="small serif-num" style={{ fontWeight: 700, marginBottom: 6 }}>
                      {w.value ? fmtINR(w.value, { compact: true }) : '—'}
                    </div>
                    <div
                      style={{
                        height: `${Math.max(3, (w.value / max) * 66)}px`,
                        background: i === stats.weeks.findIndex((x) => x.value > 0) ? 'var(--primary)' : 'var(--primary)',
                        opacity: w.value ? 0.95 : 0.25,
                        borderRadius: 8,
                        margin: '0 auto',
                        width: '70%',
                        maxWidth: 44,
                      }}
                    />
                    <div className="small muted" style={{ marginTop: 6, fontWeight: 600 }}>
                      {w.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* insights */}
          <div className="card section" style={{ background: 'var(--primary-tint)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <IconSparkle size={20} color="var(--primary-strong)" />
              <h3 className="h3" style={{ color: 'var(--primary-strong)' }}>
                Insights
              </h3>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, lineHeight: '22px' }}>{ins.icon}</span>
                  <p style={{ fontSize: 13.5, lineHeight: 1.45 }}>{ins.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Screen>
  )
}
