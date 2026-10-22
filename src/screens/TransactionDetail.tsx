import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Screen, Modal, useToast } from '../components/ui'
import { CategoryBadge } from '../components/TransactionRow'
import { CATEGORY_META, PAYMENT_LABEL, fmtDate, fmtINR } from '../utils'
import { IconEdit, IconTrash, IconNotes } from '../icons'

export const TransactionDetail: React.FC = () => {
  const { id } = useParams()
  const { data, deleteTx } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const tx = useMemo(() => data.transactions.find((t) => t.id === id), [data.transactions, id])

  if (!tx) {
    return (
      <Screen title="Transaction">
        <div className="empty">
          <div className="h3">Transaction not found</div>
          <button className="btn btn-soft" style={{ marginTop: 14 }} onClick={() => nav('/transactions')}>
            Back to transactions
          </button>
        </div>
      </Screen>
    )
  }

  const meta = CATEGORY_META[tx.category]
  const isIncome = tx.type === 'income'

  const del = () => {
    setDeleting(true)
    window.setTimeout(() => {
      deleteTx(tx.id)
      toast('Transaction deleted')
      nav('/transactions')
    }, 500)
  }

  return (
    <Screen back title="Transaction Details">
      <div
        className="card card-lg"
        style={{
          textAlign: 'center',
          color: isIncome ? undefined : undefined,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <CategoryBadge category={tx.category} size={58} />
        </div>
        <div
          className="serif-num"
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: isIncome ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {isIncome ? '+' : '−'}
          {fmtINR(tx.amount)}
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{tx.title}</div>
        <div className="small muted" style={{ marginTop: 4 }}>
          {meta.label} · {isIncome ? 'Income' : 'Expense'}
        </div>
      </div>

      <div className="card section" style={{ padding: '4px 18px' }}>
        {[
          ['Date', fmtDate(tx.date)],
          ['Payment method', PAYMENT_LABEL[tx.payment]],
          ['Category', `${meta.emoji}  ${meta.label}`],
          ['Type', isIncome ? 'Income received' : 'Expense'],
        ].map(([k, v]) => (
          <div key={k} className="row-item" style={{ justifyContent: 'space-between' }}>
            <span className="small muted" style={{ fontWeight: 600 }}>
              {k}
            </span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>

      <div className="card section">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <IconNotes size={17} color="var(--text-3)" />
          <span className="small muted" style={{ fontWeight: 700 }}>
            Notes
          </span>
        </div>
        <p style={{ fontSize: 14 }}>{tx.notes ? tx.notes : <span className="muted">No notes added for this transaction.</span>}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          className="btn btn-soft"
          onClick={() => nav('/add', { state: { tx } })}
        >
          <IconEdit size={18} /> Edit
        </button>
        <button className="btn btn-danger" onClick={() => setConfirm(true)}>
          <IconTrash size={18} /> Delete
        </button>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 20,
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
            }}
          >
            <IconTrash size={27} />
          </div>
          <h2 className="h2">Delete this transaction?</h2>
          <p className="muted small" style={{ marginTop: 8 }}>
            “{tx.title}” ({fmtINR(tx.amount)}) will be permanently removed and your balance will be recalculated.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={deleting}>
              Keep it
            </button>
            <button className="btn btn-danger" onClick={del} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </Screen>
  )
}
