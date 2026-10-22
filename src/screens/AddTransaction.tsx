import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useToast, Screen, Field, Modal } from '../components/ui'
import {
  CATEGORY_META,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_LABEL,
  fmtINR,
  toISO,
} from '../utils'
import type { CategoryId, PaymentMethod, TXType } from '../types'
import { IconCheck, IconCash, IconCard, IconUpi, IconEdit } from '../icons'

const PAYMENTS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'debit', label: 'Debit Card' },
  { id: 'credit', label: 'Credit Card' },
]

export const AddTransaction: React.FC = () => {
  const { addTx, updateTx } = useStore()
  const toast = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const editing = (loc.state as { tx?: import('../types').Transaction } | null)?.tx

  const [type, setType] = useState<TXType>(editing?.type ?? 'expense')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'food')
  const [date, setDate] = useState(editing?.date ?? toISO(new Date()))
  const [payment, setPayment] = useState<PaymentMethod>(editing?.payment ?? 'upi')
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const [touched, setTouched] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const amountNum = useMemo(() => {
    const n = parseFloat(amount)
    return isNaN(n) ? 0 : n
  }, [amount])

  const errors = useMemo(() => {
    const e: { amount?: string; title?: string } = {}
    if (!amountNum || amountNum <= 0) e.amount = 'Enter an amount greater than ₹0'
    else if (amountNum > 1000000) e.amount = 'Amount looks too large — recheck it'
    if (!title.trim()) e.title = 'Add a short description'
    return e
  }, [amountNum, title])

  const valid = Object.keys(errors).length === 0

  const switchType = (t: TXType) => {
    setType(t)
    if (!cats.includes(category))
      setCategory(t === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  }
  const catsNow = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const save = () => {
    setTouched(true)
    if (!valid) return
    setSaving(true)
    window.setTimeout(() => {
      const payload = {
        type,
        category,
        amount: amountNum,
        title: title.trim(),
        date,
        payment,
        notes: notes.trim(),
      }
      if (editing) updateTx(editing.id, payload)
      else addTx(payload)
      setSaving(false)
      setConfirmOpen(false)
      toast(editing ? 'Transaction updated' : `${type === 'income' ? 'Income' : 'Expense'} of ${fmtINR(amountNum)} saved ✓`)
      nav(-1)
    }, 550)
  }

  return (
    <Screen title={editing ? 'Edit Transaction' : 'Add Transaction'}>
      <div className="seg" style={{ marginBottom: 20 }}>
        {(['expense', 'income'] as TXType[]).map((t) => (
          <button
            key={t}
            className={type === t ? 'on' : ''}
            style={type === t && t === 'expense' ? { color: 'var(--danger)' } : type === t ? { color: 'var(--success)' } : undefined}
            onClick={() => switchType(t)}
          >
            {t === 'expense' ? '− Expense' : '+ Income'}
          </button>
        ))}
      </div>

      {/* big amount input */}
      <div style={{ textAlign: 'center', margin: '6px 0 20px' }} className="serif-num">
        <div className="small muted" style={{ fontWeight: 600, marginBottom: 2 }}>
          Amount (₹)
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: touched && errors.amount ? 'var(--danger)' : 'var(--text)',
            transition: 'color .15s ease',
          }}
        >
          ₹{amount ? Number(amount).toLocaleString('en-IN') : '0'}
        </div>
        <input
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          value={amount}
          placeholder="0"
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 260,
            border: '1.5px solid ' + (touched && errors.amount ? 'var(--danger)' : 'var(--border)'),
            borderRadius: 13,
            padding: '10px 14px',
            display: 'block',
            margin: '12px auto 4px',
            outline: 'none',
            background: 'var(--surface)',
            textAlign: 'center',
            fontSize: 15,
          }}
          aria-label="Amount in rupees"
        />
        {touched && errors.amount && <div className="input-error">{errors.amount}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          {[100, 500, 1000].map((q) => (
            <button key={q} className="btn btn-ghost btn-sm" onClick={() => setAmount(String((amountNum || 0) + q))}>
              +{q}
            </button>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => setAmount('')}>
            Clear
          </button>
        </div>
      </div>

      <Field label="Description" error={touched ? errors.title : undefined}>
        <input
          className={`input ${touched && errors.title ? 'invalid' : ''}`}
          placeholder={type === 'income' ? 'e.g. Stipend, freelance project' : 'e.g. Mess dinner, Metro recharge'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <div className="field">
        <label className="field-label">Category</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9 }}>
          {catsNow.map((c) => {
            const meta = CATEGORY_META[c]
            const on = category === c
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  border: '1.5px solid ' + (on ? meta.color : 'var(--border)'),
                  background: on ? meta.soft : 'var(--surface)',
                  borderRadius: 13,
                  padding: '12px 4px 9px',
                  display: 'grid',
                  placeItems: 'center',
                  gap: 3,
                  transition: 'all .15s ease',
                }}
                aria-pressed={on}
              >
                <span style={{ fontSize: 21 }}>{meta.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Field label="Date">
        <input className="input" type="date" max={toISO(new Date())} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <div className="field">
        <label className="field-label">Payment method</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9 }}>
          {PAYMENTS.map((p) => {
            const on = payment === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                style={{
                  border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border)'),
                  background: on ? 'var(--primary-soft)' : 'var(--surface)',
                  color: on ? 'var(--primary-strong)' : 'var(--text-2)',
                  borderRadius: 13,
                  padding: '11px 4px 9px',
                  display: 'grid',
                  placeItems: 'center',
                  gap: 4,
                  transition: 'all .15s ease',
                }}
                aria-pressed={on}
              >
                {p.id === 'cash' ? <IconCash size={19} /> : p.id === 'upi' ? <IconUpi size={19} /> : <IconCard size={19} />}
                <span style={{ fontSize: 10.5, fontWeight: 600 }}>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Field label="Notes (optional)">
        <textarea className="input" placeholder="Any detail to remember later…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <button
        className="btn btn-primary btn-block"
        style={{ marginTop: 4 }}
        onClick={() => {
          setTouched(true)
          if (valid) setConfirmOpen(true)
        }}
      >
        <IconCheck size={18} /> Save Transaction
      </button>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 20,
              background: 'var(--primary-soft)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
              color: 'var(--primary-strong)',
            }}
          >
            {saving ? <span className="spinner" style={{ borderColor: 'var(--primary-soft)', borderTopColor: 'var(--primary-strong)' }} /> : editing ? <IconEdit size={26} /> : <IconCheck size={30} />}
          </div>
          <h2 className="h2">
            {saving ? 'Saving…' : editing ? 'Save changes?' : 'Confirm transaction'}
          </h2>
          <p className="muted small" style={{ marginTop: 8 }}>
            {type === 'expense' ? '−' : '+'}
            {fmtINR(amountNum)} · {CATEGORY_META[category].label} · {PAYMENT_LABEL[payment]}
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Yes, save it'}
            </button>
          </div>
        </div>
      </Modal>
    </Screen>
  )
}
