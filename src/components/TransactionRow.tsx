import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_META, PAYMENT_LABEL, fmtINR, relativeDate } from '../utils'
import type { Transaction } from '../types'

export const CategoryBadge: React.FC<{ category: Transaction['category']; size?: number }> = ({
  category,
  size,
}) => {
  const meta = CATEGORY_META[category]
  return (
    <div
      className="icon-badge"
      style={{
        width: size ?? undefined,
        height: size ?? undefined,
        minWidth: size ?? undefined,
        background: meta.soft,
        fontSize: (size ?? 42) * 0.45,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {meta.emoji}
    </div>
  )
}

export const TransactionRow: React.FC<{ tx: Transaction; showDate?: boolean; to?: string }> = ({
  tx,
  showDate = false,
  to,
}) => {
  const nav = useNavigate()
  const isIncome = tx.type === 'income'
  return (
    <button
      className="row-item"
      style={{ width: '100%', textAlign: 'left' }}
      onClick={() => nav(to ?? `/tx/${tx.id}`)}
      aria-label={`${tx.title}, ${fmtINR(tx.amount)}`}
    >
      <CategoryBadge category={tx.category} />
      <div className="grow" style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }} className="ellipsis">
          {tx.title}
        </div>
        <div className="small muted ellipsis">
          {CATEGORY_META[tx.category].label} · {PAYMENT_LABEL[tx.payment]}
          {isIncome ? '' : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          className="serif-num"
          style={{
            fontWeight: 700,
            color: isIncome ? 'var(--success)' : 'var(--text)',
          }}
        >
          {isIncome ? '+' : '-'}
          {fmtINR(tx.amount)}
        </div>
        <div className="small muted serif-num">{showDate ? relativeDate(tx.date) : relativeDate(tx.date)}</div>
      </div>
    </button>
  )
}
