import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Screen, Modal, useToast } from '../components/ui'
import { fmtINR } from '../utils'
import {
  IconBell,
  IconMoon,
  IconSun,
  IconShield,
  IconCurrency,
  IconLogout,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconWallet,
  IconTarget,
  IconEdit,
} from '../icons'

export const Profile: React.FC = () => {
  const { data, updateSettings, resetAll } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const s = data.settings

  const [editIncome, setEditIncome] = useState(false)
  const [incomeDraft, setIncomeDraft] = useState(String(s.monthlyIncome))
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const initial = s.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Screen title="Profile & Settings">
      {/* profile header */}
      <div className="card card-lg" style={{ textAlign: 'center', marginBottom: 18 }}>
        <div
          className="avatar"
          style={{ width: 72, height: 72, fontSize: 26, margin: '0 auto 12px', borderRadius: 24 }}
        >
          {initial}
        </div>
        <h2 className="h2">{s.name}</h2>
        <div className="small muted" style={{ marginTop: 2 }}>
          {s.email}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <span className="chip chip-green"><IconWallet size={13} /> Student plan</span>
          <span className="chip">Member since Aug 2025</span>
        </div>
      </div>

      {/* income preference */}
      <div className="card section" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div className="icon-badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)' }}>
          <IconTarget size={20} />
        </div>
        <div className="grow">
          <div className="small muted" style={{ fontWeight: 600 }}>
            Monthly income preference
          </div>
          <div className="serif-num" style={{ fontWeight: 700, fontSize: 17 }}>
            {fmtINR(s.monthlyIncome)}
          </div>
        </div>
        <button
          className="btn btn-soft btn-sm"
          onClick={() => {
            setIncomeDraft(String(s.monthlyIncome))
            setEditIncome(true)
          }}
        >
          <IconEdit size={15} /> Edit
        </button>
      </div>

      {/* appearance */}
      <div className="section">
        <div className="section-title">
          <h3 className="h3">Appearance</h3>
        </div>
        <div className="setting-group">
          <div
            className="row-item"
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onClick={() => {
              updateSettings({ theme: s.theme === 'light' ? 'dark' : 'light' })
              toast(s.theme === 'light' ? 'Dark mode on 🌙' : 'Light mode on ☀️')
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLDivElement).click()}
          >
            <div className="icon-badge" style={{ background: s.theme === 'dark' ? 'var(--surface-2)' : 'var(--warning-soft)', color: 'var(--warning)' }}>
              {s.theme === 'dark' ? <IconMoon size={19} /> : <IconSun size={19} />}
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>Dark mode</div>
              <div className="small muted">{s.theme === 'dark' ? 'Enabled' : 'Disabled'}</div>
            </div>
            <div
              className="seg"
              style={{ padding: 3, width: 88 }}
              role="group"
              aria-label="Theme"
              onClick={(e) => e.stopPropagation()}
            >
              <button className={s.theme === 'light' ? 'on' : ''} style={{ padding: '6px 8px' }} onClick={() => updateSettings({ theme: 'light' })}>
                <IconSun size={14} />
              </button>
              <button className={s.theme === 'dark' ? 'on' : ''} style={{ padding: '6px 8px' }} onClick={() => updateSettings({ theme: 'dark' })}>
                <IconMoon size={14} />
              </button>
            </div>
          </div>
          <button
            className="row-item"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => {
              updateSettings({ hideAmounts: !s.hideAmounts })
              toast(!s.hideAmounts ? 'Amounts hidden for privacy' : 'Amounts visible')
            }}
          >
            <div className="icon-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
              {s.hideAmounts ? <IconEyeOff size={19} /> : <IconEye size={19} />}
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>Privacy mode</div>
              <div className="small muted">{s.hideAmounts ? 'Amounts are masked on Home' : 'Show all amounts'}</div>
            </div>
            <span className={`chip ${s.hideAmounts ? 'chip-green' : ''}`}>{s.hideAmounts ? 'On' : 'Off'}</span>
          </button>
          <div className="row-item" style={{ width: '100%' }}>
            <div className="icon-badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)' }}>
              <IconCurrency size={19} />
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>Default currency</div>
              <div className="small muted">Indian Rupee (₹)</div>
            </div>
            <span className="chip chip-green">INR</span>
          </div>
        </div>
      </div>

      {/* notifications */}
      <div className="section">
        <div className="section-title">
          <h3 className="h3">Notifications</h3>
        </div>
        <div className="setting-group">
          <button
            className="row-item"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => {
              updateSettings({ notifications: !s.notifications })
              toast(s.notifications ? 'Notifications muted' : 'Notifications enabled 🔔')
            }}
          >
            <div className="icon-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
              <IconBell size={19} />
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>Transaction alerts</div>
              <div className="small muted">Notify when a transaction is saved</div>
            </div>
            <Toggle on={s.notifications} />
          </button>
          <button
            className="row-item"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => updateSettings({ weeklyReport: !s.weeklyReport })}
          >
            <div className="icon-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
              📊
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>Weekly spending report</div>
              <div className="small muted">Summary every Monday morning</div>
            </div>
            <Toggle on={s.weeklyReport} />
          </button>
        </div>
      </div>

      {/* privacy & danger zone */}
      <div className="section">
        <div className="section-title">
          <h3 className="h3">Privacy & data</h3>
        </div>
        <div className="setting-group">
          <button className="row-item" style={{ width: '100%', textAlign: 'left' }} onClick={() => toast('Your data never leaves this device 🔒')}>
            <div className="icon-badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)' }}>
              <IconShield size={19} />
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>Data & privacy</div>
              <div className="small muted">All data stored locally. No cloud, no tracking.</div>
            </div>
            <IconChevronRight size={17} color="var(--text-3)" />
          </button>
          <button className="row-item" style={{ width: '100%', textAlign: 'left' }} onClick={() => setResetOpen(true)}>
            <div className="icon-badge" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
              ♻️
            </div>
            <div className="grow">
              <div style={{ fontWeight: 600, color: 'var(--danger)' }}>Reset app data</div>
              <div className="small muted">Restore sample data and clear changes</div>
            </div>
          </button>
        </div>
      </div>

      {/* about */}
      <div className="small muted" style={{ textAlign: 'center', padding: '10px 0 14px' }}>
        SpendWise v1.0 · Made for the Finance & Society Lab
        <br />
        UI/UX Design Project · 2026
      </div>

      <button className="btn btn-danger btn-block" onClick={() => setLogoutOpen(true)}>
        <IconLogout size={18} /> Logout
      </button>

      {/* edit income modal */}
      <Modal open={editIncome} onClose={() => setEditIncome(false)}>
        <h2 className="h2" style={{ marginBottom: 6 }}>
          Monthly income
        </h2>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Used to compare spending against expected income.
        </p>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          value={incomeDraft}
          onChange={(e) => setIncomeDraft(e.target.value)}
          aria-label="Monthly income"
        />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => setEditIncome(false)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              updateSettings({ monthlyIncome: Math.max(0, parseFloat(incomeDraft) || 0) })
              setEditIncome(false)
              toast('Monthly income updated ✓')
            }}
          >
            Save
          </button>
        </div>
      </Modal>

      {/* logout confirm */}
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)}>
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
            <IconLogout size={27} />
          </div>
          <h2 className="h2">Log out of SpendWise?</h2>
          <p className="muted small" style={{ marginTop: 8 }}>
            Your transactions and goals stay safely on this device.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setLogoutOpen(false)}>
              Stay
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                localStorage.removeItem('spendwise.onboarded')
                nav('/', { replace: true })
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </Modal>

      {/* reset confirm */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>♻️</div>
          <h2 className="h2">Reset all app data?</h2>
          <p className="muted small" style={{ marginTop: 8 }}>
            Your added transactions, budgets and goals will be erased and sample data restored. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                resetAll()
                setResetOpen(false)
                toast('App data reset ✓')
              }}
            >
              Reset data
            </button>
          </div>
        </div>
      </Modal>
    </Screen>
  )
}

const Toggle: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    style={{
      width: 44,
      height: 26,
      borderRadius: 999,
      background: on ? 'var(--primary)' : 'var(--border)',
      position: 'relative',
      transition: 'background .2s ease',
      flexShrink: 0,
    }}
    role="switch"
    aria-checked={on}
  >
    <span
      style={{
        position: 'absolute',
        top: 3,
        left: on ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.25)',
        transition: 'left .2s cubic-bezier(.22,.9,.3,1)',
      }}
    />
  </span>
)
