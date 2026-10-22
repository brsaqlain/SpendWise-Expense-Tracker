import React, { useMemo, useState } from 'react'
import { useStore, useCategorySpend } from '../store'
import { Screen, Modal, Progress, useToast, EmptyState } from '../components/ui'
import { CATEGORY_META, EXPENSE_CATEGORIES, fmtINR, toISO } from '../utils'
import type { Budget, CategoryId } from '../types'
import { IconPlus, IconEdit, IconTrash, IconAlarm } from '../icons'

export const Budgets: React.FC = () => {
  const { data, setBudget, deleteBudget } = useStore()
  const catSpend = useCategorySpend(monthKeyNow())
  const toast = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formCat, setFormCat] = useState<CategoryId>('food')
  const [formLimit, setFormLimit] = useState('')
  const [delId, setDelId] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const rows = useMemo(
    () =>
      data.budgets.map((b) => {
        const spent = catSpend.get(b.category) || 0
        return { ...b, spent, pct: b.limit ? (spent / b.limit) * 100 : 0 }
      }),
    [data.budgets, catSpend],
  )

  const total = rows.reduce((a, r) => a + r.limit, 0)
  const spent = rows.reduce((a, r) => a + Math.min(r.spent, r.limit), 0)
  const overList = rows.filter((r) => r.spent > r.limit)
  const warnList = rows.filter((r) => r.spent <= r.limit && r.spent >= r.limit * 0.8)

  const openForm = (b?: Budget) => {
    setEditId(b?.id ?? null)
    setFormCat(b?.category ?? 'food')
    setFormLimit(b ? String(b.limit) : '')
    setTouched(false)
    setFormOpen(true)
  }

  const limitNum = parseFloat(formLimit) || 0
  const formError = limitNum <= 0 ? 'Enter a budget limit above ₹0' : ''

  const save = () => {
    if (limitNum <= 0) {
      setTouched(true)
      return
    }
    setBudget(formCat, limitNum, editId ?? undefined)
    toast(editId ? 'Budget updated ✓' : `${CATEGORY_META[formCat].label} budget of ${fmtINR(limitNum)} set ✓`)
    setFormOpen(false)
  }

  return (
    <Screen
      title="Budgets"
      right={
        <button className="back-btn" style={{ width: 40, height: 40 }} onClick={() => openForm()} aria-label="Add budget">
          <IconPlus size={20} />
        </button>
      }
    >
      {/* summary */}
      <div
        className="card card-lg"
        style={{ background: 'linear-gradient(150deg, #0a8f66, #05503a)', color: '#fff', marginBottom: 18 }}
      >
        <div className="small" style={{ opacity: 0.85, fontWeight: 600 }}>
          Monthly budget · October {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0 4px' }}>
          <span className="serif-num" style={{ fontSize: 30, fontWeight: 800 }}>
            {fmtINR(total)}
          </span>
          <span style={{ opacity: 0.75, fontSize: 13 }}>total allocated</span>
        </div>
        <div className="serif-num" style={{ fontSize: 14.5, marginBottom: 12, opacity: 0.95 }}>
          {fmtINR(spent)} spent · <b>{fmtINR(total - spent)}</b> remaining
        </div>
        <div className="progress" style={{ background: 'rgba(255,255,255,.25)' }}>
          <span style={{ width: `${Math.min(100, (spent / Math.max(total, 1)) * 100)}%`, background: '#fff' }} />
        </div>
      </div>

      {/* warnings */}
      {(overList.length > 0 || warnList.length > 0) && (
        <div
          className="card section"
          style={{
            background: overList.length ? 'var(--danger-soft)' : 'var(--warning-soft)',
            border: 'none',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ fontSize: 22, lineHeight: 1 }}>{overList.length ? '🚨' : '⚠️'}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: overList.length ? 'var(--danger)' : 'var(--warning)' }}>
              {overList.length
                ? `${overList.length} budget${overList.length > 1 ? 's' : ''} exceeded!`
                : `${warnList.length} budget${warnList.length > 1 ? 's' : ''} close to the limit`}
            </div>
            <div className="small" style={{ marginTop: 2, color: overList.length ? 'var(--danger)' : 'var(--warning)' }}>
              {overList.length
                ? `${overList.map((r) => CATEGORY_META[r.category].label).join(', ')} — overspent by ${fmtINR(overList.reduce((a, r) => a + (r.spent - r.limit), 0))}.`
                : 'You are near the limit in ' + warnList.map((r) => CATEGORY_META[r.category].label).join(', ') + '.'}
            </div>
          </div>
        </div>
      )}

      {/* per-category */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<span style={{ fontSize: 40 }}>💰</span>}
          title="No budgets set"
          sub="Create your first category budget to control spending."
          action={
            <button className="btn btn-primary" onClick={() => openForm()}>
              <IconPlus size={18} /> Add Budget
            </button>
          }
        />
      ) : (
        <div className="card" style={{ padding: '6px 18px' }}>
          {rows
            .sort((a, b) => b.pct - a.pct)
            .map((r) => {
              const meta = CATEGORY_META[r.category]
              const over = r.spent > r.limit
              const warn = !over && r.pct >= 80
              return (
                <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }} className="row-item">
                  <div className="row-item" style={{ display: 'block', border: 'none', padding: 0, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
                      <div className="icon-badge" style={{ width: 38, height: 38, minWidth: 38, background: meta.soft, fontSize: 19 }}>
                        {meta.emoji}
                      </div>
                      <div className="grow">
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{meta.label}</div>
                        <div className="small serif-num muted">
                          {fmtINR(r.spent)} of {fmtINR(r.limit)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {over ? (
                          <span className="chip chip-red">
                            <IconAlarm size={12} /> +{fmtINR(r.spent - r.limit)}
                          </span>
                        ) : warn ? (
                          <span className="chip chip-warn">{Math.round(r.pct)}%</span>
                        ) : (
                          <span className="chip chip-green serif-num">{Math.round(r.pct)}%</span>
                        )}
                      </div>
                      <button onClick={() => openForm(data.budgets.find((b) => b.id === r.id))} className="back-btn" style={{ width: 34, height: 34, minWidth: 34 }} aria-label={`Edit ${meta.label} budget`}>
                        <IconEdit size={15} color="var(--text-2)" />
                      </button>
                      <button onClick={() => setDelId(r.id)} className="back-btn" style={{ width: 34, height: 34, minWidth: 34 }} aria-label={`Delete ${meta.label} budget`}>
                        <IconTrash size={15} color="var(--danger)" />
                      </button>
                    </div>
                    <Progress pct={r.pct} over={over} />
                    {over && (
                      <div className="small" style={{ color: 'var(--danger)', marginTop: 6, fontWeight: 600 }}>
                        Exceeded limit by {fmtINR(r.spent - r.limit)} — reduce spending or raise the limit.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* budget form modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <h2 className="h2" style={{ marginBottom: 4 }}>
          {editId ? 'Edit budget' : 'Add budget'}
        </h2>
        <p className="muted small" style={{ marginBottom: 18 }}>
          Set a monthly spending limit for a category.
        </p>
        <div className="field-label">Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {EXPENSE_CATEGORIES.map((c) => {
            const exists = data.budgets.some((b) => b.category === c && b.id !== editId)
            const on = formCat === c
            return (
              <button
                key={c}
                className={`chip ${on ? 'on' : ''}`}
                style={{ padding: '8px 14px', opacity: exists && !on ? 0.45 : 1 }}
                onClick={() => setFormCat(c)}
                title={exists ? 'A budget already exists for this category — editing will update it' : undefined}
              >
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </button>
            )
          })}
        </div>
        <div className="field">
          <label className="field-label">Monthly limit (₹)</label>
          <input
            className={`input ${touched && formError ? 'invalid' : ''}`}
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="e.g. 5000"
            value={formLimit}
            onChange={(e) => setFormLimit(e.target.value)}
          />
          {touched && formError && <div className="input-error">{formError}</div>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            {editId ? 'Update' : 'Create'} budget
          </button>
        </div>
      </Modal>

      {/* delete confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗑️</div>
          <h2 className="h2">Remove this budget?</h2>
          <p className="muted small" style={{ marginTop: 6 }}>
            Spending stays in your transactions; only the limit is removed.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDelId(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (delId) deleteBudget(delId)
                toast('Budget removed')
                setDelId(null)
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </Screen>
  )
}

function monthKeyNow() {
  return toISO(new Date()).slice(0, 7)
}
