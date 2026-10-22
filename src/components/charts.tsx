import React, { useMemo } from 'react'

/* ---------- Donut chart ---------- */
interface Slice {
  label: string
  value: number
  color: string
}

export const DonutChart: React.FC<{
  slices: Slice[]
  size?: number
  centerTop?: string
  centerMain?: string
  centerSub?: string
}> = ({ slices, size = 170, centerTop, centerMain, centerSub }) => {
  const total = slices.reduce((a, s) => a + s.value, 0)
  const r = size / 2 - 14
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  let acc = 0

  const arcs = slices
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total
      const dash = frac * circ
      const gap = circ - dash
      const offset = -acc * circ
      acc += frac
      return { dash, gap, offset: offset + circ * 0.25, color: s.color, frac }
    })

  return (
    <div style={{ position: 'relative', width: size, margin: '0 auto' }}>
      <svg width={size} height={size} role="img" aria-label="Expense breakdown donut chart">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={22} />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={22}
            strokeDasharray={`${Math.max(0, a.dash - 2)} ${a.gap + 2}`}
            strokeDashoffset={a.offset}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - (centerSub ? 10 : 0)} textAnchor="middle" fill="var(--text-3)" fontSize={10.5} fontWeight={600}>
          {centerTop}
        </text>
        <text
          x={cx}
          y={cy + (centerSub ? 9 : 7)}
          textAnchor="middle"
          fill="var(--text)"
          fontSize={18}
          fontWeight={800}
        >
          {centerMain}
        </text>
        {centerSub && (
          <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--text-3)" fontSize={10}>
            {centerSub}
          </text>
        )}
      </svg>
    </div>
  )
}

/* ---------- Grouped bar chart (income vs expense) ---------- */
export const BarPairsChart: React.FC<{
  data: { label: string; income: number; expense: number }[]
  height?: number
}> = ({ data, height = 170 }) => {
  const max = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1)
  const W = Math.max(320, data.length * 64)
  const rowH = 26
  const chartH = height - rowH
  const barW = 13

  return (
    <div style={{ overflowX: 'auto' }} className="serif-num">
      <svg width={W} height={height} role="img" aria-label="Income versus expense bar chart">
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={W}
            y1={chartH - chartH * g}
            y2={chartH - chartH * g}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
        ))}
        {data.map((d, i) => {
          const groupW = W / data.length
          const cx = groupW * i + groupW / 2
          const h1 = (d.income / max) * (chartH - 8)
          const h2 = (d.expense / max) * (chartH - 8)
          return (
            <g key={i}>
              <rect
                x={cx - barW - 3}
                y={chartH - h1}
                width={barW}
                height={Math.max(2, h1)}
                rx={4}
                fill="var(--primary)"
              />
              <rect
                x={cx + 3}
                y={chartH - h2}
                width={barW}
                height={Math.max(2, h2)}
                rx={4}
                fill="#f3e2e2"
                stroke="var(--danger)"
                strokeOpacity={0.55}
                strokeWidth={1.2}
                fillOpacity={0.55}
              />
              <text x={cx} y={height - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text-2)">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------- Daily spend area chart ---------- */
export const DailySpendChart: React.FC<{
  days: { day: number; amount: number }[]
  height?: number
}> = ({ days, height = 150 }) => {
  const max = Math.max(...days.map((d) => d.amount), 1)
  const W = 320
  const pad = 6
  const chartH = height - 22

  const { line, area, pts } = useMemo(() => {
    if (days.length < 2) return { line: '', area: '', pts: [] as [number, number][] }
    const pts: [number, number][] = days.map((d, i) => [
      pad + (i / (days.length - 1)) * (W - pad * 2),
      chartH - (d.amount / max) * (chartH - 12),
    ])
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    const area = `${line} L${pts[pts.length - 1][0]},${chartH} L${pts[0][0]},${chartH} Z`
    return { line, area, pts }
  }, [days, max, chartH])

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" role="img" aria-label="Daily spending chart" className="serif-num">
      <defs>
        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#087f5b" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#087f5b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spendGrad)" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {pts.length > 0 && (
        <>
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill="var(--primary)" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={7} fill="var(--primary)" opacity={0.18} />
        </>
      )}
      <text x={2} y={height - 6} fontSize={10} fill="var(--text-3)" fontWeight={600}>
        {days[0]?.day ? `1` : ''}
      </text>
      <text x={W - 8} y={height - 6} fontSize={10} fill="var(--text-3)" fontWeight={600}>
        {days.length}
      </text>
    </svg>
  )
}

/* ---------- Weekly bars ---------- */
export const WeekBars: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 120 }} className="serif-num">
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)' }}>
            {Math.round(d.value) >= 1000 ? '₹' + (d.value / 1000).toFixed(1) + 'k' : '₹' + Math.round(d.value)}
          </span>
          <div
            style={{
              width: '100%',
              maxWidth: 34,
              height: `${(d.value / max) * 82}%`,
              minHeight: 4,
              background: 'var(--primary)',
              opacity: 0.9,
              borderRadius: 8,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Legend ---------- */
export const Legend: React.FC<{ items: { label: string; value?: string; color: string }[] }> = ({ items }) => (
  <div className="chart-legend">
    {items.map((it, i) => (
      <span key={i}>
        <i style={{ background: it.color }} />
        {it.label}
        {it.value !== undefined && <b style={{ color: 'var(--text)' }}>{it.value}</b>}
      </span>
    ))}
  </div>
)
