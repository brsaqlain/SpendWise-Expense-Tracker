import React, { useState } from 'react'
import { useStore } from '../store'
import { Screen, Modal, Progress, useToast, Field, EmptyState } from '../components/ui'
import { fmtDate, fmtINR, toISO } from '../utils'
import { IconPlus, IconTarget, IconTrash, IconTrophy, IconEdit } from '../icons'

export const Savings: React.FC = () => {
  const { data, addGoal, updateGoal, deleteGoal } = useStore()
  const toast = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [fundId, setFundId] = useState<string | null>(null)
  const [delId, setDelId] = useState<string | null>(null)

  // goal form
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [targetDate, setTargetDate] = useState(toISO(new Date(Date.now() + 180 * 864e5)))
  const [emoji, setEmoji] = useState('🎯')
  const [touched, setTouched] = useState(false)

  // fund form
  const [fundAmt, setFundAmt] = useState('')
  const [fundTouched, setFundTouched] = useState(false)

  const EMOTES = ['🎯', '💻', '🛡️', '🏔️', '📱', '🚗', '🎓', '💍', '🏠', '🎸']

  const targetNum = parseFloat(target) || 0
  const savedNum = parseFloat(saved) || 0
  const fundNum = parseFloat(fundAmt) || 0

  const errors = {
    name: !name.trim() ? 'Give your goal a name' : '',
    target: targetNum <= 0 ? 'Target must be above ₹0' : targetNum < savedNum ? 'Saved amount cannot exceed target' : '',
  }

  const createGoal = () => {
    if (errors.name || errors.target) {
      setTouched(true)
      return
    }
    addGoal({
      name: name.trim(),
      target: targetNum,
      saved: Math.min(savedNum, targetNum),
      targetDate,
      emoji,
    })
    toast(`Goal “${name.trim()}” created ✓`)
    setFormOpen(false)
    setName('')
    setTarget('')
    setSaved('')
    setEmoji('🎯')
    setTouched(false)
  }

  const addFunds = () => {
    const goal = data.goals.find((g) => g.id === fundId)
    if (!goal) return
    if (!fundNum || fundNum <= 0) {
      setFundTouched(true)
      return
    }
    const willReach = goal.saved + fundNum >= goal.target
    updateGoal(goal.id, goal.saved + fundNum)
    toast(willReach && goal.saved < goal.target ? `🎉 Goal “${goal.name}” achieved!` : `${fmtINR(fundNum)} added to ${goal.name} ✓`)
    setFundId(null)
    setFundAmt('')
    setFundTouched(false)
  }

  const totalSaved = data.goals.reduce((a, g) => a + g.saved, 0)
  const totalTarget = data.goals.reduce((a, g) => a + g.target, 0)

  return (
    <Screen
      title="Savings Goals"
      right={
        <button className="back-btn" style={{ width: 40, height: 40 }} onClick={() => setFormOpen(true)} aria-label="Add goal">
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
          Total saved across {data.goals.length} goal{data.goals.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0 12px' }}>
          <span className="serif-num" style={{ fontSize: 30, fontWeight: 800 }}>
            {fmtINR(totalSaved)}
          </span>
          <span style={{ opacity: 0.75, fontSize: 13 }}>of {fmtINR(totalTarget)}</span>
        </div>
        <div className="progress" style={{ background: 'rgba(255,255,255,.25)' }}>
          <span style={{ width: `${totalTarget ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%`, background: '#fff' }} />
        </div>
      </div>

      {data.goals.length === 0 ? (
        <EmptyState
          icon={<IconTarget size={44} />}
          title="No savings goals yet"
          sub="Create a goal for a laptop, trip or emergency fund and watch progress build up."
          action={
            <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
              <IconPlus size={18} /> Add Savings Goal
            </button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {data.goals.map((g) => {
            const pct = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0
            const achieved = g.saved >= g.target
            const daysLeft = Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 864e5)
            return (
              <div className="card" key={g.id} style={achieved ? { border: '1.5px solid var(--primary)' } : undefined}>
                {achieved && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--primary-soft)',
                      color: 'var(--primary-strong)',
                      fontWeight: 700,
                      fontSize: 12,
                      borderRadius: 999,
                      padding: '4px 12px',
                      marginBottom: 10,
                    }}
                  >
                    <IconTrophy size={14} /> Goal achieved!
                  </div>
                )}
                <div style={{ display: 'flex', gap: 13, alignItems: 'center', marginBottom: 12 }}>
                  <div className="icon-badge" style={{ background: achieved ? 'var(--primary-soft)' : 'var(--surface-2)', fontSize: 24 }}>
                    {g.emoji}
                  </div>
                  <div className="grow">
                    <div style={{ fontWeight: 700 }}>{g.name}</div>
                    <div className="small muted serif-num">
                      Target {fmtINR(g.target)} · by {fmtDate(g.targetDate)} ({daysLeft > 0 ? `${daysLeft} days left` : 'past date'})
                    </div>
                  </div>
                  <button className="back-btn" style={{ width: 34, height: 34, minWidth: 34 }} onClick={() => setDelId(g.id)} aria-label={`Delete ${g.name}`}>
                    <IconTrash size={15} color="var(--danger)" />
                  </button>
                </div>
                <Progress pct={pct} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span className="serif-num" style={{ fontWeight: 700, fontSize: 14 }}>
                    {fmtINR(g.saved)}
                    <span className="muted" style={{ fontWeight: 500, fontSize: 12.5 }}>
                      {' '}
                      of {fmtINR(g.target)} · {Math.round(pct)}%
                    </span>
                  </span>
                  <button className="btn btn-soft btn-sm" onClick={() => { setFundId(g.id); setFundAmt(''); setFundTouched(false) }}>
                    <IconPlus size={15} /> Add money
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* goal form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <h2 className="h2" style={{ marginBottom: 16 }}>
          New savings goal
        </h2>
        <Field label="What are you saving for?" error={touched ? errors.name : undefined}>
          <input
            className={`input ${touched && errors.name ? 'invalid' : ''}`}
            placeholder="e.g. MacBook Air, Shimla trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <div className="field">
          <label className="field-label">Pick an icon</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {EMOTES.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 19,
                  borderRadius: 11,
                  border: '1.5px solid ' + (emoji === e ? 'var(--primary)' : 'var(--border)'),
                  background: emoji === e ? 'var(--primary-soft)' : 'var(--surface)',
                  padding: '7px 10px',
                }}
                aria-pressed={emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Target amount (₹)" error={touched ? errors.target : undefined}>
            <input
              className={`input ${touched && errors.target ? 'invalid' : ''}`}
              type="number"
              inputMode="numeric"
              placeholder="50000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
          <Field label="Already saved (₹)" error={touched && targetNum > 0 && savedNum > targetNum ? 'Cannot exceed target' : undefined}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={saved}
              onChange={(e) => setSaved(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Target date">
          <input className="input" type="date" min={toISO(new Date())} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </Field>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => (data.goals.some((g) => g.name === '') ? createGoal() : createGoal())}>
            <IconEdit size={17} /> Create goal
          </button>
        </div>
      </Modal>

      {/* add funds */}
      <Modal open={!!fundId} onClose={() => setFundId(null)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 6 }}>💰</div>
          <h2 className="h2">Add to savings</h2>
          <p className="muted small" style={{ marginTop: 4 }}>{(() => { const g = data.goals.find((x) => x.id === fundId); return g ? `${g.emoji} ${g.name} — saved ${fmtINR(g.saved)} of ${fmtINR(g.target)}` : '' })()}</p>
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <div className="field-label">Amount (₹)</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[500, 1000, 2500].map((v) => (
              <button key={v} className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setFundAmt(String(v))}>
                ₹{v}
              </button>
            ))}
          </div>
          <input
            className={`input ${fundTouched && fundNum <= 0 ? 'invalid' : ''}`}
            type="number"
            inputMode="numeric"
            placeholder="Enter amount"
            value={fundAmt}
            onChange={(e) => setFundAmt(e.target.value)}
          />
          {fundTouched && fundNum <= 0 && <div className="input-error">Enter an amount above ₹0</div>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setFundId(null)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={addFunds}>
            Add money
          </button>
        </div>
      </Modal>

      {/* delete confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>🗑️</div>
          <h2 className="h2">Delete this goal?</h2>
          <p className="muted small" style={{ marginTop: 6 }}>
            Progress and target for this goal will be removed. Your balance is not affected.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setDelId(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (delId) deleteGoal(delId)
                toast('Goal deleted')
                setDelId(null)
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </Screen>
  )
}
