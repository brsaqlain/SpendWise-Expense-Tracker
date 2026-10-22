import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconWallet } from '../icons'

export const Splash: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const nav = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => {
      const seen = localStorage.getItem('spendwise.onboarded') === '1'
      if (!seen) nav('/onboarding', { replace: true })
      else onDone?.()
    }, 2400)
    return () => clearTimeout(t)
  }, [nav, onDone])

  return (
    <div className="splash">
      <div className="logo-mark" style={{ marginBottom: 26 }}>
        <IconWallet size={46} strokeWidth={1.6} />
      </div>
      <div style={{ animation: 'rise 0.7s 0.15s cubic-bezier(0.2,1.1,0.4,1) both' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em' }}>SpendWise</h1>
        <p style={{ marginTop: 8, opacity: 0.9, fontSize: 15.5, fontWeight: 500 }}>
          Understand your money. Own your future.
        </p>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'rgba(255,255,255,0.85)',
          fontSize: 13,
        }}
      >
        <span className="spinner" />
        Setting up your money view…
      </div>
    </div>
  )
}
