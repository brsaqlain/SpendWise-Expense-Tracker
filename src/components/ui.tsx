import React, { createContext, useCallback, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconAlarm, IconArrowLeft, IconCheck } from '../icons'

/* ---------- Screen wrapper ---------- */
export const Screen: React.FC<{
  title?: string
  back?: boolean
  right?: React.ReactNode
  children: React.ReactNode
  pad?: boolean
}> = ({ title, back, right, children }) => {
  const nav = useNavigate()
  return (
    <div className="screen" style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
      {(title || back || right) && (
        <div className="page-head">
          {back && (
            <button className="back-btn" onClick={() => nav(-1)} aria-label="Go back">
              <IconArrowLeft size={20} />
            </button>
          )}
          {title && <h1 className="h2 grow">{title}</h1>}
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

/* ---------- Toast ---------- */
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'warn') => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'warn'; id: number } | null>(null)
  const show = useCallback((msg: string, kind: 'ok' | 'warn' = 'ok') => {
    setToast({ msg, kind, id: Date.now() })
    window.setTimeout(() => setToast((t) => (t && t.id === Date.now() - 500 ? null : t)), 300)
    window.setTimeout(() => setToast(null), 2800)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast.kind === 'ok' ? <IconCheck size={19} /> : <IconAlarm size={19} />}
          {toast.msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

/* ---------- Modal / confirm ---------- */
export const Modal: React.FC<{
  open: boolean
  onClose: () => void
  children: React.ReactNode
}> = ({ open, onClose, children }) => {
  if (!open) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}

/* ---------- Progress bar ---------- */
export const Progress: React.FC<{ pct: number; warn?: number; over?: boolean; height?: number }> = ({
  pct,
  warn = 80,
  over = false,
}) => {
  const p = Math.min(100, Math.max(0, pct))
  const cls = over ? 'over' : p >= warn ? 'warn' : ''
  return (
    <div className={`progress ${cls}`} role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${p}%` }} />
    </div>
  )
}

/* ---------- Empty state ---------- */
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; sub?: string; action?: React.ReactNode }> = ({
  icon,
  title,
  sub,
  action,
}) => (
  <div className="empty">
    {icon ?? <div style={{ fontSize: 44, marginBottom: 8 }}>🔍</div>}
    <div className="h3">{title}</div>
    {sub && <div className="small muted" style={{ marginTop: 4 }}>{sub}</div>}
    {action && <div style={{ marginTop: 16 }}>{action}</div>}
  </div>
)

/* ---------- Field ---------- */
export const Field: React.FC<{
  label: string
  error?: string
  children: React.ReactNode
}> = ({ label, error, children }) => (
  <div className="field">
    <label className="field-label">{label}</label>
    {children}
    {error && <div className="input-error">{error}</div>}
  </div>
)

export const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card section ${className}`}>{children}</div>
)
